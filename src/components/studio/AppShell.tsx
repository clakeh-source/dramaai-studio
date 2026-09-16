import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, Clapperboard, LogOut, Menu, Plus, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/state/auth";
import { useStudio } from "@/state/studio";

/** Shared, responsive chrome for every authenticated studio screen. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const studio = useStudio();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

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

  if (studio.loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-3xl">Your studio data needs recovery</h1>
          <p className="mt-3 text-sm text-muted-foreground">{studio.loadError}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={studio.downloadRecovery}>
              Download recovery copy
            </Button>
            <Button onClick={studio.resetAll}>Reset local studio</Button>
          </div>
        </div>
      </div>
    );
  }

  const parts = pathname.split("/").filter(Boolean);
  const seriesId = parts[0] === "series" && parts[1] && parts[1] !== "new" ? parts[1] : undefined;
  const episodeId = parts[2] === "episodes" ? parts[3] : undefined;
  const series = seriesId ? studio.getSeries(seriesId) : undefined;
  const episode = episodeId ? series?.episodes.find((item) => item.id === episodeId) : undefined;
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            to="/series"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <Clapperboard className="h-5 w-5 text-primary" />
            <span className="font-display text-xl">DramaAI Studio</span>
          </Link>

          <nav
            className="hidden items-center gap-5 text-sm text-muted-foreground md:flex"
            aria-label="Primary"
          >
            <Link
              to="/series"
              activeProps={{ className: "text-foreground" }}
              className="hover:text-foreground"
            >
              My Series
            </Link>
            <Link
              to="/series/new"
              activeProps={{ className: "text-foreground" }}
              className="hover:text-foreground"
            >
              Create
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/series/new">
                <Plus className="mr-1 h-4 w-4" /> New series
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => toast.info("You’re all caught up — no new notifications.")}
            >
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 px-2" aria-label="Open creator menu">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarFallback className="bg-primary/15 text-xs text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left lg:block">
                    <span className="block text-sm leading-tight">{user.name}</span>
                    <span className="block text-xs leading-tight text-muted-foreground">
                      Creator
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <span className="block">{user.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    toast.info("Settings will open here in the cloud-backed release.")
                  }
                >
                  <Settings /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={signOut}>
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border/70 px-4 py-4 md:hidden" aria-label="Mobile">
            <div className="mx-auto grid max-w-7xl gap-2">
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/series" onClick={() => setMobileOpen(false)}>
                  My Series
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/series/new" onClick={() => setMobileOpen(false)}>
                  <Plus className="mr-2 h-4 w-4" /> Create series
                </Link>
              </Button>
            </div>
          </nav>
        )}

        {pathname !== "/series" && pathname !== "/series/" && (
          <div className="border-t border-border/50 bg-surface/70">
            <nav
              className="mx-auto flex h-10 max-w-7xl items-center gap-2 overflow-x-auto px-4 text-xs text-muted-foreground sm:px-6"
              aria-label="Breadcrumb"
            >
              <Link to="/series" className="hover:text-foreground">
                My Series
              </Link>
              {series && (
                <>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <Link
                    to="/series/$seriesId"
                    params={{ seriesId: series.id }}
                    className="whitespace-nowrap hover:text-foreground"
                  >
                    {series.title}
                  </Link>
                </>
              )}
              {episode && (
                <>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="whitespace-nowrap text-foreground">
                    Episode {episode.number}: {episode.title}
                  </span>
                </>
              )}
              {pathname === "/series/new" && (
                <>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="text-foreground">Create series</span>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
