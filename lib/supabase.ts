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
  const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
  const makeWebhookApiKey = process.env.MAKE_WEBHOOK_API_KEY;

  if (!makeWebhookUrl) {
    throw new Error("MAKE_WEBHOOK_URL is not configured.");
  }

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

  const response = await fetch(makeWebhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(webhookPayload),
  });

  if (!response.ok) {
    throw new Error(
      `Make webhook failed with status ${response.status}.`
    );
  }

  return {
    webhookDispatched: true,
  };
}
