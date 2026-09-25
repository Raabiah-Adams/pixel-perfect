import { createFileRoute } from "@tanstack/react-router";
import { Copy, Link2, Loader2, RefreshCcw, Search, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { AiThinking, EmptyState, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchUrlText } from "@/lib/fetch-url.functions";
import { cn } from "@/lib/utils";
import { generateResearch, type OutputStyle, type ResearchResult } from "@/lib/ai-engine";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Productivity Assistant" },
      { name: "description", content: "Turn complex information into clear, useful insights." },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Summarise, simplify and extract insights and recommendations from any material.",
      },
    ],
  }),
  component: ResearchPage,
});

const styles: OutputStyle[] = [
  "Quick Summary",
  "Detailed Summary",
  "Explain Simply",
  "Key Insights",
  "Recommendations",
];

function EditableList({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="card-surface p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <Textarea
            key={i}
            value={item}
            rows={3}
            onChange={(e) => onChange(items.map((x, xi) => (xi === i ? e.target.value : x)))}
            className="resize-none bg-muted/40 text-sm"
            aria-label={`${title} item ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ResearchPage() {
  const [mode, setMode] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [style, setStyle] = useState<OutputStyle>("Quick Summary");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const analyse = (material: string) => {
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setResult(generateResearch(material, style));
      setLoading(false);
    }, 1300);
  };

  const run = () => {
    if (mode === "url") {
      void runFromUrl();
      return;
    }
    if (text.trim().length < 20) {
      setError("Paste a topic, question or some text (at least a sentence) to analyse.");
      return;
    }
    setSourceUrl("");
    analyse(text);
  };

  const runFromUrl = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a link to an article or page you'd like analysed.");
      return;
    }
    setError("");
    setFetching(true);
    try {
      const { text: fetched, url: finalUrl } = await fetchUrlText({ data: { url: trimmed } });
      setText(fetched);
      setSourceUrl(finalUrl);
      toast.success("Page loaded — analysing it now");
      analyse(fetched);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't read that page. Check the link, or paste the text directly instead.",
      );
    } finally {
      setFetching(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    const out = [
      `Executive Summary\n${result.summary}`,
      `Key Points\n${result.keyPoints.map((k) => `• ${k}`).join("\n")}`,
      `Insights\n${result.insights.map((k) => `• ${k}`).join("\n")}`,
      `Recommendations\n${result.recommendations.map((k) => `• ${k}`).join("\n")}`,
      `Simplified Explanation\n${result.simple}`,
    ].join("\n\n");
    await navigator.clipboard.writeText(out);
    toast.success("Research copied to clipboard");
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Research Assistant"
        title="AI Research Assistant"
        subtitle="Turn complex information into clear, useful insights."
      />

      <div className="card-surface space-y-5 p-6">
        <div className="space-y-2">
          <Label>Source</Label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "text", label: "Paste text" },
                { id: "url", label: "From a link" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => {
                  setMode(m.id);
                  setError("");
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  mode === m.id
                    ? "border-primary bg-accent text-accent-foreground shadow-soft"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "text" ? (
          <div className="space-y-2">
            <Label htmlFor="material">What should AI analyse?</Label>
            <Textarea
              id="material"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a research topic, an article, your notes, a question, or any complex information you want simplified."
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="source-url">Link to analyse</Label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="source-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The page is fetched and its readable text extracted automatically. Pages that require
              a login may not be readable.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Output Style</Label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={style === s}
                onClick={() => setStyle(s)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  style === s
                    ? "border-primary bg-accent text-accent-foreground shadow-soft"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button onClick={run} disabled={loading || fetching} size="lg" className="w-full sm:w-auto">
          {fetching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {fetching ? "Fetching page…" : loading ? "Analysing…" : "Analyse with AI"}
        </Button>
      </div>

      <section className="mt-6">
        {loading ? (
          <div className="card-surface">
            <AiThinking label="AI is reading and structuring your material…" />
          </div>
        ) : result ? (
          <div className="space-y-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-lg font-semibold">Research workspace</h2>
              <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
                AI Generated • Verify before relying on it
              </span>
            </div>

            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 truncate text-sm text-primary hover:underline"
              >
                <Link2 className="size-3.5 shrink-0" />
                <span className="truncate">{sourceUrl}</span>
              </a>
            ) : null}

            <div className="card-surface bg-soft-gradient p-5">
              <h3 className="text-sm font-semibold">Executive Summary</h3>
              <Textarea
                value={result.summary}
                rows={4}
                onChange={(e) => setResult({ ...result, summary: e.target.value })}
                className="mt-3 resize-none bg-card text-sm leading-relaxed"
                aria-label="Executive summary"
              />
            </div>

            <EditableList
              title="Key Points"
              items={result.keyPoints}
              onChange={(keyPoints) => setResult({ ...result, keyPoints })}
            />
            <EditableList
              title="Insights"
              items={result.insights}
              onChange={(insights) => setResult({ ...result, insights })}
            />
            <EditableList
              title="Recommendations"
              items={result.recommendations}
              onChange={(recommendations) => setResult({ ...result, recommendations })}
            />

            <div className="card-surface p-5">
              <h3 className="text-sm font-semibold">Simplified Explanation</h3>
              <Textarea
                value={result.simple}
                rows={4}
                onChange={(e) => setResult({ ...result, simple: e.target.value })}
                className="mt-3 resize-none bg-muted/40 text-sm leading-relaxed"
                aria-label="Simplified explanation"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={run}>
                <RefreshCcw className="size-4" /> Regenerate
              </Button>
              <Button variant="secondary" onClick={copy}>
                <Copy className="size-4" /> Copy
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setResult(null);
                  setText("");
                  setUrl("");
                  setSourceUrl("");
                }}
              >
                <Trash2 className="size-4" /> Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="card-surface">
            <EmptyState
              icon={<Search className="size-5" />}
              title="Nothing analysed yet"
              description="Paste your material above, pick an output style, and the AI will structure it into summaries, insights and next steps."
            />
          </div>
        )}
      </section>
    </AppLayout>
  );
}
