import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Link, Outlet, Scripts, createRootRouteWithContext, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <div className="grid min-h-screen place-items-center bg-canvas px-6"><div className="max-w-md text-center"><p className="text-xs font-semibold uppercase tracking-widest text-primary">404</p><h1 className="mt-3 text-3xl font-bold text-foreground">This page surfaced no results.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">The address may have changed or the page does not exist.</p><Button asChild className="mt-6"><Link to="/">Return home</Link></Button></div></div>;
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="grid min-h-screen place-items-center bg-canvas px-6"><div className="max-w-md text-center"><h1 className="text-2xl font-bold">This page did not load.</h1><p className="mt-3 text-sm text-muted-foreground">Try again or return to the research home.</p><div className="mt-6 flex justify-center gap-3"><Button onClick={reset}>Try again</Button><Button asChild variant="outline"><Link to="/">Go home</Link></Button></div></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0d111a" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) { return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><Outlet /></QueryClientProvider>; }
