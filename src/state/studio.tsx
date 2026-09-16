import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { uid } from "@/lib/id";
import { StudioConflictError, studioRepository } from "@/services/repository";
import { buildBundle } from "@/services/generation";
import {
  normalizeDuration,
  removeCharacterFromSeries,
  synchronizeEpisodes,
} from "@/state/studio-operations";
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
  loadError: string | null;
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
  updateScene: (
    seriesId: string,
    episodeId: string,
    sceneId: string,
    patch: Partial<Scene>,
  ) => void;
  duplicateScene: (seriesId: string, episodeId: string, sceneId: string) => void;
  removeScene: (seriesId: string, episodeId: string, sceneId: string) => void;
  moveScene: (seriesId: string, episodeId: string, sceneId: string, dir: -1 | 1) => void;
  resetAll: () => void;
  downloadRecovery: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

const EMPTY: StudioState = { series: [] };

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudioState>(EMPTY);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const revisionRef = useRef(0);
  const persistedStateRef = useRef<StudioState | undefined>(undefined);
  const saveQueueRef = useRef(Promise.resolve());
  const remoteEpochRef = useRef(0);

  useEffect(() => {
    let alive = true;
    studioRepository
      .load()
      .then((loaded) => {
        if (!alive) return;
        revisionRef.current = loaded.revision;
        persistedStateRef.current = loaded.state;
        setState(loaded.state);
        setInitialized(true);
      })
      .catch(() => {
        setLoadError("Stored studio data is invalid. Download a recovery copy before resetting.");
        toast.error(
          "Stored studio data is invalid. Your original data was preserved for recovery.",
        );
      })
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!initialized || persistedStateRef.current === state) return;
    const nextState = state;
    const epoch = remoteEpochRef.current;
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      if (epoch !== remoteEpochRef.current) return;
      try {
        revisionRef.current = await studioRepository.save(nextState, revisionRef.current);
        persistedStateRef.current = nextState;
      } catch (error) {
        if (error instanceof StudioConflictError) {
          const latest = await studioRepository.load();
          remoteEpochRef.current += 1;
          revisionRef.current = latest.revision;
          persistedStateRef.current = latest.state;
          setState(latest.state);
          toast.warning(
            "Newer edits from another tab were loaded. Your conflicting edit was not saved.",
          );
          return;
        }
        toast.error("Changes could not be saved on this device.");
      }
    });
  }, [state, initialized]);

  useEffect(
    () =>
      studioRepository.subscribe((latest) => {
        remoteEpochRef.current += 1;
        revisionRef.current = latest.revision;
        persistedStateRef.current = latest.state;
        setState(latest.state);
        toast.info("Edits from another tab were loaded.");
      }),
    [],
  );

  const mutateSeries = useCallback((id: string, fn: (s: Series) => Series) => {
    setState((prev) => ({
      series: prev.series.map((s) =>
        s.id === id ? { ...fn(s), updatedAt: new Date().toISOString() } : s,
      ),
    }));
  }, []);

  const value = useMemo<StudioContextValue>(() => {
    const renumber = (scenes: Scene[]) => scenes.map((s, i) => ({ ...s, number: i + 1 }));

    const mutateEpisode = (seriesId: string, episodeId: string, fn: (e: Episode) => Episode) =>
      mutateSeries(seriesId, (s) => ({
        ...s,
        episodes: s.episodes.map((e) => (e.id === episodeId ? fn(e) : e)),
      }));

    return {
      state,
      ready,
      loadError,
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
      deleteSeries: (id) =>
        setState((prev) => ({ series: prev.series.filter((s) => s.id !== id) })),
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
        mutateSeries(seriesId, (s) => removeCharacterFromSeries(s, characterId)),
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
        mutateSeries(seriesId, (s) => {
          const episodes = s.episodes.map((episode) =>
            episode.id === episodeId ? { ...episode, ...patch } : episode,
          );
          return synchronizeEpisodes(s, episodes);
        }),
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
        mutateSeries(seriesId, (s) => synchronizeEpisodes(s, [...s.episodes, episode]));
        return episode;
      },
      removeEpisode: (seriesId, episodeId) =>
        mutateSeries(seriesId, (s) =>
          synchronizeEpisodes(
            s,
            s.episodes.filter((e) => e.id !== episodeId),
          ),
        ),
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
          scenes: e.scenes.map((sc) =>
            sc.id === sceneId
              ? {
                  ...sc,
                  ...patch,
                  ...(patch.duration === undefined
                    ? {}
                    : { duration: normalizeDuration(patch.duration, sc.duration) }),
                }
              : sc,
          ),
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
        studioRepository
          .reset(revisionRef.current)
          .then((fresh) => {
            revisionRef.current = fresh.revision;
            persistedStateRef.current = fresh.state;
            setState(fresh.state);
            setInitialized(true);
            setLoadError(null);
          })
          .catch(() => toast.error("Studio data could not be reset on this device."));
      },
      downloadRecovery: () => {
        const raw = studioRepository.exportRaw();
        if (!raw) {
          toast.error("No recovery data is available.");
          return;
        }
        const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `dramaai-studio-recovery-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
    };
  }, [state, ready, loadError, mutateSeries]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
