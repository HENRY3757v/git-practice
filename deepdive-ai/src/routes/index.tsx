import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, Database, FileSearch, Globe2, Layers3, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { QueryComposer } from "@/components/query-composer";
import { Button } from "@/components/ui/button";

const prompts = ["Compare the leading approaches to carbon removal", "Map AI agent adoption in financial services", "What is changing in battery recycling?"];
const features = [
  { icon: Globe2, title: "Cross-source synthesis", text: "See how reports, journals, and datasets fit together in one structured view." },
  { icon: ShieldCheck, title: "Evidence, not opacity", text: "Every sample finding stays connected to clear, inspectable source cards." },
  { icon: Layers3, title: "Built for depth", text: "Move from a broad overview to key findings and supporting evidence quickly." },
];

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "DeepDive AI — Research across sources" },
    { name: "description", content: "Explore the DeepDive AI sample research workspace for structured synthesis across sources." },
    { property: "og:title", content: "DeepDive AI — Research across sources" },
    { property: "og:description", content: "A polished sample workspace for structured research synthesis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate({ from: "/" });
  const begin = (q: string) => navigate({ to: "/research", search: { q } });
  return <div className="min-h-screen overflow-hidden bg-canvas">
    <header className="relative z-20 mx-auto grid h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8"><Brand /><div className="flex items-center gap-2"><Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/history">History</Link></Button><Button asChild variant="outline"><Link to="/research" search={{ q: "" }}>Open workspace</Link></Button></div></header>
    <main>
      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center px-5 pb-24 pt-14 text-center sm:px-8 lg:pb-32">
        <div className="surface-grid pointer-events-none absolute inset-x-0 top-0 h-[78%] opacity-50" />
        <div className="relative max-w-4xl" style={{ animation: "rise .5s ease-out both" }}>
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"><Database className="size-3.5" /> Interactive product demo</div>
          <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-normal text-foreground sm:text-6xl lg:text-7xl">Go deeper than search.</h1>
          <p className="text-balance mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">DeepDive AI turns complex questions into organized research—connecting key findings, competing perspectives, and the evidence behind them.</p>
          <div className="mx-auto mt-10 max-w-3xl text-left"><QueryComposer onSubmit={begin} /></div>
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2"><span className="w-full text-xs text-muted-foreground sm:w-auto sm:py-2">Try an example:</span>{prompts.map((prompt) => <button key={prompt} onClick={() => begin(prompt)} className="rounded-md border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">{prompt}</button>)}</div>
        </div>
        <div className="relative mt-20 grid w-full max-w-5xl grid-cols-1 border-y border-border md:grid-cols-3 md:divide-x md:divide-border">{features.map((feature) => <div key={feature.title} className="px-6 py-7 text-left"><feature.icon className="size-5 text-primary" /><h2 className="mt-4 text-sm font-bold">{feature.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p></div>)}</div>
      </section>
      <section className="border-t border-border bg-background"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">A clearer research process</p><h2 className="text-balance mt-4 text-3xl font-bold sm:text-4xl">From open question to a defensible point of view.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">A focused workspace keeps the question, synthesis, findings, and evidence together—without pretending sample content is live research.</p><Button asChild className="mt-7"><Link to="/research" search={{ q: "How will AI change scientific research over the next five years?" }}>Explore a sample <ArrowRight /></Link></Button></div><div className="rounded-lg border border-border bg-card p-5 sm:p-7"><div className="flex items-center justify-between border-b border-border pb-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-accent text-indigo"><FileSearch className="size-4" /></span><div><p className="text-sm font-semibold">Research brief</p><p className="text-xs text-muted-foreground">Sample synthesis</p></div></div><BookOpen className="size-4 text-muted-foreground" /></div><div className="space-y-4 pt-5">{["Question framed and scoped", "Perspectives grouped by theme", "Claims connected to evidence"].map((text) => <div className="flex items-center gap-3 text-sm" key={text}><span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary"><Check className="size-3" /></span>{text}</div>)}</div></div></div></section>
    </main>
    <footer className="border-t border-border bg-background"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><Brand /><p>DeepDive AI is a frontend demo. All research and citations shown are sample content.</p></div></footer>
  </div>;
}
