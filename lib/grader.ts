export interface RuleResult {
  id: string;
  name: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  failureReason?: string;
}

export interface HookGradeResult {
  score: number;
  passedRules: number;
  totalRules: number;
  rules: RuleResult[];
  failedFeedback: string[];
}

/**
 * Deterministic LinkedIn Hook Grader Engine
 * Evaluates the first 1-2 lines of a LinkedIn post based on 5 strict code rules.
 * Same input will ALWAYS yield the exact same score and failure explanations.
 */
export function gradeLinkedInHook(hookText: string): HookGradeResult {
  const cleanHook = hookText.trim();
  const charCount = cleanHook.length;
  const lines = cleanHook.split(/\r?\n/).filter(line => line.trim().length > 0);
  const lower = cleanHook.toLowerCase();

  const rules: RuleResult[] = [];

  // RULE 1: Character Length Constraint (20 Points)
  // Optimal LinkedIn hook before the "...see more" cutoff is 40 to 190 characters.
  let r1Passed = true;
  let r1Reason: string | undefined;
  if (charCount < 30) {
    r1Passed = false;
    r1Reason = "Too short: Under 30 characters does not provide enough substance or context to hook a reader.";
  } else if (charCount > 210) {
    r1Passed = false;
    r1Reason = `Too long (${charCount} characters): Exceeds 210 characters and will be cut off mid-thought on mobile before the "...see more" button.`;
  }
  rules.push({
    id: "length_check",
    name: "Character Count & Mobile Cutoff",
    passed: r1Passed,
    points: r1Passed ? 20 : 0,
    maxPoints: 20,
    failureReason: r1Reason,
  });

  // RULE 2: Structure & Skimmability (20 Points)
  // Must be 1 or 2 punchy lines; single dense wall of text (>130 chars with no break) fails.
  let r2Passed = true;
  let r2Reason: string | undefined;
  if (lines.length > 2) {
    r2Passed = false;
    r2Reason = `Too many lines (${lines.length} lines): A hook must strictly be the first 1-2 lines before the fold.`;
  } else if (lines.length === 1 && charCount > 130 && !cleanHook.includes(".") && !cleanHook.includes(":")) {
    r2Passed = false;
    r2Reason = "Dense text block: Lacks punctuation or line breaks, making it harder to skim on mobile feeds.";
  }
  rules.push({
    id: "structure_check",
    name: "Line Count & Skimmability",
    passed: r2Passed,
    points: r2Passed ? 20 : 0,
    maxPoints: 20,
    failureReason: r2Reason,
  });

  // RULE 3: Stop-Scroll Trigger (20 Points)
  // Must include a number/metric, a question, or a proven curiosity opener.
  const hasNumber = /\b\d+(\%|k|m|x|\+)?\b/i.test(cleanHook);
  const hasQuestion = cleanHook.includes("?");
  const curiosityKeywords = [
    "how", "why", "stop", "never", "nobody", "truth", "mistake", "lesson",
    "secret", "framework", "playbook", "hard truth", "dont", "don't", "most founders",
    "most people", "unpopular opinion", "hot take", "steals", "if you want", "what if"
  ];
  const hasCuriosityTrigger = curiosityKeywords.some(keyword => lower.includes(keyword));
  const r3Passed = hasNumber || hasQuestion || hasCuriosityTrigger;
  rules.push({
    id: "trigger_check",
    name: "Stop-Scroll Trigger (Data, Question, or Contrarian Angle)",
    passed: r3Passed,
    points: r3Passed ? 20 : 0,
    maxPoints: 20,
    failureReason: r3Passed ? undefined : "Missing stop-scroll trigger: Open with a specific metric, a provocative question, or a contrarian angle.",
  });

  // RULE 4: Zero Corporate Buzzwords & Cliché Fluff (20 Points)
  // Flags self-serving LinkedIn corporate jargon that causes immediate feed fatigue.
  const buzzwordRegex = /\b(excited to announce|thrilled to share|humbled and honored|delighted to|synergy|paradigm shift|game-changer|game changer|blessed to|in today's fast-paced world|in todays fast-paced world|proud to share|deep dive|seamlessly)\b/i;
  const hasBuzzwords = buzzwordRegex.test(cleanHook);
  const r4Passed = !hasBuzzwords;
  rules.push({
    id: "buzzword_check",
    name: "Zero Corporate Clichés & Self-Congratulation",
    passed: r4Passed,
    points: r4Passed ? 20 : 0,
    maxPoints: 20,
    failureReason: r4Passed ? undefined : "Cliché fluff detected: Remove self-serving phrases ('excited to announce', 'game-changer', etc.) that lose reader attention.",
  });

  // RULE 5: Curiosity Gap & Tension (20 Points)
  // Must build an open loop or tension (e.g. contains 'here is', 'but', 'yet', 'instead', 'until', 'except', ':', '?', '->').
  const tensionMarkers = ["here's", "heres", "here is", "but", "yet", "instead", "until", "except", "without", "what happened", "the catch", "below", ":", "->", "→", "?"];
  const hasTension = tensionMarkers.some(marker => lower.includes(marker));
  const r5Passed = hasTension;
  rules.push({
    id: "tension_check",
    name: "Curiosity Gap & Open Loop",
    passed: r5Passed,
    points: r5Passed ? 20 : 0,
    maxPoints: 20,
    failureReason: r5Passed ? undefined : "Lacks a curiosity gap: End the 2nd line with an open loop, contrast, or colon to force the '...see more' click.",
  });

  const totalScore = rules.reduce((acc, r) => acc + r.points, 0);
  const passedRules = rules.filter(r => r.passed).length;
  const failedFeedback = rules.filter(r => !r.passed).map(r => r.failureReason || `${r.name} failed.`);

  return {
    score: totalScore,
    passedRules,
    totalRules: rules.length,
    rules,
    failedFeedback,
  };
}
