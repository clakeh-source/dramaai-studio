import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Camera as CameraIcon,
  Copy,
  Film,
  Image,
  MessageSquareText,
  Mic,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studio/AppShell";
import { ConfirmDelete } from "@/components/studio/ConfirmDelete";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uid } from "@/lib/id";
import { useStudio } from "@/state/studio";
import {
  EPISODE_STATUSES,
  SCENE_STATUSES,
  type EpisodeStatus,
  type Scene,
  type SceneStatus,
} from "@/types/models";

export const Route = createFileRoute("/series/$seriesId/episodes/$episodeId")({
  head: () => ({
    meta: [
      { title: "Episode editor — DramaAI Studio" },
      {
        name: "description",
        content: "Scene Studio: edit action, dialogue, camera and mood shot by shot.",
      },
      { property: "og:title", content: "Episode editor — DramaAI Studio" },
      { property: "og:description", content: "Edit your episode scene by scene." },
    ],
  }),
  component: EpisodeEditor,
});

function EpisodeEditor() {
  const { seriesId, episodeId } = useParams({
    from: "/series/$seriesId/episodes/$episodeId",
  });
  const studio = useStudio();
  const series = studio.getSeries(seriesId);
  const episode = series?.episodes.find((e) => e.id === episodeId);

  if (!studio.ready) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  if (!series || !episode) {
    return (
      <AppShell>
        <h1 className="text-3xl">Episode not found</h1>
        <Button asChild className="mt-6">
          <Link to="/series">Back to My Series</Link>
        </Button>
      </AppShell>
    );
  }

  const total = episode.scenes.reduce((n, s) => n + s.duration, 0);

  return (
    <AppShell>
      <Link
        to="/series/$seriesId"
        params={{ seriesId: series.id }}
        className="text-xs uppercase tracking-widest text-muted-foreground"
      >
        ← {series.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl flex-1">
          <p className="text-sm text-muted-foreground">
            Episode {String(episode.number).padStart(2, "0")}
          </p>
          <Input
            className="mt-2 h-auto border-0 bg-transparent px-0 font-display text-4xl focus-visible:ring-0"
            value={episode.title}
            onChange={(e) => studio.updateEpisode(series.id, episode.id, { title: e.target.value })}
          />
          <Textarea
            className="mt-3"
            rows={3}
            value={episode.synopsis}
            placeholder="Episode synopsis"
            onChange={(e) =>
              studio.updateEpisode(series.id, episode.id, { synopsis: e.target.value })
            }
          />
        </div>
        <div className="space-y-3">
          <Select
            value={episode.status}
            onValueChange={(v) =>
              studio.updateEpisode(series.id, episode.id, { status: v as EpisodeStatus })
            }
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EPISODE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {episode.scenes.length} scenes · {total}s of {episode.duration}s
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-2xl">Scene Studio</h2>
        <Button size="sm" onClick={() => studio.addScene(series.id, episode.id)}>
          <Plus className="mr-1 h-4 w-4" /> Add scene
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        {episode.scenes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            This episode is outlined but not yet scripted. Add your first scene.
          </div>
        )}
        {episode.scenes.map((scene) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            castNames={series.characters.map((c) => c.name)}
            onPatch={(patch) => studio.updateScene(series.id, episode.id, scene.id, patch)}
            onMove={(dir) => studio.moveScene(series.id, episode.id, scene.id, dir)}
            onDuplicate={() => {
              studio.duplicateScene(series.id, episode.id, scene.id);
              toast.success("Scene duplicated.");
            }}
            onRemove={() => {
              studio.removeScene(series.id, episode.id, scene.id);
              toast.success(`Scene ${scene.number} deleted.`);
            }}
          />
        ))}
      </div>
    </AppShell>
  );
}

