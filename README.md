# Steady

A phone-first workout tracker for a four-day upper/lower strength programme. It runs entirely in the browser, with no account and no backend, and can be installed on a phone as a PWA.

Live: https://kdevdot.github.io/workout_tracker/

## What it does

- Shows the scheduled workout for each day and lets you move through the week.
- Logs working sets (load, reps or seconds, reps in reserve) and shows your previous performance for each exercise.
- Runs a rest timer below the set form, with adjustment and dismissal controls. It survives reloads and backgrounding. Rest follows the programme per exercise, or a fixed time you pick in Settings.
- Shows short, looping demos for audited movements, plus muscle maps and form checks. YouTube tutorials remain optional detailed explanations; unmatched movements are clearly labelled.
- Tracks whey and creatine intake.
- Tracks daily push-ups against a target (100 by default): quick-add buttons, streaks and a month calendar. Tap a calendar day to log or review it, including missed days; the logging card shows the full selected date.
- Exports and restores all data as a JSON backup.

## Code organisation

- `src/views/` composes screens; view filenames end in `View.vue`.
- `src/components/plan/` renders the ordered exercise list.
- `src/components/session/` owns exercise logging, the rest-timer UI and shared exercise progress.
- `src/components/pushups/` owns date selection, logging, calendar and target settings.
- `src/components/supplements/` renders recorded whey nutrition separately from the logging forms.
- `src/components/ui/` contains owned shadcn-vue primitives. Defaults belong here; feature-specific styling belongs with the feature.
- `src/composables/` separates workout writes, supplements, push-ups, timer state and storage. `useTrainingApp` wires these into navigation.
- `src/domain/` owns prescriptions, validation, exercise identity, completion and progression rules; it does not depend on Vue.
- `src/storage/` handles IndexedDB, validation and revision conflicts. Its small repository contract can be injected for tests.

Use PascalCase for component files, `useFeatureName` for composables, and typed props/events for component contracts. Keep pure business rules in the domain. Existing tests protect behavior when moving responsibility between modules; add regression coverage before fixing bugs.

Alternatives use structured movement IDs and prescriptions. New swaps retain the original session exercise, including its setup cues, for exact reversal. Legacy `~alt` IDs are resolved for history and media without rewriting saved records. Older swaps never stored a complete original: their saved reverse prescription can be recovered, but original cues that were not stored cannot be reconstructed exactly. When changing an alternative in the future, preserve the legacy alias for the movement it originally represented.

## How it works

- **Storage:** everything is kept in IndexedDB on the device. Nothing leaves the browser. Clearing site data or changing the web address loses access, so export regularly.
- **Sessions:** starting a workout snapshots its prescription, so programme changes never rewrite history. Finished sessions are read-only.
- **Safety:** every write is validated with zod and versioned. Writes from a stale tab are rejected rather than overwriting newer data. Restore replaces the data; it doesn't merge.
- **Offline:** a service worker caches the app, illustrations and muscle maps. Demo videos need a connection.

## Build

Node 24.15 or newer in the Node 24 line (see `engines` in `package.json` for other supported releases).

```sh
npm ci
npm run dev     # local dev server
npm run lint    # Vue, TypeScript and JavaScript lint rules
npm run check   # format, lint, tests, type check and production build
```

Stack: Vue 3 + TypeScript, Vite, Tailwind CSS v4, shadcn-vue, zod, idb, vite-plugin-pwa, Vitest.

| Path               | Contents                                              |
| ------------------ | ----------------------------------------------------- |
| `src/domain/`      | Programme, dates, session rules, state schema, guides |
| `src/storage/`     | IndexedDB access and revision checks                  |
| `src/composables/` | App state, actions, push-ups and rest timer           |
| `src/views/`       | The six screens, one file each                        |
| `src/components/`  | App shell and the parts screens are built from        |
| `public/`          | Muscle maps, exercise illustrations, app icons        |

Every push to `main` runs `.github/workflows/check.yml`. The `deploy.yml` workflow builds the app and publishes `dist` to GitHub Pages.

## Credits

- Muscle maps: [wger](https://wger.de), CC BY-SA 4.0, with colours changed. See `public/muscles/LICENSE.txt`.
- Exercise illustrations: [Workout Guide](https://github.com/bryllim/workout-guide) / [Everkinetic](https://github.com/everkinetic/data), CC BY-SA 4.0. See `public/exercises/ATTRIBUTION.md`.
- Quick demos: eight remotely hosted [Your Move](https://ymove.app/free-exercise-videos) clips and thirteen adapted Goulart / [wger](https://wger.de) clips (CC BY-SA 4.0), covering 23 of 26 guide entries including explicitly labelled related variations. Your Move files are not redistributed in the repository. See `public/demos/ATTRIBUTION.md` and `docs/SHORT-DEMO-AUDIT.md` for sources, changes and gaps. Videos load only after a tap and are not precached offline.
- Detailed explanations: optional YouTube clips via privacy-enhanced embeds, loaded only after a tap. Sources remain in `src/domain/guides.ts`.
- Fonts: Geist and Bricolage Grotesque, OFL.

No licence has been chosen for the app's source code. The third-party assets keep their own licences.
