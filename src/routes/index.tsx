import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Lightbulb, Mail, Search, Sparkles, ArrowRight } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Your AI workspace for writing polished emails, planning your day and understanding information faster.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Write, plan and research faster with a polished AI productivity workspace.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email",
    copy: "Draft polished workplace emails in seconds.",
    cta: "Create Email",
  },
  {
    to: "/planner",
    icon: CalendarCheck,
    title: "Task Planner",
    copy: "Turn your workload into an organised action plan.",
    cta: "Plan My Day",
  },
  {
    to: "/research",
    icon: Search,
    title: "Research Assistant",
    copy: "Understand complex information faster with AI-powered summaries.",
    cta: "Start Research",
  },
] as const;

const quickActions = [
  { to: "/email", label: "Write an Email" },
  { to: "/planner", label: "Plan My Day" },
  { to: "/research", label: "Summarise Information" },
] as const;

function Dashboard() {
  return (
    <AppLayout>
      <section className="overflow-hidden rounded-3xl bg-soft-gradient p-6 shadow-soft sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3 text-primary" /> AI workspace
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          Good morning <span aria-hidden>👋</span> <span className="text-brand-gradient">Let&apos;s get productive.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Your AI workspace for writing, planning and understanding information faster.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {features.map(({ to, icon: Icon, title, copy, cta }) => (
          <div key={to} className="card-surface card-interactive flex flex-col p-6">
            <div className="grid size-11 place-items-center rounded-xl bg-brand-gradient shadow-lift">
              <Icon className="size-5 text-primary-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{copy}</p>
            <Button asChild className="mt-5 w-full">
              <Link to={to}>
                {cta} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="card-surface p-6">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jump straight into the tool you need.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {quickActions.map((a) => (
              <Button key={a.label} asChild variant="secondary" className="rounded-full">
                <Link to={a.to}>
                  <Sparkles className="size-4 text-primary" />
                  {a.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="card-surface bg-soft-gradient p-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Productivity Tip</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Group similar tasks together to reduce context switching and protect your focus time.
          </p>
        </div>
      </section>
    </AppLayout>
  );
}
