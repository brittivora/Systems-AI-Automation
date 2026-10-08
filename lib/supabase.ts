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

export async function saveSessionAndDispatchWebhook(session: HookSessionData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

  let supabaseRecordId: string | null = null;

  // 1. Persist to Supabase if configured
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("leads")
        .insert({
          source_tool: "linkedin_hook_grader",
          first_name: session.first_name,
          last_name: session.last_name,
          designation: session.designation,
          email: session.email,
          tool_input: session.hook,
          tool_output: JSON.stringify({
            score: session.score,
            rewrites: session.rewrites,
            failed_rules: session.failed_rules,
          }),
          created_at: new Date().toISOString(),
        })
        .select("lead_id, id")
        .single();

      if (error) {
        console.error("Supabase session insert error:", error);
      } else {
        supabaseRecordId = data?.id || data?.lead_id || null;
      }
    } catch (err) {
      console.error("Supabase client connection exception:", err);
    }
  }

  // 2. Dispatch to Make.com Webhook (Task 01 Follow-Up Automation Scenario)
  let webhookDispatched = false;
  if (makeWebhookUrl) {
    try {
      const webhookPayload = {
        event: "new_tool_session",
        source_tool: "linkedin_hook_grader",
        session_id: supabaseRecordId || `local_${Date.now()}`,
        timestamp: new Date().toISOString(),
        lead: {
          first_name: session.first_name,
          last_name: session.last_name,
          full_name: `${session.first_name} ${session.last_name}`.trim(),
          designation: session.designation,
          email: session.email,
        },
        tool_data: {
          hook_input: session.hook,
          grader_score: session.score,
          failed_feedback: session.failed_rules,
          rewrites: session.rewrites,
        },
      };

      const res = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      webhookDispatched = res.ok;
    } catch (whErr) {
      console.error("Make.com webhook dispatch failed:", whErr);
    }
  }

  return {
    supabaseRecordId,
    webhookDispatched,
  };
}
