import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  LayoutDashboard,
  Mail,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

const mainNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research Assistant", icon: Search },
] as const;

const footerNav = [
  { to: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3 px-2">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-gradient shadow-lift">
        <Sparkles className="size-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">AI Workplace</p>
        <p className="truncate text-xs text-muted-foreground">Productivity Assistant</p>
      </div>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const item = (to: string, label: string, Icon: typeof Mail) => {
    const active = pathname === to;
    return (
      <Link
        key={to}
        to={to}
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-110", active && "text-primary")} />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col gap-1">
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Workspace
      </p>
      {mainNav.map((n) => item(n.to, n.label, n.icon))}
      <div className="flex-1" />
      <div className="mt-6 rounded-2xl bg-soft-gradient p-4">
        <p className="text-xs font-semibold">AI assists, you decide</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Always review generated content before you send or act on it.
        </p>
      </div>
      <div className="mt-3 space-y-1 border-t border-sidebar-border pt-3">
        {footerNav.map((n) => item(n.to, n.label, n.icon))}
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { settings, hydrated } = useSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background" data-theme-ready={hydrated ? settings.theme : undefined}>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-sidebar-border bg-sidebar px-4 pb-6 pt-6 lg:flex">
        <Brand />
        <NavList />
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-sidebar px-4 pb-6 pt-6">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
                <NavList onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <p className="truncate text-sm font-medium text-muted-foreground">
              AI Workplace Productivity Assistant
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            AI ready
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 page-glow" aria-hidden />
          <div className="relative">{children}</div>
        </main>

        <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground lg:px-8">
          AI Workplace Productivity Assistant • Built for smarter work
        </footer>
      </div>
    </div>
  );
}
