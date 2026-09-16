import type { Series } from "@/types/models";

const now = new Date();
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

const SERIES_ID = "srs_billionaire";

const arc = [
  {
    number: 1,
    title: "The Contract",
    beat: "Ada signs a one-year marriage contract with a man whose name she is forbidden to speak.",
  },
  {
    number: 2,
    title: "House of Glass",
    beat: "Moving into the Kensington townhouse, Ada discovers a locked wing and a staff who never make eye contact.",
  },
  {
    number: 3,
    title: "The Photograph",
    beat: "A picture of a woman who looks exactly like Ada surfaces in Julian's study.",
  },
  {
    number: 4,
    title: "Gala Night",
    beat: "Their first public appearance goes perfectly until a journalist calls Ada by the dead woman's name.",
  },
  {
    number: 5,
    title: "Ledger",
    beat: "Ada finds payments routed to a clinic in Zurich and starts recording Julian's calls.",
  },
  {
    number: 6,
    title: "The Brother",
    beat: "Julian's half-brother Marcus offers Ada a way out — for a price she can't pay.",
  },
  {
    number: 7,
    title: "Fire Exit",
    beat: "A staged break-in nearly kills Ada; Julian's reaction tells her he loves her.",
  },
  {
    number: 8,
    title: "Zurich",
    beat: "Ada travels alone and meets the woman from the photograph, very much alive.",
  },
  {
    number: 9,
    title: "Testimony",
    beat: "The contract becomes evidence. Ada must choose between the truth and the man.",
  },
  {
    number: 10,
    title: "Secret Keeper",
    beat: "Ada exposes Marcus, burns the contract, and stays — on her own terms.",
  },
];

const characters = [
  {
    id: "chr_ada",
    seriesId: SERIES_ID,
    name: "Ada Obialo",
    age: "28",
    role: "Protagonist",
    occupation: "Archivist at a private London library",
    personality:
      "Watchful, dry-humoured, allergic to being handled. Fiercely loyal once trust is earned.",
    goals:
      "Pay off her late father's debts and keep her sister in school — without selling her own name.",
    conflict: "Every answer she wants is behind a door she promised never to open.",
    appearance:
      "Deep brown skin, close-cropped natural hair, a small scar through her left eyebrow.",
    wardrobe: "Charcoal wool, ivory silk shirts, one inherited gold bangle she never removes.",
    voice: "Warm mezzo, clipped London vowels — voice casting arrives in V0.3",
    referenceImages: [],
  },
  {
    id: "chr_julian",
    seriesId: SERIES_ID,
    name: "Julian Ashcombe",
    age: "37",
    role: "Male lead / antagonist-adjacent",
    occupation: "CEO, Ashcombe Holdings",
    personality: "Controlled to the millimetre. Generous with money, miserly with truth.",
    goals:
      "Protect a secret that would dismantle his family's estate — and, unexpectedly, protect Ada.",
    conflict: "Telling Ada the truth destroys the only thing keeping her safe.",
    appearance: "Tall, pale, greying at the temples, a boxer's knuckles under tailored cuffs.",
    wardrobe: "Navy bespoke suits, no tie, an unwound heirloom watch.",
    voice: "Low baritone, deliberate pacing — voice casting arrives in V0.3",
    referenceImages: [],
  },
];

