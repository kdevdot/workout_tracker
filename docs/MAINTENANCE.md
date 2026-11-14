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
