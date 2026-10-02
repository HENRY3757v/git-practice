import { useState, type FormEvent } from "react";
import { ArrowUp, LoaderCircle, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function QueryComposer({ initialValue = "", onSubmit, loading = false, compact = false }: {
  initialValue?: string;
  onSubmit: (query: string) => void;
  loading?: boolean;
  compact?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = value.trim();
    if (next) onSubmit(next);
  };

  return (
    <form onSubmit={submit} className={cn("rounded-lg border border-border bg-elevated shadow-2xl shadow-canvas/40 transition-colors focus-within:border-primary/50", compact ? "p-2" : "p-3")}>
      <label htmlFor={compact ? "workspace-query" : "home-query"} className="sr-only">Research question</label>
      <Textarea
        id={compact ? "workspace-query" : "home-query"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        rows={compact ? 2 : 3}
        placeholder="Ask a complex research question..."
        className={cn("resize-none border-0 bg-transparent px-2 shadow-none focus-visible:ring-0", compact ? "min-h-14 text-sm" : "min-h-24 text-base sm:text-lg")}
      />
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <Paperclip className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Sample mode · no live web access</span>
        </div>
        <Button type="submit" size="icon" disabled={loading || !value.trim()} aria-label="Start research" className="size-10 rounded-md">
          {loading ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </form>
  );
}
