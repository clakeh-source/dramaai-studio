import type { StudioState } from "@/types/models";
import { seedSeries } from "@/data/seed";

/**
 * Data access boundary. V0.1 persists to localStorage; a Supabase/PostgreSQL
 * implementation can be dropped in here without touching the UI layer.
 */
export interface StudioRepository {
  load(): Promise<StudioState>;
  save(state: StudioState): Promise<void>;
  reset(): Promise<StudioState>;
}

const STORAGE_KEY = "dramaai.studio.v1";

function initialState(): StudioState {
  return { series: [seedSeries()] };
}

export class LocalStudioRepository implements StudioRepository {
  async load(): Promise<StudioState> {
    if (typeof window === "undefined") return initialState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = initialState();
        await this.save(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw) as StudioState;
      if (!parsed || !Array.isArray(parsed.series)) throw new Error("Corrupt studio state");
      return parsed;
    } catch {
      const fresh = initialState();
      await this.save(fresh);
      return fresh;
    }
  }

  async save(state: StudioState): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to persist studio state", err);
      throw new Error("Could not save your changes locally.");
    }
  }

  async reset(): Promise<StudioState> {
    const fresh = initialState();
    await this.save(fresh);
    return fresh;
  }
}

export const studioRepository: StudioRepository = new LocalStudioRepository();
