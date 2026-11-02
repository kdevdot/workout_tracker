# Steady

A phone-first, local-first workout companion for the approved four-day upper/lower programme. This is the first working local milestone, not a deployed service.

## Run

Use Node 24 LTS (or a compatible version listed in `package.json`).

```sh
npm ci
npm run dev
npm run check
```

Open the URL printed by Vite. To test on your phone, use your computer's LAN address and the same port while both devices share a network. Localhost and LAN addresses have separate browser storage. Web Crypto requires a secure context; for real phone testing use an HTTPS preview rather than an unencrypted LAN URL.

## What works

- Four scheduled sessions, local calendar dates, week navigation, and explicit day overrides.
- Introductory versus baseline prescriptions. New sessions take a prescription snapshot; changes never rewrite training history.
- Working-set logging and corrections with explicit load, repetition/time, and effort conventions.
- IndexedDB persistence, resumable drafts, partial/completed history, and previous completed performance for the same movement.
- Rest timer based on an absolute deadline, including reload and background recovery. Browser background execution is not guaranteed; the deadline is recalculated when visible.
- Whey/creatine entries on any past/current date. Whey label settings are optional; missing nutrition is unknown, not zero. Whey totals are not total daily nutrition. Creatine product nutrition is not included.
- Versioned, validated JSON export/restore with preview and explicit replacement confirmation.
- Bundled fonts and MIT-licensed schematic muscle maps. No analytics or backend.

## Intentional limits

- No Google Drive connection or OAuth yet; no account or cloud backup exists.
- Exercise videos only from openly licensed sources (wger, CC BY-SA 4.0), each checked by eye; clips of a close variant are labelled, and movements without a matching clip show none.
- Alternatives are instructional in this milestone. Do not log a substitute under the original movement name; selectable substitutions require a future distinct exercise-log identity.
- No installable/offline shell, automatic loading prescription, or automatic phase increase.
- Saved sets are durable after the success message; unfinished form input is not autosaved.
- History is read-only after finishing. In-progress sets can be corrected before completion.

## Storage safety

IndexedDB is scoped to this browser and origin. Clearing site data, private browsing, moving addresses, or device loss can remove access. Export regularly, and export before moving from local development to a hosted address. A download request is not proof the file is safely backed up: verify the file in Downloads/Files.

Writes are validated and transactional. Every saved state must remain exportable/restorable within the same 50 MB JSON backup capacity. Revision checks reject stale-tab writes instead of silently losing newer data. Storage/schema errors do not reset records. Close other tabs, reload saved records, and retry when a conflict is reported. Restore replaces rather than merges; its old revision is not reused locally.

## Project boundaries

- `src/domain/`: programme, dates, session rules, state and backup validation.
- `src/storage/`: IndexedDB and optimistic revision checks.
- `src/composables/`: application state updates and deadline-based rest timer.
- `src/components/`: focused Vue presentation and feature containers.
- `public/muscles/`: wger muscle diagrams (recoloured) and the licence notice.
- `public/videos/`: wger demo clips re-encoded by `scripts/fetch-videos.sh`; guide content in `src/domain/guides.ts`.

The programme source was transcribed from the local research document. Baseline work sets: 17 / 15 / 19 / 15. Introductory work sets: 14 / 12 / 16 / 12. Optional lower introductory isolation volume remains individual guidance rather than an automatic rule.

## Git and privacy

The local research profile, gym photographs, environment files, downloaded backups, and generated build/dependency files are ignored. Public app data contains exercise prescriptions, not the personal profile or training logs. Review staged files before every commit. The GitHub remote is `git@github.com:kdevdot/workout_tracker.git`. Hosting is not configured and no app-source licence has been chosen. Third-party licences remain in force.

CI runs formatting, tests, type checking, and the production build; it does not deploy. Once a GitHub repository is chosen, configure Pages separately and review its public contents. Relative Vite asset paths support a repository subpath without a router rewrite.

## Milestone validation

Validated on 2 November 2026: `npm run check` passes formatting, 62 tests, Vue/TypeScript checking, and the production build. `npm audit --omit=dev` reports no known production dependency vulnerabilities at that time. Integration tests exercise actual numeric input events, saved-set corrections, remount persistence, partial completion, whey label persistence, rest-day supplements, and unsupported-schema protection. Storage tests include stale-write rejection and a large backup round trip.

Browser checks confirm recording and resuming a set after reload with its rest-timer deadline retained. Session layout has no horizontal overflow at 390 px and 320 px. Screenshot capture timed out during final verification, so these layout checks are not a complete visual or physical-phone audit. The browser-test session was removed after verification.

## Muscle maps

Muscle diagrams and exercise videos come from the wger exercise database (https://wger.de), CC BY-SA 4.0; videos by Goulart. Diagram colours changed; videos muted and re-encoded to 480p H.264. Modified files are shared under CC BY-SA 4.0. See `public/muscles/LICENSE.txt`. Highlights are target regions, not measured activation, fatigue, or recovery; wger draws one shoulder region for all deltoid heads.
