import type { Episode, Series } from "@/types/models";

export function normalizeDuration(value: number, fallback: number) {
  return Number.isFinite(value) && value >= 1 ? Math.round(value) : fallback;
}

export function synchronizeEpisodes(series: Series, episodes: Episode[]): Series {
  const numbered = episodes.map((episode, index) => ({ ...episode, number: index + 1 }));
  if (!series.bible) return { ...series, episodes: numbered, episodeCount: numbered.length };

  const previousArc = series.bible.episodeArc;
  const episodeArc = numbered.map((episode) => {
    const originalNumber = series.episodes.find((item) => item.id === episode.id)?.number;
    const previous = previousArc.find(
      (beat) =>
        beat.episodeId === episode.id || (!beat.episodeId && beat.number === originalNumber),
    );
    return {
      episodeId: episode.id,
      number: episode.number,
      title: episode.title,
      beat: previous?.beat ?? episode.synopsis,
    };
  });
  return {
    ...series,
    episodes: numbered,
    episodeCount: numbered.length,
    bible: { ...series.bible, episodeArc, updatedAt: new Date().toISOString() },
  };
}

export function removeCharacterFromSeries(series: Series, characterId: string): Series {
  return {
    ...series,
    characters: series.characters.filter((character) => character.id !== characterId),
    episodes: series.episodes.map((episode) => ({
      ...episode,
      scenes: episode.scenes.map((scene) => ({
        ...scene,
        characterIds: scene.characterIds.filter((id) => id !== characterId),
      })),
    })),
  };
}
