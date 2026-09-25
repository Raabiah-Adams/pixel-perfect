import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettings, type AppSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Workplace Productivity Assistant" },
      { name: "description", content: "Set your theme, default email tone, planning mode and notifications." },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Personalise your AI workspace preferences." },
    ],
  }),
  component: SettingsPage,
});

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-border py-5 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0 sm:w-56">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { settings, update } = useSettings();

  const save = (patch: Partial<AppSettings>, label: string) => {
    update(patch);
    toast.success(`${label} saved`);
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        subtitle="Preferences are stored in this browser only — there is no account or server."
      />

      <div className="card-surface px-6 py-2">
        <Row title="Theme preference" description="Switch between the light and dark workspace.">
          <div className="flex items-center gap-3">
            <Switch
              id="theme"
              checked={settings.theme === "dark"}
              onCheckedChange={(v) => save({ theme: v ? "dark" : "light" }, "Theme")}
            />
            <Label htmlFor="theme" className="text-sm text-muted-foreground">
              {settings.theme === "dark" ? "Dark" : "Light"}
            </Label>
          </div>
        </Row>

        <Row title="Default email tone" description="Pre-selected when you open the Smart Email Generator.">
          <Select
            value={settings.defaultTone}
            onValueChange={(v) => save({ defaultTone: v as AppSettings["defaultTone"] }, "Default tone")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Formal", "Friendly", "Persuasive"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row title="Default planning mode" description="Pre-selected when you open the Task Planner.">
          <Select
            value={settings.defaultPlanMode}
            onValueChange={(v) => save({ defaultPlanMode: v as AppSettings["defaultPlanMode"] }, "Planning mode")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Today", "This Week"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row title="Notification preference" description="Controls in-app reminders and confirmations.">
          <Select
            value={settings.notifications}
            onValueChange={(v) => save({ notifications: v as AppSettings["notifications"] }, "Notifications")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All", "Important only", "None"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </div>
    </AppLayout>
  );
}
