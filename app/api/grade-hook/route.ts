import { NextRequest, NextResponse } from "next/server";
import { gradeLinkedInHook } from "@/lib/grader";
import { generateHookRewrites } from "@/lib/gemini";
import { saveSessionAndDispatchWebhook } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, designation, email, hookText } = body;

    if (!hookText || typeof hookText !== "string" || hookText.trim().length === 0) {
      return NextResponse.json(
        { error: "Hook text is required." },
        { status: 400 }
      );
    }

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Contact details (First Name and Email) are required." },
        { status: 400 }
      );
    }

    // Step 1: Code-based deterministic evaluation (Not AI)
    const gradeResult = gradeLinkedInHook(hookText);

    // Step 2: Gemini 2.5 Flash Structured Rewrites (Structured JSON Schema)
    const rewritesResult = await generateHookRewrites(
      hookText,
      `${firstName} ${lastName || ""}`.trim(),
      designation
    );

    // Step 3: Save to Supabase and send to Make.com Webhook
    const persistenceStatus = await saveSessionAndDispatchWebhook({
      first_name: firstName,
      last_name: lastName || "",
      designation: designation || "Professional",
      email,
      hook: hookText,
      score: gradeResult.score,
      rewrites: rewritesResult.rewrites,
      failed_rules: gradeResult.failedFeedback,
    });

    return NextResponse.json({
      success: true,
      grade: gradeResult,
      rewrites: rewritesResult.rewrites,
      persistence: persistenceStatus,
    });
  } catch (error: any) {
    console.error("API error in grade-hook:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
