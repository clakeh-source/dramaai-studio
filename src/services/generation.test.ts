import { describe, expect, it } from "vitest";
import { buildBundle } from "@/services/generation";
import type { CreateSeriesInput } from "@/types/models";

const input: CreateSeriesInput = {
  title: "Test Series",
  premise: "A detective finds a hidden theatre and must solve its final mystery.",
  genre: "Crime",
  audience: "Adults 18–34",
  language: "English (UK)",
  episodeCount: 6,
  episodeDuration: 30,
  visualStyle: "Cinematic Realistic",
  format: "9:16",
};

describe("buildBundle", () => {
  it("distributes every supported runtime without inventing extra seconds", () => {
    for (const episodeDuration of [30, 45, 90, 180]) {
      const bundle = buildBundle("series", { ...input, episodeDuration });
      const total = bundle.episodes[0]!.scenes.reduce((sum, scene) => sum + scene.duration, 0);
      expect(total).toBe(episodeDuration);
      expect(bundle.episodes[0]!.scenes.every((scene) => scene.duration >= 1)).toBe(true);
    }
  });

  it("links every arc beat to its stable episode id", () => {
    const bundle = buildBundle("series", input);
    expect(bundle.bible.episodeArc.map((beat) => beat.episodeId)).toEqual(
      bundle.episodes.map((episode) => episode.id),
    );
  });
});
