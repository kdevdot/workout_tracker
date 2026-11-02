# Steady

## Platform

Phone-first web application. Static hosting on GitHub Pages is the intended deployment target; no deployment is authorised yet.

## User and purpose

A personal companion for the approved four-day upper/lower strength and hypertrophy programme. Record real training, see past performance, and track Optimum Nutrition whey and creatine on training and rest days. No food diary or social features.

## Confirmed constraints

- Monday Upper A, Tuesday Lower A, Thursday Upper B, Saturday Lower B; other days rest.
- Preserve the researched exercise order, conditional equipment, introductory phase, and progression guidance.
- Date-first interface; one session title; readable prescriptions and front/back target-region maps.
- Device-local saving first, independent JSON backup/restore, Google Drive backup later.
- Personal research, gym photos, logs, and supplement labels must not enter public source control by default.
- Exact video variations and licences must be audited; no placeholder pretending to play a video.

## Stack

Vue 3, TypeScript, Vite. Small domain modules, IndexedDB persistence, Vitest. No backend or account system in milestone one. Stack follows the recommendation accepted in the conversation.

## First milestone and acceptance

- A workout can be started, logged, reopened after reload, and completed.
- Session date and exercise/load conventions are explicit; prescriptions are snapshotted.
- History shows real entries only. Rest timer survives reload and backgrounding.
- Failed or invalid storage never silently resets or reports successful saving.
- Validated JSON export/restore protects the first real records.
- All four workout tables match the research document and are covered by tests.

## Deferred

Google OAuth/Drive integration, audited exercise videos, automatic progression suggestions, installable/offline shell, remote repository and deployment. Product-label values remain user-supplied.
