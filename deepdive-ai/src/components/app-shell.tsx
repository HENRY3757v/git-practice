import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, Clock3, Menu, PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const items = [
  { label: "History", to: "/history" as const, icon: Clock3 },
  { label: "Saved", to: "/saved" as const, icon: Bookmark },
];

function Navigation({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const researchActive = path === "/research";
  return (
    <nav aria-label="Main navigation" className="space-y-1">
      <Link to="/research" search={{ q: "" }} onClick={onNavigate}
        className={cn("flex h-10 items-center rounded-md text-sm transition-colors", compact ? "justify-center px-0" : "gap-3 px-3", researchActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}
        aria-current={researchActive ? "page" : undefined} title={compact ? "New research" : undefined}>
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        {!compact && <span>New research</span>}
      </Link>
      {items.map((item) => {
        const active = path === item.to;
        return (
          <Link key={item.to} to={item.to} onClick={onNavigate}
            className={cn("flex h-10 items-center rounded-md text-sm transition-colors", compact ? "justify-center px-0" : "gap-3 px-3", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}
            aria-current={active ? "page" : undefined} title={compact ? item.label : undefined}>
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {!compact && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-canvas">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex lg:flex-col", collapsed ? "w-[72px]" : "w-60")}>
        <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center" : "px-5")}><Brand compact={collapsed} /></div>
        <div className="flex-1 px-3 py-5"><Navigation compact={collapsed} /></div>
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && <div className="mb-3 rounded-md border border-border bg-card p-3"><p className="text-xs font-semibold text-foreground">Sample workspace</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Local demo data only. No live sources are queried.</p></div>}
          <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("text-muted-foreground", !collapsed && "w-full justify-start")}>
            {collapsed ? <PanelLeftOpen /> : <><PanelLeftClose /><span>Collapse</span></>}
          </Button>
        </div>
      </aside>
      <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-60")}>
        <header className="sticky top-0 z-20 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetHeader className="border-b border-sidebar-border p-5 text-left"><SheetTitle><Brand /></SheetTitle><SheetDescription>Sample research workspace</SheetDescription></SheetHeader>
              <div className="p-3"><Navigation onNavigate={() => setOpen(false)} /></div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 lg:hidden"><Brand /></div>
          <div className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground lg:flex"><Search className="size-4 shrink-0" /><span className="truncate">Research workspace</span></div>
          <span className="justify-self-end rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Demo</span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
