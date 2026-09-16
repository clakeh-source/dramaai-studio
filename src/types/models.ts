/**
 * Core domain models for DramaAI Studio.
 * These mirror the intended PostgreSQL/Supabase schema so the local
 * repository can be swapped for a real database without UI changes.
 */

export type UUID = string;

export type VisualStyle =
  "Cinematic Realistic" | "Soap Opera" | "K-drama" | "Nollywood" | "Anime" | "Comic" | "Custom";

export const VISUAL_STYLES: VisualStyle[] = [
  "Cinematic Realistic",
  "Soap Opera",
  "K-drama",
  "Nollywood",
  "Anime",
  "Comic",
  "Custom",
];

export type AspectFormat = "9:16" | "16:9";

/** Approval workflow for a series. */
export type SeriesStatus =
  "Draft" | "Story Approved" | "Characters Approved" | "Script Approved" | "Ready for Media";

export const SERIES_STATUSES: SeriesStatus[] = [
  "Draft",
  "Story Approved",
  "Characters Approved",
  "Script Approved",
  "Ready for Media",
];

export type EpisodeStatus = "Outlined" | "Scripted" | "Approved" | "Ready for Media";
export const EPISODE_STATUSES: EpisodeStatus[] = [
  "Outlined",
  "Scripted",
  "Approved",
  "Ready for Media",
];

export type SceneStatus = "Draft" | "Needs Review" | "Approved" | "Locked";
export const SCENE_STATUSES: SceneStatus[] = ["Draft", "Needs Review", "Approved", "Locked"];

export interface DialogueLine {
  id: UUID;
  speaker: string;
  line: string;
  /** Optional performance note, e.g. "whispered, holding back tears". */
  direction?: string;
}

export interface Scene {
  id: UUID;
  episodeId: UUID;
  number: number;
  location: string;
  /** Seconds. */
  duration: number;
  action: string;
  characterIds: UUID[];
  dialogue: DialogueLine[];
  camera: string;
  mood: string;
  status: SceneStatus;
  imageAssetId?: UUID;
  videoAssetId?: UUID;
}

export interface Episode {
  id: UUID;
  seriesId: UUID;
  number: number;
  title: string;
  synopsis: string;
  status: EpisodeStatus;
  /** Seconds. */
  duration: number;
  scenes: Scene[];
}

export interface Character {
  id: UUID;
  seriesId: UUID;
  name: string;
  age: string;
  role: string;
  occupation: string;
  personality: string;
  goals: string;
  conflict: string;
  appearance: string;
  wardrobe: string;
  /** Placeholder until ElevenLabs voices land in V0.3. */
  voice: string;
  referenceImages: string[];
}

export interface EpisodeArcBeat {
  episodeId?: UUID;
  number: number;
  title: string;
  beat: string;
}

export interface SeriesBible {
  id: UUID;
  seriesId: UUID;
  title: string;
  logline: string;
  synopsis: string;
  world: string;
  themes: string;
  tone: string;
  continuityRules: string;
  episodeArc: EpisodeArcBeat[];
  updatedAt: string;
}

export interface Asset {
  id: UUID;
  seriesId: UUID;
  kind: "image" | "video" | "audio";
  label: string;
  /** Empty in V0.1 — media generation arrives in V0.2/V0.3. */
  url?: string;
  sceneId?: UUID;
  createdAt: string;
}

export type GenerationJobKind = "series-bible" | "image" | "video" | "voice";
export type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed";

export interface GenerationJob {
  id: UUID;
  seriesId: UUID;
  kind: GenerationJobKind;
  status: GenerationJobStatus;
  progress: number;
  message: string;
  createdAt: string;
}

export interface Series {
  id: UUID;
  title: string;
  premise: string;
  genre: string;
  audience: string;
  language: string;
  episodeCount: number;
  /** Seconds per episode. */
  episodeDuration: number;
  visualStyle: VisualStyle;
  format: AspectFormat;
  status: SeriesStatus;
  createdAt: string;
  updatedAt: string;
  bible?: SeriesBible;
  characters: Character[];
  episodes: Episode[];
  assets: Asset[];
  jobs: GenerationJob[];
}

export interface CreateSeriesInput {
  title: string;
  premise: string;
  genre: string;
  audience: string;
  language: string;
  episodeCount: number;
  episodeDuration: number;
  visualStyle: VisualStyle;
  format: AspectFormat;
}

export interface StudioUser {
  id: UUID;
  email: string;
  name: string;
}

export interface StudioState {
  series: Series[];
}
