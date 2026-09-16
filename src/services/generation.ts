import { uid } from "@/lib/id";
import type {
  Character,
  CreateSeriesInput,
  Episode,
  EpisodeArcBeat,
  Scene,
  SeriesBible,
} from "@/types/models";

/**
 * Simulated story generation for V0.1.
 * V0.2 replaces this with an OpenAI structured-output call behind the same
 * signature, so callers do not change.
 */

export interface GeneratedBundle {
  bible: SeriesBible;
  characters: Character[];
  episodes: Episode[];
}

const BEAT_TEMPLATES = [
  "The world is established and the deal is struck.",
  "The new environment reveals its first hidden rule.",
  "A clue surfaces that contradicts the official story.",
  "A public event forces the lie into daylight.",
  "Evidence is gathered in secret; trust begins to fracture.",
  "An outsider offers an escape with impossible terms.",
  "Violence or scandal proves the stakes are real.",
  "A journey away from home uncovers the whole truth.",
  "The protagonist must choose between exposure and love.",
  "The secret breaks, and a new life is chosen on their own terms.",
];

function firstSentence(text: string): string {
  const s = text.trim().split(/(?<=[.!?])\s/)[0] ?? text.trim();
  return s.replace(/\s+/g, " ").slice(0, 180);
}

export function buildBundle(seriesId: string, input: CreateSeriesInput): GeneratedBundle {
  const premise = input.premise.trim();
  const lead = `${input.genre} lead`;

  const episodeArc: EpisodeArcBeat[] = Array.from({ length: input.episodeCount }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1}`,
    beat: BEAT_TEMPLATES[i % BEAT_TEMPLATES.length]!,
  }));

  const bible: SeriesBible = {
    id: uid("bib"),
    seriesId,
    title: input.title,
    logline: firstSentence(premise),
    synopsis: `${premise}\n\nAcross ${input.episodeCount} episodes the story escalates from a private arrangement into a public reckoning, told in ${input.format} for ${input.audience.toLowerCase()} in ${input.language}.`,
    world: `The series is grounded in a specific, tactile setting rendered in a ${input.visualStyle.toLowerCase()} visual language. Locations recur so audiences learn the geography within the first three episodes.`,
    themes: "Power and dependency • the cost of keeping a secret • chosen family • reinvention.",
    tone: `${input.genre}, paced for short-form: a hook in the first three seconds and a turn before the final beat of every episode.`,
    continuityRules: `1. Keep a signature prop on the protagonist in every episode.\n2. Reveal the central secret in stages, never all at once.\n3. Hold the ${input.format} framing discipline — one clear subject per shot.\n4. Each episode runs about ${Math.round(input.episodeDuration)} seconds.`,
    episodeArc,
    updatedAt: new Date().toISOString(),
  };

  const characters: Character[] = [
    {
      id: uid("chr"),
      seriesId,
      name: "Lead Protagonist",
      age: "28",
      role: "Protagonist",
      occupation: "To be refined",
      personality: "Resourceful, guarded, quick with a deflecting joke.",
      goals: "Protect the people who depend on them without losing themselves.",
      conflict: "The only path forward requires a compromise they swore never to make.",
      appearance: "Expressive face that reads clearly in close-up vertical framing.",
      wardrobe: "A restrained palette with one recurring signature item.",
      voice: "Voice casting arrives in V0.3",
      referenceImages: [],
    },
    {
      id: uid("chr"),
      seriesId,
      name: "Counterpart",
      age: "36",
      role: lead,
      occupation: "To be refined",
      personality: "Composed, withholding, unexpectedly generous.",
      goals: "Keep a secret intact while it slowly destroys them.",
      conflict: "Telling the truth would cost the one relationship they value.",
      appearance: "Still, deliberate physicality; reads powerful even in tight frames.",
      wardrobe: "Tailored, monochrome, one heirloom detail.",
      voice: "Voice casting arrives in V0.3",
      referenceImages: [],
    },
  ];

  const ep1Id = uid("eps");
  const sceneCount = 4;
  const baseSceneDuration = Math.floor(input.episodeDuration / sceneCount);
  const extraSeconds = input.episodeDuration % sceneCount;
  const scenes: Scene[] = Array.from({ length: sceneCount }, (_, i) => ({
    id: uid("scn"),
    episodeId: ep1Id,
    number: i + 1,
    location: [
      "INT. OPENING LOCATION — NIGHT",
      "INT. MEETING PLACE — DAY",
      "INT. PRIVATE SPACE — NIGHT",
      "EXT. THRESHOLD — DAWN",
    ][i]!,
    duration: baseSceneDuration + (i < extraSeconds ? 1 : 0),
    action: [
      `Cold open. We meet the protagonist mid-problem, established in one image drawn from: ${firstSentence(premise)}`,
      "The offer is made. The terms are stated plainly and refused once before being accepted.",
      "Alone, the protagonist counts the cost. A call from someone they love makes the decision for them.",
      "Arrival at the new world. The door opens before they knock — the episode ends on the hook.",
    ][i]!,
    characterIds: i === 0 || i === 2 ? [characters[0]!.id] : characters.map((c) => c.id),
    dialogue: [
      {
        id: uid("dlg"),
        speaker: characters[i % 2]!.name,
        line: [
          "No name. No sender. Of course.",
          "One year. My terms, your silence.",
          "It's handled. It's always handled.",
          "Welcome home.",
        ][i]!,
        direction: ["under their breath", "flat, rehearsed", "lying gently", "for the cameras"][i]!,
      },
    ],
    camera: [
      "Slow push-in, shallow depth of field.",
      "Static two-shot into over-the-shoulder singles.",
      "Handheld medium with warm practical key light.",
      "Crane down to a tight close on the final reaction.",
    ][i]!,
    mood: ["Unsettled curiosity", "Cold tension", "Quiet desperation", "Ominous elegance"][i]!,
    status: "Draft",
  }));

  const episodes: Episode[] = episodeArc.map((beat, i) =>
    i === 0
      ? {
          id: ep1Id,
          seriesId,
          number: 1,
          title: beat.title,
          synopsis: beat.beat,
          status: "Scripted",
          duration: input.episodeDuration,
          scenes,
        }
      : {
          id: uid("eps"),
          seriesId,
          number: beat.number,
          title: beat.title,
          synopsis: beat.beat,
          status: "Outlined",
          duration: input.episodeDuration,
          scenes: [],
        },
  );

  for (const [index, episode] of episodes.entries()) {
    episodeArc[index]!.episodeId = episode.id;
  }

  return { bible, characters, episodes };
}

export const GENERATION_STEPS = [
  "Reading your premise…",
  "Shaping the world and tone…",
  "Casting two leads…",
  "Breaking the episode arc…",
  "Writing Episode 1 scenes…",
  "Checking continuity…",
];
