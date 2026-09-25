import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Copy, Coffee, Flame, RefreshCcw, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { AiThinking, EmptyState, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  generatePlan,
  type BreakPreference,
  type PlanBlock,
  type PlanMode,
  type Priority,
} from "@/lib/ai-engine";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Transform your workload into a realistic plan that protects your time and priorities.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Build a realistic daily or weekly schedule with focus blocks and breaks.",
      },
    ],
  }),
  component: PlannerPage,
});

const modes: PlanMode[] = ["Today", "This Week"];
const breakOptions: BreakPreference[] = ["Minimal", "Balanced", "Frequent"];
const priorities: Priority[] = ["High", "Medium", "Low"];

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-4 py-2 text-sm font-medium transition-all",
    active
      ? "border-primary bg-accent text-accent-foreground shadow-soft"
      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted",
  );

const priorityStyles: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-accent text-accent-foreground",
  Low: "bg-muted text-muted-foreground",
  Break: "bg-secondary text-secondary-foreground",
  Focus: "bg-accent text-accent-foreground",
};

function PlannerPage() {
  const { settings, hydrated } = useSettings();
  const [mode, setMode] = useState<PlanMode>("Today");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [breaks, setBreaks] = useState<BreakPreference>("Balanced");
  const [tasks, setTasks] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<PlanBlock[] | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (hydrated) setMode(settings.defaultPlanMode);
  }, [hydrated, settings.defaultPlanMode]);

  const run = () => {
    if (!tasks.trim()) {
      setError("Add at least one task so the AI can build your plan.");
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      const plan = generatePlan({ mode, start, end, breaks, tasks, priority });
      setBlocks(plan.blocks);
      setInsights(plan.insights);
      setFocus(plan.focus);
      setLoading(false);
    }, 1200);
  };

  const copyPlan = async () => {
    if (!blocks) return;
    await navigator.clipboard.writeText(
      blocks.map((b) => `${b.time} — ${b.title} (${b.priority}, ${b.duration})`).join("\n"),
    );
    toast.success("Plan copied to clipboard");
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Task Planner"
        title="AI Task Planner"
        subtitle="Transform your workload into a realistic plan that protects your time and priorities."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="card-surface space-y-6 p-6">
          <div className="space-y-2">
            <Label>Planning Mode</Label>
            <div className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={chip(mode === m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Work starts</Label>
              <Input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Work ends</Label>
              <Input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Break Preference</Label>
            <div className="flex flex-wrap gap-2">
              {breakOptions.map((b) => (
                <button key={b} type="button" aria-pressed={breaks === b} onClick={() => setBreaks(b)} className={chip(breaks === b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tasks">Tasks</Label>
            <Textarea
              id="tasks"
              rows={8}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"Finish project proposal\nReply to client emails\nPrepare presentation\nAttend team meeting\nComplete research"}
            />
          </div>

          <div className="space-y-2">
            <Label>Default priority (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <button key={p} type="button" aria-pressed={priority === p} onClick={() => setPriority(p)} className={chip(priority === p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button onClick={run} disabled={loading} size="lg" className="w-full">
            <Sparkles className="size-4" />
            {loading ? "Building…" : "Build My Plan"}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="card-surface min-h-[420px] p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-base font-semibold">Your {mode === "Today" ? "day" : "week"} plan</h2>
              <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
                AI Generated • Review before relying on it
              </span>
            </div>

            <div className="mt-5">
              {loading ? (
                <AiThinking label="AI is thinking…" />
              ) : blocks ? (
                <ol className="relative space-y-3 border-l border-border pl-5">
                  {blocks.map((b, i) => (
                    <li key={b.id} className="relative">
                      <span className="absolute -left-[26px] top-4 size-3 rounded-full bg-brand-gradient ring-4 ring-background" />
                      <div className="card-surface card-interactive p-4">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {b.time}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              priorityStyles[b.priority],
                            )}
                          >
                            {b.priority}
                          </span>
                        </div>
                        {editing ? (
                          <Input
                            className="mt-2"
                            value={b.title}
                            onChange={(e) =>
                              setBlocks((prev) =>
                                prev!.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)),
                              )
                            }
                          />
                        ) : (
                          <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                            {b.priority === "Break" ? (
                              <Coffee className="size-4 shrink-0 text-primary" />
                            ) : (
                              <Flame className="size-4 shrink-0 text-primary" />
                            )}
                            <span className="min-w-0">{b.title}</span>
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {b.duration} • {b.note}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  icon={<CalendarCheck className="size-5" />}
                  title="No plan yet"
                  description="Add your tasks and working hours, then let the AI shape a realistic schedule."
                />
              )}
            </div>

            {blocks && !loading ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={run}>
                  <RefreshCcw className="size-4" /> Regenerate Plan
                </Button>
                <Button variant={editing ? "default" : "secondary"} onClick={() => setEditing((e) => !e)}>
                  {editing ? "Done Editing" : "Edit Plan"}
                </Button>
                <Button variant="ghost" onClick={copyPlan}>
                  <Copy className="size-4" /> Copy Plan
                </Button>
              </div>
            ) : null}
          </div>

          {blocks && !loading ? (
            <>
              <div className="card-surface bg-soft-gradient p-6">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">Daily Focus — your top 3</h3>
                </div>
                <ol className="mt-3 space-y-2 text-sm">
                  {focus.map((f, i) => (
                    <li key={f} className="flex gap-3">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-gradient text-[11px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="min-w-0">{f}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card-surface p-6">
                <h3 className="text-sm font-semibold">AI Time Optimization</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {insights.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="min-w-0">{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
