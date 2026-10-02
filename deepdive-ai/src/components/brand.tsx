import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link to="/" aria-label="DeepDive AI home" className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
        <Sparkles className="size-[18px]" aria-hidden="true" />
      </span>
      {!compact && <span className="truncate text-[15px] font-bold tracking-normal text-foreground">DeepDive <span className="text-primary">AI</span></span>}
    </Link>
  );
}