function SceneCard({
  scene,
  castNames,
  onPatch,
  onMove,
  onDuplicate,
  onRemove,
}: {
  scene: Scene;
  castNames: string[];
  onPatch: (patch: Partial<Scene>) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-display text-2xl text-primary">
          {String(scene.number).padStart(2, "0")}
        </span>
        <Input
          className="min-w-64 flex-1 font-medium tracking-wide"
          value={scene.location}
          onChange={(e) => onPatch({ location: e.target.value })}
        />
        <Select value={scene.status} onValueChange={(v) => onPatch({ status: v as SceneStatus })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCENE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <StatusBadge status={scene.status} />
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" aria-label="Move scene up" onClick={() => onMove(-1)}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Move scene down"
            onClick={() => onMove(1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Duplicate scene" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <ConfirmDelete
            title={`Delete Scene ${scene.number}?`}
            description="This permanently removes the scene and all of its dialogue."
            onConfirm={onRemove}
            trigger={
              <Button size="icon" variant="ghost" aria-label="Delete scene">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Action
            </Label>
            <Textarea
              rows={3}
              value={scene.action}
              onChange={(e) => onPatch({ action: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Dialogue
              </Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  onPatch({
                    dialogue: [
                      ...scene.dialogue,
                      { id: uid("dlg"), speaker: castNames[0] ?? "", line: "", direction: "" },
                    ],
                  })
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Line
              </Button>
            </div>
            {scene.dialogue.map((d, i) => (
              <div
                key={d.id}
                className="grid gap-2 rounded-xl border border-border/70 p-3 sm:grid-cols-[10rem_1fr]"
              >
                <div className="space-y-2">
                  <Input
                    value={d.speaker}
                    placeholder="Speaker"
                    onChange={(e) => {
                      const next = [...scene.dialogue];
                      next[i] = { ...d, speaker: e.target.value };
                      onPatch({ dialogue: next });
                    }}
                  />
                  <Input
                    value={d.direction ?? ""}
                    placeholder="(direction)"
                    onChange={(e) => {
                      const next = [...scene.dialogue];
                      next[i] = { ...d, direction: e.target.value };
                      onPatch({ dialogue: next });
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Textarea
                    rows={3}
                    value={d.line}
                    placeholder="Line"
                    onChange={(e) => {
                      const next = [...scene.dialogue];
                      next[i] = { ...d, line: e.target.value };
                      onPatch({ dialogue: next });
                    }}
                  />
                  <ConfirmDelete
                    title="Delete this dialogue line?"
                    description="This line will be removed from the scene script."
                    onConfirm={() => {
                      onPatch({ dialogue: scene.dialogue.filter((x) => x.id !== d.id) });
                      toast.success("Dialogue line deleted.");
                    }}
                    trigger={
                      <Button size="icon" variant="ghost" aria-label="Delete line">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Camera
            </Label>
            <Textarea
              rows={3}
              value={scene.camera}
              onChange={(e) => onPatch({ camera: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Mood</Label>
            <Input value={scene.mood} onChange={(e) => onPatch({ mood: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Duration (seconds)
            </Label>
            <Input
              type="number"
              min={1}
              value={scene.duration}
              onChange={(e) => onPatch({ duration: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div
              className="mx-auto flex aspect-[9/16] max-h-80 max-w-48 flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background p-5 text-center"
              aria-label="Scene media preview placeholder"
            >
              <Film className="h-7 w-7 text-primary" />
              <p className="mt-3 text-sm font-medium">Scene preview</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Media generation is staged for V0.2–V0.3.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.info("Image generation arrives in V0.2. Your scene prompt is ready.")
              }
            >
              <Image className="mr-2 h-4 w-4" /> Regenerate Image · V0.2
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.info("Provider-independent video generation arrives in V0.3.")}
            >
              <Video className="mr-2 h-4 w-4" /> Regenerate Video · V0.3
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info("Edit any dialogue line above; changes save automatically.")
              }
            >
              <MessageSquareText className="mr-2 h-4 w-4" /> Change Dialogue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info("Edit the camera direction above; changes save automatically.")
              }
            >
              <CameraIcon className="mr-2 h-4 w-4" /> Change Camera
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="sm:col-span-2"
              onClick={() => toast.info("Character voice generation arrives in V0.3.")}
            >
              <Mic className="mr-2 h-4 w-4" /> Generate Voice · V0.3
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
