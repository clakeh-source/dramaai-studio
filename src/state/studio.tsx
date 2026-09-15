import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { uid } from "@/lib/id";
import { studioRepository } from "@/services/repository";
import { buildBundle } from "@/services/generation";
import type {
  Character,
  CreateSeriesInput,
  Episode,
  Scene,
  Series,
  SeriesBible,
  StudioState,
} from "@/types/models";

interface StudioContextValue {
  state: StudioState;
  ready: boolean;
  getSeries: (id: string) => Series | undefined;
  createSeries: (input: CreateSeriesInput) => Series;
  updateSeries: (id: string, patch: Partial<Series>) => void;
  deleteSeries: (id: string) => void;
  applyGeneration: (id: string, input: CreateSeriesInput) => void;
  updateBible: (seriesId: string, patch: Partial<SeriesBible>) => void;
  upsertCharacter: (seriesId: string, character: Character) => void;
  removeCharacter: (seriesId: string, characterId: string) => void;
  newCharacter: (seriesId: string) => Character;
  updateEpisode: (seriesId: string, episodeId: string, patch: Partial<Episode>) => void;
  addEpisode: (seriesId: string) => Episode;
  removeEpisode: (seriesId: string, episodeId: string) => void;
  addScene: (seriesId: string, episodeId: string) => Scene;
  updateScene: (seriesId: string, episodeId: string, sceneId: string, patch: Partial<Scene>) => void;
  duplicateScene: (seriesId: string, episodeId: string, sceneId: string) => void;
  removeScene: (seriesId: string, episodeId: string, sceneId: string) => void;
  moveScene: (seriesId: string, episodeId: string, sceneId: string, dir: -1 | 1) => void;
  resetAll: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

const EMPTY: StudioState = { series: [] };

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    studioRepository
      .load()
      .then((loaded) => {
        if (alive) setState(loaded);
      })
      .catch(() => toast.error("Could not load your studio data."))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    studioRepository.save(state).catch(() => toast.error("Changes could not be saved on this device."));
  }, [state, ready]);

  const mutateSeries = useCallback((id: string, fn: (s: Series) => Series) => {
    setState((prev) => ({
      series: prev.series.map((s) =>
        s.id === id ? { ...fn(s), updatedAt: new Date().toISOString() } : s,
      ),
    }));
  }, []);

  const value = useMemo<StudioContextValue>(() => {
    const renumber = (scenes: Scene[]) => scenes.map((s, i) => ({ ...s, number: i + 1 }));

    const mutateEpisode = (
      seriesId: string,
      episodeId: string,
      fn: (e: Episode) => Episode,
    ) =>
      mutateSeries(seriesId, (s) => ({
        ...s,
        episodes: s.episodes.map((e) => (e.id === episodeId ? fn(e) : e)),
      }));

    return {
      state,
      ready,
      getSeries: (id) => state.series.find((s) => s.id === id),
      createSeries: (input) => {
        const nowIso = new Date().toISOString();
        const series: Series = {
          id: uid("srs"),
          ...input,
          status: "Draft",
          createdAt: nowIso,
          updatedAt: nowIso,
          characters: [],
          episodes: [],
          assets: [],
          jobs: [],
        };
        setState((prev) => ({ series: [series, ...prev.series] }));
        return series;
      },
      updateSeries: (id, patch) => mutateSeries(id, (s) => ({ ...s, ...patch })),
      deleteSeries: (id) => setState((prev) => ({ series: prev.series.filter((s) => s.id !== id) })),
      applyGeneration: (id, input) =>
        mutateSeries(id, (s) => {
          const bundle = buildBundle(id, input);
          return {
            ...s,
            ...input,
            bible: bundle.bible,
            characters: bundle.characters,
            episodes: bundle.episodes,
            status: "Story Approved",
            jobs: [
              {
                id: uid("job"),
                seriesId: id,
                kind: "series-bible",
                status: "succeeded",
                progress: 100,
                message: "Series bible generated",
                createdAt: new Date().toISOString(),
              },
              ...s.jobs,
            ],
          };
        }),
      updateBible: (seriesId, patch) =>
        mutateSeries(seriesId, (s) =>
          s.bible
            ? { ...s, bible: { ...s.bible, ...patch, updatedAt: new Date().toISOString() } }
            : s,
        ),
      upsertCharacter: (seriesId, character) =>
        mutateSeries(seriesId, (s) => ({
          ...s,
          characters: s.characters.some((c) => c.id === character.id)
            ? s.characters.map((c) => (c.id === character.id ? character : c))
            : [...s.characters, character],
        })),
      removeCharacter: (seriesId, characterId) =>
        mutateSeries(seriesId, (s) => ({
          ...s,
          characters: s.characters.filter((c) => c.id !== characterId),
        })),
      newCharacter: (seriesId) => ({
        id: uid("chr"),
        seriesId,
        name: "",
        age: "",
        role: "",
        occupation: "",
        personality: "",
        goals: "",
        conflict: "",
        appearance: "",
        wardrobe: "",
        voice: "Voice casting arrives in V0.3",
        referenceImages: [],
      }),
      updateEpisode: (seriesId, episodeId, patch) =>
        mutateEpisode(seriesId, episodeId, (e) => ({ ...e, ...patch })),
      addEpisode: (seriesId) => {
        const series = state.series.find((s) => s.id === seriesId);
        const number = (series?.episodes.length ?? 0) + 1;
        const episode: Episode = {
          id: uid("eps"),
          seriesId,
          number,
          title: `Episode ${number}`,
          synopsis: "",
          status: "Outlined",
          duration: series?.episodeDuration ?? 90,
          scenes: [],
        };
        mutateSeries(seriesId, (s) => ({ ...s, episodes: [...s.episodes, episode] }));
        return episode;
      },
      removeEpisode: (seriesId, episodeId) =>
        mutateSeries(seriesId, (s) => ({
          ...s,
          episodes: s.episodes
            .filter((e) => e.id !== episodeId)
            .map((e, i) => ({ ...e, number: i + 1 })),
        })),
      addScene: (seriesId, episodeId) => {
        const scene: Scene = {
          id: uid("scn"),
          episodeId,
          number: 0,
          location: "INT. NEW LOCATION — DAY",
          duration: 20,
          action: "",
          characterIds: [],
          dialogue: [],
          camera: "",
          mood: "",
          status: "Draft",
        };
        mutateEpisode(seriesId, episodeId, (e) => ({
          ...e,
          scenes: renumber([...e.scenes, scene]),
        }));
        return scene;
      },
      updateScene: (seriesId, episodeId, sceneId, patch) =>
        mutateEpisode(seriesId, episodeId, (e) => ({
          ...e,
          scenes: e.scenes.map((sc) => (sc.id === sceneId ? { ...sc, ...patch } : sc)),
        })),
      duplicateScene: (seriesId, episodeId, sceneId) =>
        mutateEpisode(seriesId, episodeId, (e) => {
          const idx = e.scenes.findIndex((sc) => sc.id === sceneId);
          if (idx < 0) return e;
          const source = e.scenes[idx]!;
          const copy: Scene = {
            ...source,
            id: uid("scn"),
            status: "Draft",
            dialogue: source.dialogue.map((d) => ({ ...d, id: uid("dlg") })),
          };
          const next = [...e.scenes];
          next.splice(idx + 1, 0, copy);
          return { ...e, scenes: renumber(next) };
        }),
      removeScene: (seriesId, episodeId, sceneId) =>
        mutateEpisode(seriesId, episodeId, (e) => ({
          ...e,
          scenes: renumber(e.scenes.filter((sc) => sc.id !== sceneId)),
        })),
      moveScene: (seriesId, episodeId, sceneId, dir) =>
        mutateEpisode(seriesId, episodeId, (e) => {
          const idx = e.scenes.findIndex((sc) => sc.id === sceneId);
          const target = idx + dir;
          if (idx < 0 || target < 0 || target >= e.scenes.length) return e;
          const next = [...e.scenes];
          [next[idx], next[target]] = [next[target]!, next[idx]!];
          return { ...e, scenes: renumber(next) };
        }),
      resetAll: () => {
        studioRepository.reset().then((fresh) => setState(fresh));
      },
    };
  }, [state, ready, mutateSeries]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
