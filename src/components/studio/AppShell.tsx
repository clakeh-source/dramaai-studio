import { Link, useNavigate } from "@tanstack/react-router";
import { Clapperboard, LogOut, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/state/auth";

/** Shared chrome for every authenticated studio screen. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/" });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading your studio…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
          <Link to="/series" className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-primary" />
            <span className="font-display text-xl">DramaAI Studio</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <Link to="/series" activeProps={{ className: "text-foreground" }} className="hover:text-foreground">
              My Series
            </Link>
            <Link to="/series/new" activeProps={{ className: "text-foreground" }} className="hover:text-foreground">
              Create
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Button asChild size="sm">
              <Link to="/series/new">
                <Plus className="mr-1 h-4 w-4" /> New series
              </Link>
            </Button>
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight">{user.name}</p>
              <p className="text-xs leading-tight text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
