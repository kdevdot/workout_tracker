# Steady

A phone-first workout tracker for a four-day upper/lower strength programme. It runs entirely in the browser, with no account and no backend, and can be installed on a phone as a PWA.

Live: https://kdevdot.github.io/workout_tracker/

## What it does

- Shows the scheduled workout for each day and lets you move through the week.
- Logs working sets (load, reps or seconds, reps in reserve) and shows your previous performance for each exercise.
- Runs a rest timer that survives reloads and backgrounding. Rest follows the programme per exercise, or a fixed time you pick in Settings.
- Shows a demo video, a muscle map and short form checks for each exercise.
- Tracks whey and creatine intake.
- Runs a 100-day push-up challenge: a daily target, quick-add buttons, streaks and a 10 × 10 day grid.
- Exports and restores all data as a JSON backup.

## How it works

- **Storage:** everything is kept in IndexedDB on the device. Nothing leaves the browser. Clearing site data or changing the web address loses access, so export regularly.
- **Sessions:** starting a workout snapshots its prescription, so programme changes never rewrite history. Finished sessions are read-only.
- **Safety:** every write is validated with zod and versioned. Writes from a stale tab are rejected rather than overwriting newer data. Restore replaces the data; it doesn't merge.
- **Offline:** a service worker caches the app, illustrations and muscle maps. Demo videos need a connection.

## Build

Node 24 (see `engines` in `package.json`).

```sh
npm ci
npm run dev     # local dev server
npm run check   # format check, tests, type check, production build
```

Stack: Vue 3 + TypeScript, Vite, Tailwind CSS v4, shadcn-vue, zod, idb, vite-plugin-pwa, Vitest.

| Path               | Contents                                              |
| ------------------ | ----------------------------------------------------- |
| `src/domain/`      | Programme, dates, session rules, state schema, guides |
| `src/storage/`     | IndexedDB access and revision checks                  |
| `src/composables/` | App state and rest timer                              |
| `src/components/`  | Vue views and UI components                           |
| `public/`          | Muscle maps, exercise illustrations, app icons        |

Every push to `main` runs `.github/workflows/check.yml`. The `deploy.yml` workflow builds the app and publishes `dist` to GitHub Pages.

## Credits

- Muscle maps: [wger](https://wger.de), CC BY-SA 4.0, with colours changed. See `public/muscles/LICENSE.txt`.
- Exercise illustrations: [Workout Guide](https://github.com/bryllim/workout-guide) / [Everkinetic](https://github.com/everkinetic/data), CC BY-SA 4.0. See `public/exercises/ATTRIBUTION.md`.
- Demo videos: YouTube clips, mainly [Renaissance Periodization](https://www.youtube.com/@RenaissancePeriodization), plus Runna, Hinge Health, Bodhi Bodies and Josh Evans. They stream through the privacy-enhanced embed and only load when you tap them. Links are in `src/domain/guides.ts`.
- Fonts: Geist and Bricolage Grotesque, OFL.

No licence has been chosen for the app's source code. The third-party assets keep their own licences.
