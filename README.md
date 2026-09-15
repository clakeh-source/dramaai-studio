# DramaAI Studio

> Codex edition — migrated from the original Lovable scaffold and completed as
> a standalone, editable codebase with no Lovable runtime dependency.

DramaAI Studio is a writing and pre-production workspace for short-form AI drama
series. You start from a single premise and end up with a series bible, a cast,
an episode arc and a scene-by-scene shooting plan — all editable, all in one
place.

## V0.1 scope

V0.1 is a complete, interactive front-end scaffold. Everything you can click
works, but no paid AI, media or payment services are called yet.

Included:

- Landing page with demo sign-in
- "My Series" dashboard with search, status and progress
- Create Series wizard (premise, genre, audience, language, episode count and
  duration, visual style, 9:16 or 16:9 format) with a simulated generation pass
- Series workspace: Series Bible, Characters, Episodes
- Episode editor / Scene Studio with per-scene editing
- Approval workflow: Draft → Story Approved → Characters Approved →
  Script Approved → Ready for Media

Not included yet: real accounts, a hosted database, real story/image/video/voice
generation, video assembly, payments and publishing.

## Demo sign-in

Any valid email address and a password of six characters or more will sign you
in. The landing form is pre-filled with `creator@dramaai.studio` / `dramaai`.
The session is stored on the device under `dramaai.auth.v1`. The auth context
surface matches what a real provider will expose, so swapping in real accounts
does not change any screen.

## Local persistence and mock generation

All studio data lives in the browser under `dramaai.studio.v1`. On first load
the app seeds a realistic example series, "The Billionaire's Secret" — a
ten-episode London romantic thriller — so every screen has content.

"Generate Series Bible" runs a simulated generation with step-by-step progress,
then writes a coherent bible, two lead characters, a full episode arc and a
scripted Episode 1 with several separately editable scenes, derived from the
premise you typed. It is deterministic local code, not a model call.

## Routes

| Route                                   | Purpose                                  |
| --------------------------------------- | ---------------------------------------- |
| `/`                                     | Landing page and sign-in                 |
| `/series`                               | My Series dashboard                      |
| `/series/new`                           | Create Series wizard                     |
| `/series/$seriesId`                     | Series workspace (bible, cast, episodes) |
| `/series/$seriesId/episodes/$episodeId` | Episode editor / Scene Studio            |

## Core models

Defined in `src/types/models.ts`:

- `Series` — premise, genre, audience, language, episode count and duration,
  visual style, format, approval status, and its bible, characters, episodes,
  assets and jobs
- `SeriesBible` — logline, synopsis, world, themes, tone, continuity rules and
  the episode arc (`EpisodeArcBeat[]`)
- `Character` — name, age, role, occupation, personality, goals, conflict,
  appearance, wardrobe, voice placeholder, reference images
- `Episode` — number, title, synopsis, status, duration, scenes
- `Scene` — number, location, duration, action, cast, dialogue, camera, mood,
  status and optional image/video asset references
- `DialogueLine` — speaker, line, optional performance direction
- `Asset` and `GenerationJob` — media and generation bookkeeping

Status unions (`SeriesStatus`, `EpisodeStatus`, `SceneStatus`) drive the
approval workflow and the status badges.

## Architecture

- `src/types/` — domain models, mirroring the intended SQL schema
- `src/data/seed.ts` — the seeded example series
- `src/services/repository.ts` — the `StudioRepository` interface
  (`load` / `save` / `reset`) with a localStorage implementation; a hosted
  database implementation drops in here without touching any screen
- `src/services/generation.ts` — `buildBundle()`, the generation boundary; a
  real model call replaces the body behind the same signature
- `src/state/` — auth and studio React contexts, the only thing the UI talks to
- `src/components/studio/` — shared studio components
- `src/routes/` — file-based routes (TanStack Router)

Keeping the repository and generation boundaries stable is the point: every
integration below is a swap behind an existing interface.

## Local development

```bash
npm install
npm run dev
npx tsc --noEmit
npm run build
```

Stack: React, TypeScript, Vite, TanStack Start/Router, Tailwind CSS,
shadcn/ui, lucide icons, sonner toasts.

## Next integrations

1. **Supabase auth** — real email/password and social sign-in behind the
   existing auth context.
2. **Supabase / PostgreSQL** — tables for series, bibles, characters, episodes,
   scenes, dialogue, assets and jobs, with row-level security per creator;
   implement `StudioRepository` against it.
3. **OpenAI structured story generation** — replace `buildBundle()` with a
   structured-output call that returns the same typed bundle.
4. **Image generation** — character reference sheets and scene stills, stored
   as `Asset` rows with the source prompt kept for regeneration.
5. **Video generation** — a provider-independent adapter so a scene can be
   rendered by any vendor without changing the Scene Studio.
6. **ElevenLabs voices** — per-character voice assignment and dialogue
   read-throughs, replacing the voice placeholder.
7. **FFmpeg assembly** — stitch scene clips, voice and music into a finished
   episode in the chosen aspect ratio.
8. **Payments** — credits or subscriptions metered against generation jobs.
9. **Publishing** — export and direct delivery to vertical video platforms.