const episode1Scenes = [
  {
    id: "scn_101",
    episodeId: "eps_1",
    number: 1,
    location: "INT. PRIVATE LIBRARY READING ROOM — LONDON — NIGHT",
    duration: 22,
    action:
      "Rain streaks the tall windows. Ada re-shelves a water-damaged ledger. A courier sets a black envelope beside her hand and leaves without a word.",
    characterIds: ["chr_ada"],
    dialogue: [
      {
        id: "dlg_1",
        speaker: "Ada",
        line: "No signature. No sender. Of course.",
        direction: "under her breath",
      },
    ],
    camera: "Slow push-in from medium to close on the envelope, shallow depth of field.",
    mood: "Unsettled curiosity",
    status: "Approved" as const,
  },
  {
    id: "scn_102",
    episodeId: "eps_1",
    number: 2,
    location: "INT. ASHCOMBE HOLDINGS — BOARDROOM — DAY",
    duration: 26,
    action:
      "Glass, grey light, the city forty floors down. Julian slides a contract across the table. Ada does not sit.",
    characterIds: ["chr_ada", "chr_julian"],
    dialogue: [
      {
        id: "dlg_2",
        speaker: "Julian",
        line: "One year. My name, your silence.",
        direction: "flat, rehearsed",
      },
      { id: "dlg_3", speaker: "Ada", line: "And if I read it before I sign it?" },
      { id: "dlg_4", speaker: "Julian", line: "Then you'll leave.", direction: "almost kind" },
    ],
    camera: "Static two-shot, then over-the-shoulder singles on the line 'Then you'll leave.'",
    mood: "Cold tension",
    status: "Approved" as const,
  },
  {
    id: "scn_103",
    episodeId: "eps_1",
    number: 3,
    location: "INT. ADA'S FLAT — KITCHEN — NIGHT",
    duration: 24,
    action:
      "Ada spreads unpaid bills across the counter. Her sister video-calls about tuition. Ada smiles through it and hangs up, then picks up the pen.",
    characterIds: ["chr_ada"],
    dialogue: [
      {
        id: "dlg_5",
        speaker: "Ada",
        line: "It's handled. It's always handled.",
        direction: "to her sister, lying",
      },
    ],
    camera: "Handheld medium, practical lamp key light, warm against blue window.",
    mood: "Quiet desperation",
    status: "Needs Review" as const,
  },
  {
    id: "scn_104",
    episodeId: "eps_1",
    number: 4,
    location: "EXT. KENSINGTON TOWNHOUSE — DAWN",
    duration: 18,
    action:
      "Ada steps out of a black car with one suitcase. The door opens before she knocks. Behind her, a photographer's shutter clicks once.",
    characterIds: ["chr_ada", "chr_julian"],
    dialogue: [
      {
        id: "dlg_6",
        speaker: "Julian",
        line: "Welcome home, Mrs Ashcombe.",
        direction: "for the camera, not for her",
      },
    ],
    camera: "Crane down to eye level, ending on a tight close of Ada's expression shifting.",
    mood: "Ominous elegance",
    status: "Draft" as const,
  },
];

export function seedSeries(): Series {
  return {
    id: SERIES_ID,
    title: "The Billionaire's Secret",
    premise:
      "A broke London archivist signs a one-year contract marriage with a reclusive billionaire to save her family — and discovers the wife she's replacing may not be dead.",
    genre: "Romantic Thriller",
    audience: "Adults 18–34",
    language: "English (UK)",
    episodeCount: 10,
    episodeDuration: 90,
    visualStyle: "Cinematic Realistic",
    format: "9:16",
    status: "Script Approved",
    createdAt: iso(21),
    updatedAt: iso(1),
    characters,
    assets: [],
    jobs: [],
    bible: {
      id: "bib_1",
      seriesId: SERIES_ID,
      title: "The Billionaire's Secret",
      logline:
        "To save her family from ruin, an archivist marries a billionaire for one year — and finds the woman she replaced is still alive.",
      synopsis:
        "Ada Obialo catalogues other people's histories for a living and has none of her own left to spend. When Julian Ashcombe offers a year of marriage in exchange for her father's debts, she signs. Inside his house she finds a locked wing, a staff trained not to look at her, and a photograph of a woman with her face. What begins as a transaction becomes an investigation, and then something far more dangerous: a marriage neither of them planned to mean.",
      world:
        "Contemporary London. Private members' clubs, Kensington stucco, the archive basements under Bloomsbury, and a Zurich clinic that does not appear on any register. Wealth here is quiet, old, and load-bearing.",
      themes:
        "Debt and inheritance • the price of silence • whether love can survive being useful • who gets believed.",
      tone: "Elegant and restrained, with heat underneath. Hitchcock by way of a modern romance — never camp, never cruel.",
      continuityRules:
        "1. Ada's gold bangle is never removed on camera. 2. Julian never says the dead wife's name aloud before Episode 8. 3. Rain appears in every episode Ada lies. 4. The locked east wing is only shot from the corridor until Episode 7. 5. Vertical 9:16 framing keeps two-shots stacked, not side by side.",
      episodeArc: arc.map((beat) => ({ ...beat, episodeId: `eps_${beat.number}` })),
      updatedAt: iso(1),
    },
    episodes: [
      {
        id: "eps_1",
        seriesId: SERIES_ID,
        number: 1,
        title: "The Contract",
        synopsis:
          "A black envelope, a boardroom, and a signature that costs Ada her name. By dawn she is Mrs Ashcombe — and already being photographed.",
        status: "Approved",
        duration: 90,
        scenes: episode1Scenes,
      },
      ...arc.slice(1).map((a) => ({
        id: `eps_${a.number}`,
        seriesId: SERIES_ID,
        number: a.number,
        title: a.title,
        synopsis: a.beat,
        status: "Outlined" as const,
        duration: 90,
        scenes: [],
      })),
    ],
  };
}
