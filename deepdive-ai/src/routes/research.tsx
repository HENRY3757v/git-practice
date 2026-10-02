import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, ChevronRight, CircleAlert, ExternalLink, FileText, RefreshCw, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { QueryComposer } from "@/components/query-composer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { makeResearch } from "@/lib/mock-research";

export const Route = createFileRoute("/research")({
  validateSearch: (search: Record<string, unknown>) => ({ q: typeof search["q"] === "string" ? search["q"] : "" }),
  head: () => ({ meta: [
    { title: "Research Workspace — DeepDive AI" }, { name: "description", content: "Explore a deterministic sample research result in DeepDive AI." },
    { property: "og:title", content: "Research Workspace — DeepDive AI" }, { property: "og:description", content: "A sample structured research workspace with findings and evidence." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: ResearchPage,
});

function ResearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/research" });
  const [loading, setLoading] = useState(Boolean(q));
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (!q) { setLoading(false); return; } setLoading(true); const timer = setTimeout(() => setLoading(false), 1300); return () => clearTimeout(timer); }, [q]);
  const result = useMemo(() => makeResearch(q), [q]);
  const submit = (query: string) => navigate({ to: ".", search: { q: query } });
  return <AppShell><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    {!q ? <EmptyWorkspace onSubmit={submit} /> : <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-7"><div className="min-w-0"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Link to="/" className="hover:text-foreground">Home</Link><ChevronRight className="size-3" /><span>Research</span></div><h1 className="text-balance mt-3 max-w-4xl text-2xl font-bold leading-tight sm:text-3xl">{q}</h1><p className="mt-3 text-xs text-muted-foreground">Sample result · generated locally · no live web research performed</p></div><Button variant="outline" size="icon" onClick={() => setSaved((v) => !v)} aria-label={saved ? "Remove from saved" : "Save research"} className={saved ? "border-primary/40 text-primary" : ""}><Bookmark className={saved ? "fill-current" : ""} /></Button></div>
      {loading ? <ProgressState query={q} /> : <div className="pt-8" style={{ animation: "rise .4s ease-out both" }}>
        <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6"><div className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="size-4" /> Research overview</div><p className="mt-4 max-w-4xl text-sm leading-7 text-foreground/90 sm:text-base">{result.overview}</p></div>
        <section><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Synthesis</p><h2 className="mt-2 text-xl font-bold">Key findings</h2></div><span className="text-xs text-muted-foreground">3 themes identified</span></div><div className="mt-5 grid gap-3 lg:grid-cols-3">{result.findings.map((finding, index) => <article key={finding.title} className="rounded-lg border border-border bg-card p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-primary">0{index + 1}</span><Badge variant="outline" className="border-success/25 text-success">{finding.confidence}</Badge></div><h3 className="mt-5 text-base font-bold">{finding.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{finding.body}</p></article>)}</div></section>
        <section className="mt-12"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Evidence</p><h2 className="mt-2 text-xl font-bold">Sample sources</h2><p className="mt-2 text-sm text-muted-foreground">Illustrative citations for interface demonstration only.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{result.sources.map((source, index) => <article key={source.domain} className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/35"><div className="flex items-start justify-between gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground"><FileText className="size-4" /></span><Badge variant="secondary">{source.type}</Badge></div><h3 className="mt-5 font-semibold leading-6">{source.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{source.snippet}</p><a href={`https://${source.domain}`} target="_blank" rel="noreferrer" onClick={(event) => event.preventDefault()} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary" aria-label={`Sample link to ${source.domain}`}>[{index + 1}] {source.domain}<ExternalLink className="size-3" /></a></article>)}</div></section>
        <div className="mt-10 rounded-lg border border-warning/25 bg-warning/5 p-4 text-sm text-muted-foreground"><div className="flex gap-3"><CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" /><p><strong className="text-foreground">Demo notice:</strong> This synthesis and every citation above are sample content generated from fixed local data. Verify all claims independently.</p></div></div>
        <div className="mt-8"><QueryComposer compact initialValue={q} onSubmit={submit} /></div>
      </div>}
    </>}
  </div></AppShell>;
}

function EmptyWorkspace({ onSubmit }: { onSubmit: (q: string) => void }) { return <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col justify-center py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary"><Search /></span><h1 className="mt-6 text-3xl font-bold">Start a new deep dive</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Ask a focused question. This demo will create a structured sample brief using only local mock content.</p><div className="mt-8 text-left"><QueryComposer onSubmit={onSubmit} /></div></div>; }
function ProgressState({ query }: { query: string }) { const steps = ["Framing the research question", "Comparing sample perspectives", "Structuring findings and evidence"]; return <div className="mx-auto max-w-2xl py-20"><div className="text-center"><RefreshCw className="mx-auto size-7 animate-spin text-primary" /><h2 className="mt-5 text-xl font-bold">Preparing your sample brief</h2><p className="mt-2 truncate text-sm text-muted-foreground">“{query}”</p></div><div className="mt-10 overflow-hidden rounded-lg border border-border bg-card"><div className="relative h-1 bg-muted"><div className="absolute inset-y-0 w-1/3 bg-primary" style={{ animation: "scan 1.1s ease-in-out infinite" }} /></div><div className="space-y-0 divide-y divide-border">{steps.map((step, index) => <div key={step} className="flex items-center gap-3 px-5 py-4 text-sm"><span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">{index === 0 ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}</span>{step}</div>)}</div></div><p className="mt-4 text-center text-xs text-muted-foreground">No external requests are being made.</p></div>; }
