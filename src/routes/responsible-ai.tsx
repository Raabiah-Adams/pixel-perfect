import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, EyeOff, ScrollText, ShieldCheck, UserCheck } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "How to use AI-generated emails, plans and research responsibly at work.",
      },
      { property: "og:title", content: "Responsible AI" },
      {
        property: "og:description",
        content: "AI should assist your judgement, not replace it. Guidance for safe workplace use.",
      },
    ],
  }),
  component: ResponsibleAI,
});

const points = [
  {
    icon: AlertTriangle,
    title: "AI can be wrong",
    body: "Generated content may contain mistakes, outdated details or confident-sounding errors.",
  },
  {
    icon: ScrollText,
    title: "Review before you rely on it",
    body: "Read anything important end to end before sending, scheduling or sharing it.",
  },
  {
    icon: EyeOff,
    title: "Protect sensitive information",
    body: "Avoid entering confidential workplace or personal data unless it is genuinely necessary.",
  },
  {
    icon: UserCheck,
    title: "You remain accountable",
    body: "Emails, schedules, decisions and research outputs stay your responsibility, not the AI's.",
  },
  {
    icon: ShieldCheck,
    title: "Verify what matters",
    body: "When accuracy counts, check research outputs against reliable, independent sources.",
  },
];

function ResponsibleAI() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Responsible AI"
        title="AI should assist your judgement, not replace it."
        subtitle="A short set of principles for using this workspace safely and professionally."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {points.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card-surface card-interactive p-6">
            <div className="grid size-10 place-items-center rounded-xl bg-soft-gradient text-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="card-surface mt-6 bg-soft-gradient p-6">
        <p className="text-sm text-muted-foreground">
          This application generates demonstration content locally in your browser. Nothing you type is
          sent to an external service or stored on a server.
        </p>
      </div>
    </AppLayout>
  );
}
