import { createFileRoute } from "@tanstack/react-router";
import { Copy, Mail, RefreshCcw, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { AiThinking, EmptyState, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generateEmail, type Audience, type Purpose, type Tone } from "@/lib/ai-engine";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Tell AI what you need to communicate and get a polished, editable workplace email.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Generate professional workplace emails by audience, tone and purpose.",
      },
    ],
  }),
  component: EmailPage,
});

const audiences: Audience[] = ["Client", "Manager", "Team", "Colleague", "Other"];
const purposes: Purpose[] = [
  "Meeting Request",
  "Follow-up",
  "Apology",
  "Project Update",
  "Request",
  "Thank You",
  "Custom",
];
const tones: { value: Tone; hint: string }[] = [
  { value: "Formal", hint: "Measured and professional" },
  { value: "Friendly", hint: "Warm and approachable" },
  { value: "Persuasive", hint: "Confident and convincing" },
];

function EmailPage() {
  const { settings, hydrated } = useSettings();
  const [audience, setAudience] = useState<Audience>("Client");
  const [tone, setTone] = useState<Tone>("Formal");
  const [purpose, setPurpose] = useState<Purpose>("Meeting Request");
  const [details, setDetails] = useState("");
  const [outcome, setOutcome] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (hydrated) setTone(settings.defaultTone);
  }, [hydrated, settings.defaultTone]);

  const run = () => {
    if (!details.trim()) {
      setError("Add a few key details so the AI knows what to write about.");
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setResult(generateEmail({ audience, tone, purpose, details, outcome }));
      setLoading(false);
    }, 1100);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Email copied to clipboard");
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Smart Email"
        title="Smart Email Generator"
        subtitle="Tell AI what you need to communicate and let it create a polished workplace email."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                <SelectTrigger id="audience" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Email Purpose</Label>
              <Select value={purpose} onValueChange={(v) => setPurpose(v as Purpose)}>
                <SelectTrigger id="purpose" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {tones.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={tone === t.value}
                  onClick={() => setTone(t.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    tone === t.value
                      ? "border-primary bg-accent shadow-soft"
                      : "border-border hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  <span className="block text-sm font-semibold">{t.value}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Key Details</Label>
            <Textarea
              id="details"
              rows={7}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what you want to say, important details, deadlines, names, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Desired Outcome (optional)</Label>
            <Input
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="What should the recipient do after reading this?"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button onClick={run} disabled={loading} className="w-full" size="lg">
            <Sparkles className="size-4" />
            {loading ? "Generating…" : "Generate Email"}
          </Button>
        </div>

        <div className="card-surface flex min-h-[420px] flex-col p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate text-base font-semibold">Generated Email</h2>
            <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
              AI Generated • Review before sending
            </span>
          </div>

          <div className="mt-4 flex-1">
            {loading ? (
              <AiThinking />
            ) : result ? (
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="h-full min-h-[340px] resize-none font-sans text-sm leading-relaxed"
                aria-label="Generated email, editable"
              />
            ) : (
              <EmptyState
                icon={<Mail className="size-5" />}
                title="Your email will appear here"
                description="Choose an audience, tone and purpose, add your key details, then generate."
              />
            )}
          </div>

          {result && !loading ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={run}>
                <RefreshCcw className="size-4" /> Regenerate
              </Button>
              <Button variant="secondary" onClick={copy}>
                <Copy className="size-4" /> Copy
              </Button>
              <Button variant="ghost" onClick={() => setResult("")}>
                <Trash2 className="size-4" /> Clear
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
