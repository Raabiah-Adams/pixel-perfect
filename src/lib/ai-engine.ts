/**
 * Client-side "AI" generation engine.
 * Produces contextual, realistic demo output from the user's selections.
 * No network calls, no external APIs.
 */

export type Audience = "Client" | "Manager" | "Team" | "Colleague" | "Other";
export type Tone = "Formal" | "Friendly" | "Persuasive";
export type Purpose =
  | "Meeting Request"
  | "Follow-up"
  | "Apology"
  | "Project Update"
  | "Request"
  | "Thank You"
  | "Custom";

export interface EmailInput {
  audience: Audience;
  tone: Tone;
  purpose: Purpose;
  details: string;
  outcome: string;
}

const capitalise = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const firstSentence = (text: string) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const match = clean.match(/[^.!?\n]+[.!?]?/);
  return (match ? match[0] : clean).trim().replace(/[.!?]$/, "");
};

export const splitLines = (text: string) =>
  text
    .split(/\r?\n|;|•/)
    .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);

const pick = <T,>(arr: T[], seed: number): T => arr[Math.abs(seed) % arr.length] as T;

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
};

const greetings: Record<Audience, string[]> = {
  Client: ["Dear {name},", "Hello {name},", "Good day {name},"],
  Manager: ["Hi {name},", "Hello {name},", "Good morning {name},"],
  Team: ["Hi team,", "Hi everyone,", "Morning all,"],
  Colleague: ["Hi {name},", "Hey {name},", "Hi there,"],
  Other: ["Hello,", "Hi {name},", "Good day,"],
};

const closings: Record<Tone, string[]> = {
  Formal: ["Kind regards,", "Sincerely,", "Best regards,"],
  Friendly: ["Thanks so much,", "Cheers,", "Talk soon,"],
  Persuasive: ["Looking forward to your thoughts,", "Appreciatively,", "Best regards,"],
};

const subjectFor = (purpose: Purpose, topic: string, tone: Tone, seed: number) => {
  const t = topic || "our current work";
  const options: Record<Purpose, string[]> = {
    "Meeting Request": [`Meeting request: ${t}`, `Quick sync on ${t}?`, `Time to align on ${t}`],
    "Follow-up": [`Following up on ${t}`, `Checking in: ${t}`, `Next steps on ${t}`],
    Apology: [`Apologies regarding ${t}`, `Sorry for the delay on ${t}`, `Making this right: ${t}`],
    "Project Update": [`Project update: ${t}`, `Progress report — ${t}`, `Where we stand on ${t}`],
    Request: [`Request: ${t}`, `Could you help with ${t}?`, `Support needed on ${t}`],
    "Thank You": [`Thank you — ${t}`, `Much appreciated: ${t}`, `Grateful for your help with ${t}`],
    Custom: [`Regarding ${t}`, `A note about ${t}`, `${capitalise(t)}`],
  };
  const base = pick(options[purpose], seed + (tone === "Persuasive" ? 1 : 0));
  return capitalise(base);
};

const openerFor = (purpose: Purpose, tone: Tone, audience: Audience, topic: string) => {
  const warm = tone === "Friendly" ? "Hope your week is going well. " : "";
  const t = topic || "the work we have in progress";
  switch (purpose) {
    case "Meeting Request":
      return `${warm}I'd like to arrange a short meeting to discuss ${t} so we can agree on the approach before it moves any further.`;
    case "Follow-up":
      return `${warm}I'm following up on ${t} to make sure nothing is waiting on my side and that we're still aligned on timing.`;
    case "Apology":
      return `${warm}I want to apologise for ${t}. It fell short of the standard you should expect${audience === "Client" ? " from us" : ""}, and I've taken steps to correct it.`;
    case "Project Update":
      return `${warm}Here's a concise update on ${t}, covering progress, what's next and anything that needs a decision.`;
    case "Request":
      return `${warm}I'd like to ask for your support with ${t}. It's a small ask, but it would unblock the next stage of work.`;
    case "Thank You":
      return `${warm}Thank you sincerely for your help with ${t}. It made a noticeable difference to how smoothly things went.`;
    default:
      return `${warm}I'm writing regarding ${t} and wanted to share the relevant context with you directly.`;
  }
};

const toneBridge = (tone: Tone, audience: Audience) => {
  if (tone === "Persuasive")
    return audience === "Client"
      ? "Acting on this now keeps the timeline intact and avoids rework later, which protects both budget and delivery quality."
      : "Moving on this now is the lowest-cost moment to do it — later in the cycle it becomes noticeably more expensive to change.";
  if (tone === "Friendly")
    return "No pressure at all if the timing is tricky — I'd just rather keep you in the loop early than surprise you later.";
  return "I've summarised the essentials below so the relevant points are easy to review at a glance.";
};

