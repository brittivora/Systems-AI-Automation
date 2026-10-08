# Myntmore — Tool #10: LinkedIn Hook Grader

The 10th free AI lead magnet for [Myntmore.com](https://myntmore.com/resources/tools). Built with Next.js (App Router), deployed on Vercel, integrated with Supabase, Make.com webhook automation, and Google Gemini 2.5 Flash.

---

## 🚀 Live Demo & Repository
- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Live Deployment**: Ready to deploy on Vercel with 1-click
- **Integrations**: 
  - **Database**: Supabase (`leads` table)
  - **Automation Engine**: Make.com / n8n Webhook (routes session to Task 01 scenario)
  - **AI Model**: Google Gemini 2.5 Flash (`responseSchema` structured JSON)

---

## 🧠 Key Technical Features

### 1. Deterministic Code-Based Scoring (Not AI)
The hook grader scores the user's input strictly using code logic across 5 deterministic rules (Total: 100 points). **The same hook will always receive the exact same score and failure line items:**

1. **Character Count & Mobile Cutoff (20 pts)**: Must be 30–210 characters so it fits before LinkedIn's mobile "...see more" fold without truncation.
2. **Line Count & Skimmability (20 pts)**: Strictly 1–2 lines. Dense blocks lacking punctuation fail.
3. **Stop-Scroll Pattern (20 pts)**: Must feature a metric/number, a question, or a proven curiosity opener.
4. **Zero Corporate Clichés (20 pts)**: Disqualifies self-serving buzzwords ("excited to announce", "game-changer", "synergy").
5. **Curiosity Gap / Tension (20 pts)**: Enforces an unresolved loop or contrast forcing readers to expand the post.

### 2. Structured AI Rewrites via Gemini 2.5 Flash
Invokes Google Gemini with strict `responseSchema` constraints to return exactly 3 hooks:
- **Contrarian / Unpopular Opinion**
- **Data & Outcome-Driven**
- **Story & Open Loop**
*Writing constraints enforced*: No jargon, no em dashes, under 25 words per hook, no invented metrics.

### 3. Lead Capture & Automation Dispatch
Every session stores the contact details (`first_name`, `last_name`, `designation`, `email`), hook input, score, and rewrites into Supabase, and immediately fires an HTTP payload to the Make.com webhook for Task 01 scoring and routing.

---

## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/myntmore-linkedin-hook-grader.git
   cd myntmore-linkedin-hook-grader
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your_webhook_id
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Vercel Deployment
1. Import repository to [Vercel](https://vercel.com).
2. Add the environment variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MAKE_WEBHOOK_URL`).
3. Deploy!
