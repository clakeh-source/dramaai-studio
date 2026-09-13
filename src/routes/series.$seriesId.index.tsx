import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studio/AppShell";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { WorkflowSteps } from "@/components/studio/WorkflowSteps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudio } from "@/state/studio";
import { SERIES_STATUSES, type Character, type SeriesStatus } from "@/types/models";

export const Route = createFileRoute("/series/$seriesId/")({
  head: () => ({
    meta: [
      { title: "Series workspace — DramaAI Studio" },
      {
        name: "description",
        content: "Edit the series bible, cast and episode list for your AI drama series.",
      },
      { property: "og:title", content: "Series workspace — DramaAI Studio" },
      { property: "og:description", content: "Bible, characters and episodes in one workspace." },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { seriesId } = useParams({ from: "/series/$seriesId/" });
  const studio = useStudio();
  const series = studio.getSeries(seriesId);

  if (!studio.ready) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  if (!series) {
    return (
      <AppShell>
        <h1 className="text-3xl">Series not found</h1>
        <Button asChild className="mt-6">
          <Link to="/series">Back to My Series</Link>
        </Button>
      </AppShell>
    );
  }

  const bible = series.bible;

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <Link to="/series" className="text-xs uppercase tracking-widest text-muted-foreground">
            ← My Series
          </Link>
          <h1 className="mt-3 text-4xl">{series.title}</h1>
          <p className="mt-3 text-muted-foreground">{series.premise}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <StatusBadge status={series.status} />
            <span>{series.genre}</span>
            <span>{series.language}</span>
            <span>
              {series.episodeCount} × {series.episodeDuration}s
            </span>
            <span>{series.visualStyle}</span>
            <span>{series.format}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">
            Approval stage
          </Label>
          <Select
            value={series.status}
            onValueChange={(v) => {
              studio.updateSeries(series.id, { status: v as SeriesStatus });
              toast.success(`Moved to ${v}.`);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERIES_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <WorkflowSteps status={series.status} className="mt-8" />

      <Tabs defaultValue="bible" className="mt-10">
        <TabsList>
          <TabsTrigger value="bible">Series bible</TabsTrigger>
          <TabsTrigger value="cast">Characters ({series.characters.length})</TabsTrigger>
          <TabsTrigger value="episodes">Episodes ({series.episodes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="bible" className="mt-8">
          {!bible ? (
            <p className="text-sm text-muted-foreground">
              No bible yet. Generate one from the Create flow.
            </p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
                {(
                  [
                    ["logline", "Logline", 2],
                    ["synopsis", "Synopsis", 6],
                    ["world", "World", 4],
                    ["themes", "Themes", 3],
                    ["tone", "Tone", 3],
                    ["continuityRules", "Continuity rules", 5],
                  ] as const
                ).map(([key, label, rows]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Textarea
                      id={key}
                      rows={rows}
                      value={bible[key]}
                      onChange={(e) => studio.updateBible(series.id, { [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl">Episode arc</h2>
                <ol className="mt-5 space-y-4">
                  {bible.episodeArc.map((b) => (
                    <li key={b.number} className="border-l-2 border-primary/40 pl-4">
                      <p className="text-sm font-medium">
                        {b.number}. {b.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{b.beat}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cast" className="mt-8">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => studio.upsertCharacter(series.id, studio.newCharacter(series.id))}
            >
              <Plus className="mr-1 h-4 w-4" /> Add character
            </Button>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {series.characters.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                onChange={(patch) => studio.upsertCharacter(series.id, { ...c, ...patch })}
                onRemove={() => studio.removeCharacter(series.id, c.id)}
              />
            ))}
            {series.characters.length === 0 && (
              <p className="text-sm text-muted-foreground">No characters yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="episodes" className="mt-8">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => studio.addEpisode(series.id)}>
              <Plus className="mr-1 h-4 w-4" /> Add episode
            </Button>
          </div>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {series.episodes.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-4 p-5">
                <span className="font-display text-2xl text-muted-foreground">
                  {String(e.number).padStart(2, "0")}
                </span>
                <div className="min-w-56 flex-1">
                  <Link
                    to="/series/$seriesId/episodes/$episodeId"
                    params={{ seriesId: series.id, episodeId: e.id }}
                    className="font-medium hover:text-primary"
                  >
                    {e.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.synopsis}</p>
                </div>
                <StatusBadge status={e.status} />
                <span className="text-xs text-muted-foreground">
                  {e.scenes.length} scenes · {e.duration}s
                </span>
                <Button asChild size="sm" variant="secondary">
                  <Link
                    to="/series/$seriesId/episodes/$episodeId"
                    params={{ seriesId: series.id, episodeId: e.id }}
                  >
                    Open
                  </Link>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${e.title}`}
                  onClick={() => studio.removeEpisode(series.id, e.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function CharacterCard({
  character,
  onChange,
  onRemove,
}: {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-lg text-primary">
          {(character.name || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            value={character.name}
            placeholder="Character name"
            onChange={(e) => onChange({ name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={character.role}
              placeholder="Role"
              onChange={(e) => onChange({ role: e.target.value })}
            />
            <Input
              value={character.age}
              placeholder="Age"
              onChange={(e) => onChange({ age: e.target.value })}
            />
          </div>
        </div>
        <Button size="icon" variant="ghost" aria-label="Remove character" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-5 space-y-4">
        {(
          [
            ["occupation", "Occupation"],
            ["personality", "Personality"],
            ["goals", "Goals"],
            ["conflict", "Conflict"],
            ["appearance", "Appearance"],
            ["wardrobe", "Wardrobe"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              {label}
            </Label>
            <Textarea
              rows={2}
              value={character[key]}
              onChange={(e) => onChange({ [key]: e.target.value })}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{character.voice}</p>
      </div>
    </div>
  );
}
