import { createClient } from "@supabase/supabase-js";
import { RewriteItem } from "./gemini";

export interface HookSessionData {
  first_name: string;
  last_name: string;
  designation: string;
  email: string;
  hook: string;
  score: number;
  rewrites: RewriteItem[];
  failed_rules: string[];
}

export async function saveSessionAndDispatchWebhook(
  session: HookSessionData
) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
  const makeWebhookApiKey = process.env.MAKE_WEBHOOK_API_KEY;

  let supabaseRecordId: string | null = null;

  // 1. Save ONE complete Hook Grader session to hook_grader_sessions
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from("hook_grader_sessions")
        .insert({
          name: `${session.first_name} ${session.last_name}`.trim(),
          designation: session.designation,
          email: session.email,
          hook: session.hook,
          score: session.score,
          failed_rules: session.failed_rules,
          rewrites: session.rewrites,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Supabase session insert error:", error);
      } else {
        supabaseRecordId = data?.id || null;
      }
    } catch (err) {
      console.error("Supabase client connection exception:", err);
    }
  }

  // 2. Send the same session to the Task 02 Make webhook
  let webhookDispatched = false;

  if (makeWebhookUrl) {
    try {
      const webhookPayload = {
        name: `${session.first_name} ${session.last_name}`.trim(),
        designation: session.designation,
        email: session.email,
        hook: session.hook,
        score: session.score,
        failed_rules: session.failed_rules,
        rewrites: session.rewrites,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (makeWebhookApiKey) {
        headers["x-make-apikey"] = makeWebhookApiKey;
      }

      const res = await fetch(makeWebhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(webhookPayload),
      });

      webhookDispatched = res.ok;

      if (!res.ok) {
        console.error(
          "Make webhook returned:",
          res.status,
          await res.text()
        );
      }
    } catch (whErr) {
      console.error("Make.com webhook dispatch failed:", whErr);
    }
  }

  return {
    supabaseRecordId,
    webhookDispatched,
  };
}
