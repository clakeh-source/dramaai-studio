import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Film, Layers, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studio/AppShell";
import { ConfirmDelete } from "@/components/studio/ConfirmDelete";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudio } from "@/state/studio";

export const Route = createFileRoute("/series/")({
  head: () => ({
    meta: [
      { title: "My Series — DramaAI Studio" },
      { name: "description", content: "All of your AI drama series, their status and progress." },
      { property: "og:title", content: "My Series — DramaAI Studio" },
      { property: "og:description", content: "All of your AI drama series in one dashboard." },
    ],
  }),
  component: SeriesList,
});

function SeriesList() {
  const { state, ready, deleteSeries } = useStudio();
  const [q, setQ] = useState("");

  const list = state.series.filter((s) =>
    `${s.title} ${s.genre} ${s.premise}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">My Series</h1>
          <p className="mt-2 text-muted-foreground">{state.series.length} series in production.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search series"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {!ready ? (
        <p className="mt-12 text-sm text-muted-foreground">Loading…</p>
      ) : list.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-16 text-center">
          <h2 className="font-display text-2xl">Nothing here yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with a premise and we'll build the bible, cast and first episode.
          </p>
          <Button asChild className="mt-6">
            <Link to="/series/new">Create your first series</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => {
            const scenes = s.episodes.reduce((n, e) => n + e.scenes.length, 0);
            return (
              <article
                key={s.id}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <StatusBadge status={s.status} />
                  <span className="text-xs text-muted-foreground">{s.format}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl leading-tight">
                  <Link to="/series/$seriesId" params={{ seriesId: s.id }}>
                    {s.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.premise}</p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> {s.episodes.length} episodes
                  </span>
                  <span className="flex items-center gap-1">
                    <Film className="h-3.5 w-3.5" /> {scenes} scenes
                  </span>
                  <span>{s.genre}</span>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/series/$seriesId" params={{ seriesId: s.id }}>
                      Open workspace
                    </Link>
                  </Button>
                  <ConfirmDelete
                    title={`Delete ${s.title}?`}
                    description="This permanently removes the series bible, characters, episodes, scenes, and local assets."
                    onConfirm={() => {
                      deleteSeries(s.id);
                      toast.success(`"${s.title}" deleted.`);
                    }}
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={`Delete ${s.title}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
