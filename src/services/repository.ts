import { z } from "zod";
import type { StudioState } from "@/types/models";
import { seedSeries } from "@/data/seed";

export interface LoadedStudio {
  state: StudioState;
  revision: number;
}

export class StudioConflictError extends Error {
  constructor() {
    super("Studio data changed in another tab.");
    this.name = "StudioConflictError";
  }
}

export interface StudioRepository {
  load(): Promise<LoadedStudio>;
  save(state: StudioState, expectedRevision: number): Promise<number>;
  reset(expectedRevision: number): Promise<LoadedStudio>;
  exportRaw(): string | null;
  subscribe(listener: (snapshot: LoadedStudio) => void): () => void;
}

export const STORAGE_KEY = "dramaai.studio.v1";
const RECOVERY_PREFIX = "dramaai.studio.recovery";

const dialogueSchema = z.object({
  id: z.string().min(1),
  speaker: z.string(),
  line: z.string(),
  direction: z.string().optional(),
});
const sceneSchema = z.object({
  id: z.string().min(1),
  episodeId: z.string().min(1),
  number: z.number().int().positive(),
  location: z.string(),
  duration: z.number().finite().positive(),
  action: z.string(),
  characterIds: z.array(z.string()),
  dialogue: z.array(dialogueSchema),
  camera: z.string(),
  mood: z.string(),
  status: z.enum(["Draft", "Needs Review", "Approved", "Locked"]),
  imageAssetId: z.string().optional(),
  videoAssetId: z.string().optional(),
});
const episodeSchema = z.object({
  id: z.string().min(1),
  seriesId: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string(),
  synopsis: z.string(),
  status: z.enum(["Outlined", "Scripted", "Approved", "Ready for Media"]),
  duration: z.number().finite().positive(),
  scenes: z.array(sceneSchema),
});
const characterSchema = z.object({
  id: z.string().min(1),
  seriesId: z.string().min(1),
  name: z.string(),
  age: z.string(),
  role: z.string(),
  occupation: z.string(),
  personality: z.string(),
  goals: z.string(),
  conflict: z.string(),
  appearance: z.string(),
  wardrobe: z.string(),
  voice: z.string(),
  referenceImages: z.array(z.string()),
});
const bibleSchema = z.object({
  id: z.string().min(1),
  seriesId: z.string().min(1),
  title: z.string(),
  logline: z.string(),
  synopsis: z.string(),
  world: z.string(),
  themes: z.string(),
  tone: z.string(),
  continuityRules: z.string(),
  episodeArc: z.array(
    z.object({
      episodeId: z.string().optional(),
      number: z.number().int().positive(),
      title: z.string(),
      beat: z.string(),
    }),
  ),
  updatedAt: z.string(),
});
const assetSchema = z.object({
  id: z.string().min(1),
  seriesId: z.string().min(1),
  kind: z.enum(["image", "video", "audio"]),
  label: z.string(),
  url: z.string().optional(),
  sceneId: z.string().optional(),
  createdAt: z.string(),
});
const jobSchema = z.object({
  id: z.string().min(1),
  seriesId: z.string().min(1),
  kind: z.enum(["series-bible", "image", "video", "voice"]),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  progress: z.number().finite().min(0).max(100),
  message: z.string(),
  createdAt: z.string(),
});
const seriesSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  premise: z.string(),
  genre: z.string(),
  audience: z.string(),
  language: z.string(),
  episodeCount: z.number().int().nonnegative(),
  episodeDuration: z.number().finite().positive(),
  visualStyle: z.enum([
    "Cinematic Realistic",
    "Soap Opera",
    "K-drama",
    "Nollywood",
    "Anime",
    "Comic",
    "Custom",
  ]),
  format: z.enum(["9:16", "16:9"]),
  status: z.enum([
    "Draft",
    "Story Approved",
    "Characters Approved",
    "Script Approved",
    "Ready for Media",
  ]),
  createdAt: z.string(),
  updatedAt: z.string(),
  bible: bibleSchema.optional(),
  characters: z.array(characterSchema),
  episodes: z.array(episodeSchema),
  assets: z.array(assetSchema),
  jobs: z.array(jobSchema),
});

export const studioStateSchema = z.object({ series: z.array(seriesSchema) });
const envelopeSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative(),
  state: studioStateSchema,
});

function initialState(): StudioState {
  return { series: [seedSeries()] };
}

function readSnapshot(raw: string): LoadedStudio {
  const parsed: unknown = JSON.parse(raw);
  const envelope = envelopeSchema.safeParse(parsed);
  if (envelope.success)
    return { state: envelope.data.state as StudioState, revision: envelope.data.revision };
  const legacy = studioStateSchema.safeParse(parsed);
  if (legacy.success) return { state: legacy.data as StudioState, revision: 0 };
  throw new Error("Stored studio data is invalid.");
}

function currentSnapshot(): LoadedStudio | undefined {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? readSnapshot(raw) : undefined;
}

function writeSnapshot(snapshot: LoadedStudio) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...snapshot }));
}

export class LocalStudioRepository implements StudioRepository {
  async load(): Promise<LoadedStudio> {
    if (typeof window === "undefined") return { state: initialState(), revision: 0 };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = { state: initialState(), revision: 1 };
      writeSnapshot(fresh);
      return fresh;
    }
    try {
      const loaded = readSnapshot(raw);
      if (loaded.revision !== 0) return loaded;
      const migrated = { state: loaded.state, revision: 1 };
      writeSnapshot(migrated);
      return migrated;
    } catch (error) {
      try {
        window.localStorage.setItem(`${RECOVERY_PREFIX}.${new Date().toISOString()}`, raw);
      } catch {
        // Keep the original value untouched if recovery storage is unavailable.
      }
      throw error;
    }
  }

  async save(state: StudioState, expectedRevision: number): Promise<number> {
    if (typeof window === "undefined") return expectedRevision;
    studioStateSchema.parse(state);
    const currentRevision = currentSnapshot()?.revision ?? 0;
    if (currentRevision !== expectedRevision) throw new StudioConflictError();
    const revision = currentRevision + 1;
    writeSnapshot({ state, revision });
    return revision;
  }

  async reset(expectedRevision: number): Promise<LoadedStudio> {
    const state = initialState();
    const revision = Math.max(1, expectedRevision + 1);
    studioStateSchema.parse(state);
    writeSnapshot({ state, revision });
    return { state, revision };
  }

  exportRaw(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  }

  subscribe(listener: (snapshot: LoadedStudio) => void): () => void {
    if (typeof window === "undefined") return () => undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        listener(readSnapshot(event.newValue));
      } catch {
        // Keep the current validated state when another tab writes invalid data.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
}

export const studioRepository: StudioRepository = new LocalStudioRepository();
