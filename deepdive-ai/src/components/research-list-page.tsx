import { Link } from "@tanstack/react-router";
import { Bookmark, CalendarDays, ChevronRight, FileSearch, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { researchItems } from "@/lib/mock-research";

export function ResearchListPage({ mode }: { mode: "history" | "saved" }) {
  const [filter, setFilter] = useState("");
  const base = mode === "saved" ? researchItems.filter((item) => item.saved) : researchItems;
  const items = useMemo(() => base.filter((item) => `${item.query} ${item.topic}`.toLowerCase().includes(filter.toLowerCase())), [base, filter]);
  const title = mode === "saved" ? "Saved research" : "Research history";
  const description = mode === "saved" ? "A focused library of sample briefs worth returning to." : "Revisit recent sample questions and continue exploring.";
  return <AppShell><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="grid grid-cols-1 gap-6 border-b border-border pb-7 sm:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] sm:items-end"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Library</p><h1 className="mt-2 text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><label htmlFor={`${mode}-filter`} className="sr-only">Filter research</label><Input id={`${mode}-filter`} value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter research..." className="h-10 bg-card pl-9" /></div></div>
    {items.length ? <div className="mt-7 space-y-3">{items.map((item) => <article key={item.id} className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/35"><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{item.topic}</Badge>{item.saved && <span className="inline-flex items-center gap-1 text-[11px] text-primary"><Bookmark className="size-3 fill-current" /> Saved</span>}</div><h2 className="mt-4 text-base font-bold leading-6 sm:text-lg">{item.query}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.summary}</p><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{item.date}</span><span className="inline-flex items-center gap-1.5"><FileSearch className="size-3.5" />{item.sources} sample sources</span></div></div><Button asChild variant="ghost" size="icon" className="self-center"><Link to="/research" search={{ q: item.query }} aria-label={`Open ${item.query}`}><ChevronRight /></Link></Button></div></article>)}</div> : <div className="grid min-h-80 place-items-center text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground"><Search className="size-5" /></span><h2 className="mt-4 font-bold">No matching research</h2><p className="mt-2 text-sm text-muted-foreground">Try a broader keyword or clear the filter.</p><Button variant="outline" className="mt-5" onClick={() => setFilter("")}>Clear filter</Button></div></div>}
    <div className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">All entries on this page are local sample data for product demonstration.</div>
  </div></AppShell>;
}