export function generateEmail(input: EmailInput): string {
  const seed = hash(input.details + input.audience + input.tone + input.purpose + Math.random().toString());
  const topic = firstSentence(input.details).toLowerCase();
  const details = splitLines(input.details).slice(1, 5);
  const name =
    input.audience === "Client"
      ? "Ms Bennett"
      : input.audience === "Manager"
        ? "Sarah"
        : input.audience === "Colleague"
          ? "Daniel"
          : "there";

  const greeting = pick(greetings[input.audience], seed).replace("{name}", name);
  const closing = pick(closings[input.tone], seed);
  const subject = subjectFor(input.purpose, topic, input.tone, seed);

  const bullets =
    details.length > 0
      ? `\n${details.map((d) => `• ${capitalise(d)}`).join("\n")}\n`
      : "";

  const ask = input.outcome.trim()
    ? `\nWhat would help most: ${firstSentence(input.outcome)}.`
    : input.purpose === "Meeting Request"
      ? "\nCould you let me know two or three times that suit you this week?"
      : "\nCould you let me know if you're happy for me to proceed on that basis?";

  const body = [
    openerFor(input.purpose, input.tone, input.audience, topic),
    bullets.trim() ? `Key points:${bullets}` : "",
    toneBridge(input.tone, input.audience),
    ask.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");

  return `Subject: ${subject}\n\n${greeting}\n\n${body}\n\n${closing}\nRaabiah\nAI Workplace Productivity Assistant`;
}

/* ---------------- Task planner ---------------- */

export type PlanMode = "Today" | "This Week";
export type BreakPreference = "Minimal" | "Balanced" | "Frequent";
export type Priority = "High" | "Medium" | "Low";

export interface PlanInput {
  mode: PlanMode;
  start: string;
  end: string;
  breaks: BreakPreference;
  tasks: string;
  priority: Priority;
}

export interface PlanBlock {
  id: string;
  time: string;
  title: string;
  priority: Priority | "Break" | "Focus";
  duration: string;
  note: string;
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const toLabel = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${suffix}`;
};

const classify = (task: string, index: number, fallback: Priority): Priority => {
  const t = task.toLowerCase();
  if (/urgent|deadline|client|proposal|present|report|launch/.test(t)) return "High";
  if (/email|reply|admin|tidy|file|expense/.test(t)) return "Low";
  if (index === 0) return fallback;
  return index < 3 ? "Medium" : fallback;
};

const durationFor = (task: string, priority: Priority) => {
  const t = task.toLowerCase();
  if (/meeting|call|standup|sync/.test(t)) return 45;
  if (/email|reply/.test(t)) return 30;
  if (priority === "High") return 90;
  return 60;
};

const noteFor = (task: string, priority: Priority) => {
  const t = task.toLowerCase();
  if (/email|reply/.test(t)) return "Batched into a single pass — close the inbox afterwards.";
  if (/meeting|call|sync/.test(t)) return "Bring a two-line agenda so it ends on time.";
  if (priority === "High") return "Deep focus block: notifications off, phone face down.";
  return "Good candidate for a lower-energy part of the day.";
};

export function generatePlan(input: PlanInput): { blocks: PlanBlock[]; insights: string[]; focus: string[] } {
  const tasks = splitLines(input.tasks);
  let cursor = toMinutes(input.start || "09:00");
  const endMins = toMinutes(input.end || "17:00");
  const blocks: PlanBlock[] = [];

  const ordered = [...tasks]
    .map((t, i) => ({ t, p: classify(t, i, input.priority) }))
    .sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 } as const;
      return rank[a.p] - rank[b.p];
    });

  const breakEvery = input.breaks === "Frequent" ? 1 : input.breaks === "Balanced" ? 2 : 3;
  const breakLen = input.breaks === "Frequent" ? 10 : input.breaks === "Balanced" ? 15 : 20;

  ordered.forEach((item, i) => {
    if (cursor >= endMins) return;
    const dur = Math.min(durationFor(item.t, item.p), endMins - cursor);
    blocks.push({
      id: `t-${i}`,
      time: `${toLabel(cursor)} – ${toLabel(cursor + dur)}`,
      title: capitalise(item.t),
      priority: item.p,
      duration: `${dur} min`,
      note: noteFor(item.t, item.p),
    });
    cursor += dur;

    if ((i + 1) % breakEvery === 0 && i !== ordered.length - 1 && cursor + breakLen < endMins) {
      blocks.push({
        id: `b-${i}`,
        time: `${toLabel(cursor)} – ${toLabel(cursor + breakLen)}`,
        title: i === 1 ? "Reset break — step away from the screen" : "Short break",
        priority: "Break",
        duration: `${breakLen} min`,
        note: "Movement and water beat scrolling for recovery.",
      });
      cursor += breakLen;
    }
  });

  if (cursor < endMins) {
    blocks.push({
      id: "buffer",
      time: `${toLabel(cursor)} – ${toLabel(endMins)}`,
      title: "Buffer & shutdown review",
      priority: "Focus",
      duration: `${endMins - cursor} min`,
      note: "Catch overruns, then write tomorrow's top three before logging off.",
    });
  }

  const insights = [
    "Schedule high-focus work before your energy typically drops in the early afternoon.",
    "Batch email responses into one focused block rather than checking continuously.",
    "Leave buffer time between meetings so overruns don't cascade through the day.",
    input.breaks === "Minimal"
      ? "You've chosen minimal breaks — protect at least one proper screen-free pause."
      : "Your break rhythm looks sustainable for a full working day.",
    input.mode === "This Week"
      ? "Repeat this shape across the week and reserve one day with no meetings before noon."
      : "Front-load the two highest-value tasks; everything else can flex.",
  ];

  const focus = ordered
    .filter((o) => o.p === "High")
    .slice(0, 3)
    .map((o) => capitalise(o.t));
  while (focus.length < 3) {
    const next = ordered[focus.length];
    if (!next) break;
    focus.push(capitalise(next.t));
  }


  return { blocks, insights, focus };
}

/* ---------------- Research assistant ---------------- */

export type OutputStyle =
  | "Quick Summary"
  | "Detailed Summary"
  | "Explain Simply"
  | "Key Insights"
  | "Recommendations";

export interface ResearchResult {
  summary: string;
  keyPoints: string[];
  insights: string[];
  recommendations: string[];
  simple: string;
}

const keywords = (text: string) => {
  const stop = new Set(
    "the a an and or but of to in on for with is are was were this that it as at by from be been has have will can could should would about into their there they them our your you we i not no if then than when which who what how more most other such over under between".split(
      " ",
    ),
  );
  const counts = new Map<string, number>();
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w))
    .forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w);
};

export function generateResearch(text: string, style: OutputStyle): ResearchResult {
  const topics = keywords(text);
  const topic = topics[0] ? topics[0] : "the material provided";
  const second = topics[1] || "the surrounding context";
  const third = topics[2] || "implementation";
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

  const depth = style === "Detailed Summary" ? 5 : style === "Quick Summary" ? 2 : 3;

  const summaryBase =
    style === "Quick Summary"
      ? `In short: the material centres on ${topic}, with ${second} as the main supporting factor. The practical takeaway is that decisions here depend more on how ${third} is handled than on the headline idea itself.`
      : style === "Explain Simply"
        ? `Put plainly, this is about ${topic}. Think of it as a process with a few moving parts: ${second} sets the conditions, ${third} determines how well it works in practice, and the rest is detail that only matters once those two are settled.`
        : `The material examines ${topic} and how it interacts with ${second}. Across the input, the recurring theme is that outcomes are shaped less by the headline concept and more by execution details around ${third}. Where evidence is offered it points in a consistent direction, though some claims are asserted rather than demonstrated and would benefit from verification.`;

  const keyPoints = [
    `${capitalise(topic)} is the organising idea running through the material.`,
    `${capitalise(second)} appears repeatedly as the condition that determines results.`,
    `Execution around ${third} is treated as the main source of variance.`,
    sentences[0] ? `Stated directly in the source: "${sentences[0].slice(0, 160)}"` : "The source is concise, so conclusions rest on a narrow evidence base.",
    "Timeframes and responsibilities are implied rather than defined explicitly.",
  ].slice(0, Math.max(3, depth));

  const insights = [
    `The strongest leverage sits in ${third} rather than in redefining ${topic} itself.`,
    `${capitalise(second)} is being treated as fixed, but it is likely the most adjustable variable.`,
    "Several assertions are presented without supporting data — treat them as hypotheses to test, not facts.",
    style === "Key Insights"
      ? "Comparable cases suggest early, small experiments outperform a single large commitment here."
      : "Risk concentrates at the hand-off points between people or systems.",
  ].slice(0, depth === 2 ? 3 : 4);

  const recommendations = [
    `Define one measurable outcome for ${topic} before any further work begins.`,
    `Run a small, time-boxed test of ${third} and review the result against that measure.`,
    `Verify the claims about ${second} against at least one independent, reliable source.`,
    style === "Recommendations"
      ? "Assign a named owner and a review date to each action so accountability is explicit."
      : "Document assumptions so they can be revisited when conditions change.",
  ].slice(0, depth === 2 ? 3 : 4);

  const simple = `If you explained this to someone new: ${topic} is the main subject. It matters because ${second} affects the outcome. The way to get it right is to be careful with ${third}, check the facts, and start small before scaling up. Nothing here requires specialist knowledge — it requires clear decisions and someone responsible for each one.`;

  return { summary: summaryBase, keyPoints, insights, recommendations, simple };
}
