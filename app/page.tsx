"use client";

import React, { useState } from "react";

interface RuleItem {
  id: string;
  name: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  failureReason?: string;
}

interface RewriteItem {
  angle: string;
  hook: string;
  why_it_works: string;
}

interface GraderResponse {
  score: number;
  passedRules: number;
  totalRules: number;
  rules: RuleItem[];
  failedFeedback: string[];
}

export default function LinkedInHookGrader() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [hookText, setHookText] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [gradeResult, setGradeResult] = useState<GraderResponse | null>(null);
  const [rewrites, setRewrites] = useState<RewriteItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!hookText.trim()) {
      setErrorMsg("Please paste or type the first 1-2 lines of your LinkedIn post.");
      return;
    }
    if (!firstName.trim() || !email.trim()) {
      setErrorMsg("Please enter your name and work email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/grade-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          designation,
          email,
          hookText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grade hook");
      }

      setGradeResult(data.grade);
      setRewrites(data.rewrites || []);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#00DF81] border-[#00DF81]";
    if (score >= 50) return "text-amber-400 border-amber-400";
    return "text-rose-400 border-rose-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "High Performing Hook", bg: "bg-[#00DF81]/10 text-[#00DF81]" };
    if (score >= 50) return { label: "Average (Needs Polish)", bg: "bg-amber-400/10 text-amber-400" };
    return { label: "High Drop-Off Risk", bg: "bg-rose-500/10 text-rose-400" };
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-[#00DF81] selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0E131F]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="https://myntmore.com" className="flex items-center gap-2 group">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#00DF81] transition-colors">
                MYNT<span className="text-[#00DF81]">MORE</span>
              </span>
            </a>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Tool #10
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://myntmore.com/resources/tools"
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:inline-block"
            >
              All 9 Free AI Tools
            </a>
            <a
              href="https://myntmore.com/founder-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-lg bg-[#00DF81] text-black hover:bg-[#00DF81]/90 transition-all shadow-sm"
            >
              Book a Strategy Call
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00DF81] text-xs font-semibold uppercase tracking-wider mb-4">
            Free B2B Hook Audit
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            LinkedIn Hook Grader
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Audit the first two lines of your LinkedIn post before you publish. Scored by 5 strict code rules for click-through rate, plus 3 AI-optimized rewrites.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Details Grid */}
            <div className="border-b border-slate-800/80 pb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Step 1: Your Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00DF81] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mehta"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00DF81] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Designation / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Founder & CEO"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00DF81] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="arjun@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00DF81] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Hook Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Step 2: Paste Your First 1-2 Lines
                </label>
                <span className="text-xs text-slate-500">
                  {hookText.length} chars | {hookText.split(/\r?\n/).filter(l => l.trim().length > 0).length} lines
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={hookText}
                onChange={(e) => setHookText(e.target.value)}
                placeholder="Paste the opening hook here. (Example: 'Most founders spend 4 hours a day prospecting on LinkedIn. Here is the exact system we used to automate qualified sales meetings:')"
                className="w-full px-4 py-3 bg-[#0B0F17] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00DF81] transition-colors font-sans"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Tip: Only paste the text before the LinkedIn "...see more" cutoff (the first 1-2 lines).
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#00DF81] text-black hover:bg-[#00DF81]/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Running Code Rules & Gemini Rewrites...
                </>
              ) : (
                "Grade Hook & Get 3 Rewrites"
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {gradeResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* Score & Summary Card */}
            <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Deterministic Hook Score
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-5xl font-black ${getScoreColor(gradeResult.score)}`}>
                      {gradeResult.score}
                    </span>
                    <span className="text-2xl text-slate-500 font-bold">/ 100</span>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${getScoreBadge(gradeResult.score).bg} border-current`}>
                  {getScoreBadge(gradeResult.score).label}
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  Deterministic Code Rule Breakdown ({gradeResult.passedRules}/{gradeResult.totalRules} Passed)
                </h3>
                <div className="space-y-3">
                  {gradeResult.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-3.5 rounded-xl border text-sm transition-all ${
                        rule.passed
                          ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                          : "bg-rose-950/20 border-rose-800/40 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span>{rule.passed ? "✓" : "✗"}</span>
                          <span className="font-semibold">{rule.name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold">
                          {rule.points}/{rule.maxPoints} pts
                        </span>
                      </div>
                      {!rule.passed && rule.failureReason && (
                        <p className="mt-1.5 text-xs text-rose-400 pl-6 border-l-2 border-rose-500/40">
                          {rule.failureReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Rewrites Card */}
            {rewrites.length > 0 && (
              <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 sm:p-8">
                <div className="mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#00DF81] block mb-1">
                    Gemini 2.5 Flash Structured Output
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    3 High-Converting Hook Rewrites
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Written under strict B2B constraints: No jargon, no em dashes, under 25 words, and tuned for curiosity.
                  </p>
                </div>

                <div className="space-y-4">
                  {rewrites.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-[#00DF81] border border-slate-700">
                          {item.angle}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.hook, idx)}
                          className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          {copiedIndex === idx ? "Copied!" : "Copy Hook"}
                        </button>
                      </div>

                      <p className="text-sm font-medium text-white whitespace-pre-line mb-2">
                        {item.hook}
                      </p>

                      <p className="text-xs text-slate-400 italic">
                        Why it works: {item.why_it_works}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Conversion CTA */}
            <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Need More Qualified B2B Sales Meetings on Your Calendar?
              </h3>
              <p className="text-slate-400 text-sm max-w-xl mx-auto mb-5">
                Myntmore runs your end-to-end outbound engine across cold email and LinkedIn. We turn cold prospects into booked calls.
              </p>
              <a
                href="https://myntmore.com/founder-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-xl bg-[#00DF81] text-black font-bold text-sm hover:bg-[#00DF81]/90 transition-all shadow-lg shadow-emerald-500/20"
              >
                Book a Free Strategy Call (myntmore.com/founder-meeting)
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0E131F] py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 Myntmore. Built for founders who want predictable pipeline, not promises.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="https://myntmore.com" className="hover:text-slate-300">Home</a>
            <a href="https://myntmore.com/resources/tools" className="hover:text-slate-300">Free Tools</a>
            <a href="https://myntmore.com/founder-meeting" className="hover:text-slate-300">Book Meeting</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
