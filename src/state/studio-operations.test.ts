import { describe, expect, it } from "vitest";
import { seedSeries } from "@/data/seed";
import {
  normalizeDuration,
  removeCharacterFromSeries,
  synchronizeEpisodes,
} from "@/state/studio-operations";

describe("studio operations", () => {
  it("keeps the episode list, count, numbering and arc aligned", () => {
    const series = seedSeries();
    const episodes = series.episodes.slice(1);
    episodes[0] = { ...episodes[0]!, title: "A renamed second episode" };
    const next = synchronizeEpisodes(series, episodes);

    expect(next.episodeCount).toBe(9);
    expect(next.episodes[0]!.number).toBe(1);
    expect(next.bible!.episodeArc).toHaveLength(9);
    expect(next.bible!.episodeArc[0]).toMatchObject({
      episodeId: next.episodes[0]!.id,
      number: 1,
      title: "A renamed second episode",
    });
  });

  it("migrates legacy arc beats using each episode's original number", () => {
    const series = seedSeries();
    series.bible!.episodeArc = series.bible!.episodeArc.map(
      ({ episodeId: _episodeId, ...beat }) => beat,
    );
    const expectedBeat = series.bible!.episodeArc[2]!.beat;
    const episodes = series.episodes.filter((episode) => episode.number !== 2);
    const next = synchronizeEpisodes(series, episodes);

    expect(next.bible!.episodeArc[1]).toMatchObject({
      episodeId: series.episodes[2]!.id,
      number: 2,
      beat: expectedBeat,
    });
  });

  it("removes deleted character references from every scene", () => {
    const series = seedSeries();
    const characterId = series.characters[0]!.id;
    const next = removeCharacterFromSeries(series, characterId);

    expect(next.characters.some((character) => character.id === characterId)).toBe(false);
    expect(
      next.episodes.every((episode) =>
        episode.scenes.every((scene) => !scene.characterIds.includes(characterId)),
      ),
    ).toBe(true);
  });

  it("rejects invalid scene durations at the mutation boundary", () => {
    expect(normalizeDuration(12.6, 8)).toBe(13);
    expect(normalizeDuration(0, 8)).toBe(8);
    expect(normalizeDuration(Number.NaN, 8)).toBe(8);
  });
});
