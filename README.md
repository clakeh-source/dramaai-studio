# DramaAI Studio — V0.1

A studio for creating short-form, vertical AI drama series. V0.1 is the interactive
scaffold: the full creative workflow is playable end to end, with simulated generation
and on-device storage.

## What works today

- **Demo sign-in** — email/password UI, session kept on the device.
- **My Series dashboard** — search, open, delete; seeded with "The Billionaire's Secret".
- **Create Series wizard** — premise, genre, audience, language, visual style, aspect
  format, episode count and length, then a simulated generation pass with progress.
- **Series workspace** — editable series bible (logline, synopsis, world, themes, tone,
  continuity rules), episode arc, character sheets, episode list, approval stage.
- **Episode editor / Scene Studio** — scene location, action, dialogue lines with
  performance directions, camera notes, mood, duration, per-scene status, reorder,
  duplicate, delete.

All edits save automatically to this device (localStorage). No data leaves the browser.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Landing + sign-in |
| `/series` | My Series dashboard |
| `/series/new` | Create Series wizard |
| `/series/$seriesId` | Series workspace (bible, cast, episodes) |
| `/series/$seriesId/episodes/$episodeId` | Episode editor + Scene Studio |

## Data models

`src/types/models.ts` mirrors the intended PostgreSQL schema: `Series`, `SeriesBible`,
`EpisodeArcBeat`, `Episode`, `Scene`, `DialogueLine`, `Character`, `Asset`,
`GenerationJob`, `StudioUser`.

## Architecture boundaries

- `src/services/repository.ts` — data access behind a `StudioRepository` interface;
  the localStorage implementation can be swapped for a database one without UI changes.
- `src/services/generation.ts` — `buildBundle()` simulates story generation behind the
  signature a real model call will keep.
- `src/state/auth.tsx` — demo auth with the same context surface real auth will expose.
- `src/state/studio.tsx` — all series/episode/scene mutations.

## Next integration steps

1. Real accounts and a hosted database (auth, rows, row-level security).
2. Structured story generation from the premise (bible, cast, episode arc, scripts).
3. Character and shot image generation with reference-image consistency.
4. Provider-independent video generation per scene.
5. Voice casting and dialogue narration.
6. Automated assembly of scenes into finished episodes with audio.
7. Credits, plans and payments.
8. Publishing and distribution of finished episodes.
