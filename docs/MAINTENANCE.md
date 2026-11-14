# Maintenance notes

Use the supported Node versions in `package.json`. Node 24.15+ is the recommended line; the November 2026 cleanup was checked with Node 24.22.3.

`npm run check` runs formatting, Vue/TypeScript linting, tests, strict type checking and the PWA production build. CI and deployment run the same command. Lint exceptions are scoped to test fixtures and the upstream naming/optional-prop conventions of owned shadcn primitives.

## Dependency audit — 14 November 2026

- `npm audit --omit=dev`: zero reported vulnerabilities.
- Full development-tool audit: 15 reports, comprising 2 low and 13 moderate, with no high or critical reports. Counts include affected parent packages, rather than 15 independent underlying advisories.
- Affected chains are TypeScript ESLint → minimatch; Vue Test Utils → js-beautify/editorconfig/glob; and the PWA build tools → glob/deepmerge.
- The audit proposes downgrading direct tooling for several chains. No forced downgrades or cross-major dependency overrides were applied during the code cleanup. Recheck the audit and upstream compatibility before updating these tools, then run lint, tests and the PWA build.

Underlying advisories reported by npm: [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).

## Saved-data compatibility

Existing version 1 backups remain readable. New alternatives carry structured prescriptions and new swaps retain the exact original exercise. Legacy aliases are historical data: do not change their meaning when editing future programme alternatives. Legacy swaps retain their recorded reverse prescription, but the old format did not store every original field; missing original cues cannot be recovered exactly.

Saved sets and completed sessions are not migrated or rewritten to merge history. Comparisons resolve movement aliases at read time, keeping Smith, dumbbell, cable and bodyweight variations separate.

## Programme revision — 14 November 2026

The approved four-day plan has 18 shared movement definitions and target session totals 19/15/19/15 (68 weekly); Introduction is 16/12/16/12 (56 weekly) at 3 RIR. The persisted schema remains version 1. The legacy-programme-sessions.json fixture contains synthetic old-template records, not user data; tests exercise active/completed backup preservation, legacy swaps and movement identity.

Do not repoint the old split-squat ID to the supported one-DB variation. The new supported-db-stationary-split-squat deliberately has its own history. Existing canonical aliases still share matching barbell-RDL history. Retired guides/demos remain for old snapshots. Sources and qualifications live outside persisted data in research.ts and guides.ts; ExerciseEvidence.vue renders them without storage effects.

Progression uses the displayed upper rep bound and reserve, requires the current full set count, and never assumes a plate/pin increment. There is no hidden +3-rep threshold or forced 0–1 RIR cue in new workouts. The private Obsidian document remains ignored; the public prescription and research reference is docs/PROGRAMME.md.
