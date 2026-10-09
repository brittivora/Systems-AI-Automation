# Myntmore Tool #10: LinkedIn Hook Grader

Paste the first two lines of a LinkedIn post. Get a score out of 100, a line explaining each rule you failed, and three rewrites. Every session is saved to Supabase and sent to the lead-follow-up scenario in Make.com.

**Live app:** `PASTE YOUR PUBLIC VERCEL LINK HERE`
**Stack:** Next.js 14 (App Router, TypeScript, Tailwind) on Vercel, Supabase, Make.com, Gemini 2.5 Flash

## How it works

```
Visitor  ->  form + hook  ->  POST /api/grade-hook
                                 1. validate input
                                 2. score with code (5 rules)      <- no AI, same hook = same score
                                 3. Gemini writes 3 rewrites       <- structured JSON (responseSchema)
                                 4. code checks the rewrites       <- dashes, jargon, invented numbers, length
                                 5. save row in Supabase (hook_sessions)
                                 6. POST to Make.com webhook       -> Task 01 scoring + follow-up
                              <-  score, failed-rule lines, rewrites
```

Steps 5 and 6 can fail without breaking the visitor's result. The failure is logged, and the row records `webhook_status`.

## The score (code, not AI)

Five rules, 20 points each. The same hook always gets the same score.

| # | Rule | Passes when |
|---|---|---|
| 1 | Length | 30 to 210 characters, so it fits before "see more" on mobile |
| 2 | Skimmable | At most 2 lines, and not one dense block |
| 3 | Stop-scroll trigger | Has a number, a question, or a curiosity word (whole-word match) |
| 4 | No clichés | No "excited to announce", "game-changer", "synergy" and similar |
| 5 | Open loop | Has a contrast or setup word ("but", "instead", "here is") or a colon/arrow |

Each failed rule returns one plain-English line saying how to fix it.

## The rewrites (Gemini 2.5 Flash)

Three hooks: **Contrarian**, **Specific outcome**, **Story**. The response is forced into JSON with `responseSchema`. The writing rules from Task 01 are then **enforced in code**, not just requested in the prompt:

- no em dashes (auto-replaced)
- at most 2 lines and 25 words
- no number that is not in the visitor's original hook
- no jargon from a banned list

A rewrite that breaks a rule triggers one retry. If Gemini is down, the app says so. It never shows made-up rewrites.

## Run locally

```bash
npm install
cp .env.example .env.local     # fill in the values
npm run dev                    # http://localhost:3000
```

## Set up Supabase

Run `supabase/schema.sql` in the Supabase SQL editor. It creates the `hook_sessions` table (one row per session).

## Set up the Make.com webhook

1. In Make, add **Webhooks > Custom webhook** as the first module and copy its URL into `MAKE_WEBHOOK_URL`.
2. Submit the form once so Make learns the data structure.

Payload sent to Make:

```json
{
  "session_id": "uuid from Supabase",
  "source_tool": "linkedin_hook_grader",
  "first_name": "Asha", "last_name": "Rao", "designation": "Founder", "email": "asha@company.com",
  "tool_input": "<the hook>",
  "tool_output": "Hook score 80/100. Rewrites: ... | ... | ...",
  "hook": "<the hook>", "score": 80,
  "failed_rules": ["..."],
  "rewrites": [{ "angle": "...", "hook": "...", "why_it_works": "..." }]
}
```

`first_name`, `last_name`, `designation`, `email`, `tool_input` and `tool_output` use the same names as the `leads` table, so the scenario can add the lead and score it like any other.

## Deploy to Vercel

1. Push this repo to GitHub, then **Import** it in Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy, then open **Settings > Deployment Protection** and turn **Vercel Authentication off**. If you skip this, anyone who opens your link sees a Vercel login page instead of the app.
4. Use the **production domain** (for example `your-app.vercel.app`) as the public link, not a per-deployment URL.

## Test it

- Hook `I lost 3 clients in one week.` / `Here is the mistake you can avoid.` should score 100.
- Hook `Thrilled to share that our team launched a new product.` should score under 50 and list the failed rules.
- Submit twice with the same hook: the score must match.
- Check Supabase for the new row and Make for the incoming webhook run.

## Known limits

- The rate limit (5 requests a minute per IP) is per server instance, so it is a basic guard, not a hard cap.
- The scoring rules are heuristics. They check structure, not whether the hook is actually good.
- Gemini's free tier can rate-limit under load. The app then shows the score without rewrites.

## Structure

```
app/page.tsx                 form, tool and results UI
app/api/grade-hook/route.ts  validation, orchestration
lib/grader.ts                the 5 scoring rules
lib/gemini.ts                rewrites + writing-rule checks
lib/supabase.ts              save session + Make webhook
supabase/schema.sql          table definition
```
