# LinkedIn Hook Grader (Myntmore Tool #10)

A visitor pastes the first two lines of a LinkedIn post and gets a score out of 100, one line for each rule the hook failed, and three rewrites. Each session is sent to Make.com, which saves it in Supabase.

- **Live app:** https://systems-ai-automation.vercel.app/
- **Walkthrough (Loom):** https://www.loom.com/share/6bed8a985dbd41ab90e7eccb052c912f
- **Stack:** Next.js 14 (App Router, TypeScript, Tailwind CSS), Gemini via `@google/generative-ai`, Make.com webhook, Supabase, Vercel

## How it works

```
Browser form  ->  POST /api/grade-hook
                    1. check that hook, email and first name are present
                    2. score the hook with code            (lib/grader.ts, no AI)
                    3. ask Gemini for 3 rewrites as JSON   (lib/gemini.ts)
                    4. POST the session to a Make webhook  (lib/supabase.ts)
                 <- score, failed-rule lines, rewrites
Make scenario: Webhook -> Supabase "Create a Row"
```

The screen is a single page (`app/page.tsx`) with the contact form, the hook box, and the results. The API route is `app/api/grade-hook/route.ts`.

## The score (code, not AI)

Five rules worth 20 points each. The same hook always gets the same score, because the rules are plain if-statements.

| Rule | Passes when |
|---|---|
| Length | 30 to 210 characters, so it fits before "see more" on mobile |
| Structure | At most 2 lines, and not one long block with no punctuation |
| Stop-scroll trigger | Has a number, a question mark, or a curiosity word such as "why", "never" or "mistake" |
| No clichés | No phrases like "thrilled to share", "excited to announce" or "game-changer" |
| Open loop | Has a tension word ("but", "instead", "here is", "without") or a colon or arrow |

Each failed rule returns one sentence explaining how to fix it.

## The rewrites (Gemini)

`lib/gemini.ts` sends the hook to Gemini and forces the reply into JSON with `responseSchema`. It returns three items, each with `angle`, `hook` and `why_it_works`. The three angles are contrarian, data-and-outcome, and story. The writing rules (no jargon, no em dashes, no outrageous claims, at most 2 lines and 25 words) are given to the model in the prompt.

## Data sent to Make

```json
{
  "name": "Full Name",
  "designation": "Founder",
  "email": "name@company.com",
  "hook": "the pasted hook",
  "score": 80,
  "failed_rules": ["..."],
  "rewrites": [{ "angle": "...", "hook": "...", "why_it_works": "..." }]
}
```

The Make scenario ("Task 02 LinkedIn Hook Grader to Supabase") has two modules: a custom webhook that receives this, and a Supabase "Create a Row" that saves it.

## Run locally

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run dev                    # http://localhost:3000
```

| Variable | Used for |
|---|---|
| `GEMINI_API_KEY` | Gemini rewrites (free key from Google AI Studio) |
| `MAKE_WEBHOOK_URL` | The Make webhook that receives each session |
| `MAKE_WEBHOOK_API_KEY` | Optional, only if the Make webhook has an API key |

`.env.example` also lists the Supabase variables. The app itself does not use them, because Make does the saving.

## Deploy

Push to GitHub, import the repo in Vercel, add the variables above in Settings > Environment Variables, and deploy. Turn off Vercel's Deployment Protection so the link is public.


- **Rule matching.** Keyword rules match pieces of words (for example, "how" inside "show"), so whole-word matching would be more accurate.
- **Input checks.** There is no email format check, no length limit, and no rate limit.
