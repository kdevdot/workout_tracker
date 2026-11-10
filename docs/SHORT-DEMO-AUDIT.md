# Short exercise demonstration audit

Date: 10 November 2026. Scope: current 26 exercise-guide entries, including substitutions. This is a media change, not a programme, technique-cue, training-log or storage-schema change.

## Implementation decision

- Prefer an actual short demonstration over a long tutorial: native inline, muted, looping video with pause/replay controls.
- Five Your Move files stream remotely. No subscription, API key, backend, downloaded Your Move media or new paid supplier is introduced.
- Six Goulart / wger clips are bundled as adapted CC BY-SA 4.0 files; source licence, author, source intervals and output checksums are in `public/demos/ATTRIBUTION.md`.
- Eleven distinct clips cover 13 guide entries. Two clips are reused for paused variants only with an explicit warning before playback.
- Missing short demos remain honest gaps. The existing YouTube reference is an optional, initially collapsed detailed explanation, not a substitute advertised as a short clip.
- Supplier licences are separate from source-code licences. Do not import OpenGym/Gym Visual media under a repository's code licence.

## Component boundaries

- `ExerciseGuide.vue` composes the selected short demo, optional detailed tutorial, muscle map, existing cues and swap action. It does not own playback or training data.
- `ExerciseDemo.vue` owns native-video playback, failure/retry, close/focus return, credit and variation notices. Props are the media record and exercise identity; it has no persistence responsibility.
- `ExerciseVideo.vue` remains the tap-to-load YouTube player, now inside the optional tutorial disclosure. Closing any ancestor disclosure unloads it.
- `src/domain/demos.ts` is the audited media catalogue; it does not alter the programme or persisted sessions.

## Review method and limits

Downloaded candidate footage to temporary scratch storage; checked metadata and sampled contact sheets for movement, equipment, grip, camera angle and changes of setup. Reviewed the selected trimmed intervals separately. This is not a professional in-person technique assessment or proof that every repetition is ideal. A looping demo illustrates a movement, not safe load selection, spotting, machine adjustment or rack-safety setup. Keep the programme's form checks and stop cues.

The free Your Move bench endpoint answered a byte-range request with HTTP 206, `video/mp4`, and no forced attachment. All five selected endpoints were checked again during integration. These are public free endpoints, not expiring signed URLs, but the provider may change or remove them. Never assume permanent availability. No cross-origin canvas access is needed for native playback.

## Coverage decisions

“Movement” means the movement is represented, not that the equipment, person, individual mobility or camera angle is identical. Related references display the stated difference before playback.

| Exercise ID                                   | Decision | Source / qualification                                                                                                                            |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `barbell-bench-press`                         | Movement | Your Move, flat barbell bench; setup and safety arms remain in cues                                                                               |
| `paused-barbell-bench-press`                  | Related  | Same clip; **pause not shown**, retain 1–2 s chest pause                                                                                          |
| `landmine-t-bar-row`                          | Gap      | No approved exact landmine demonstration in the reviewed set                                                                                      |
| `unica-lat-pulldown`                          | Gap      | Side-on free clip did not establish a sufficiently clear two-hand UNICA lat-bar setup; reviewers differed on grip interpretation, so not approved |
| `unica-seated-row`                            | Gap      | Free cable-row candidate is not the chest-supported UNICA long-bar setup                                                                          |
| `dips`                                        | Movement | wger 194 / 64; parallel bars, forward lean, side view                                                                                             |
| `unica-arm-curl`                              | Gap      | Generic free-weight preacher curls do not establish UNICA setup                                                                                   |
| `one-arm-cable-overhead-triceps-extension`    | Gap      | Two-hand DB/rope clips are not this movement                                                                                                      |
| `barbell-back-squat`                          | Movement | Your Move, high-bar back squat; rack-safety setup is not demonstrated                                                                             |
| `paused-barbell-squat`                        | Related  | Same clip; **pause not shown**, retain 2 s bottom pause                                                                                           |
| `selection-leg-extension`                     | Related  | Your Move, plate-loaded machine rather than Selection stack                                                                                       |
| `seated-leg-curl`                             | Related  | wger 366 / 37, different machine; follow programme pad/pivot setup                                                                                |
| `barbell-deadlift`                            | Related  | Your Move, continuous reps; reset and brace on floor for prescribed reps                                                                          |
| `fixed-handle-pull-up`                        | Related  | wger 475 / 71, rear view and overhand bar rather than fixed handles; grip may differ                                                              |
| `seated-db-shoulder-press`                    | Related  | wger 567 / 12, reclined backrest; retain prescribed nearly upright bench                                                                          |
| `db-lateral-raise`                            | Movement | Your Move, standing dumbbell raise                                                                                                                |
| `standing-db-curl`                            | Movement | wger 92 / 48, standing dumbbell curl                                                                                                              |
| `db-romanian-deadlift`                        | Gap      | Barbell conventional deadlift is not a DB RDL                                                                                                     |
| `supported-single-leg-standing-db-calf-raise` | Gap      | Machine calf raise does not demonstrate this support/load setup                                                                                   |
| `hanging-knee-raise`                          | Gap      | No approved exact clip in the reviewed set                                                                                                        |
| `machine-pec-fly`                             | Gap      | Cable crossover is not a machine pec fly                                                                                                          |
| `machine-reverse-fly`                         | Gap      | Bent-over dumbbell raises are not a reverse-fly machine                                                                                           |
| `one-db-two-hand-overhead-triceps-extension`  | Movement | wger 211 / 57, trimmed to 9–21 s, two hands on one DB                                                                                             |
| `db-stationary-split-squat`                   | Gap      | Walking/stepping lunges do not demonstrate the stationary stance                                                                                  |
| `seated-db-calf-raise`                        | Gap      | A dedicated padded machine does not demonstrate DB positioning                                                                                    |
| `cable-anti-rotation-press`                   | Gap      | Rotating woodchops are not an anti-rotation Pallof press                                                                                          |

## Playback, privacy and deployment

- No YouTube iframe or remote video/thumbnail request before an explicit play action. Local wger poster images may load with the guide. Your Move uses the existing local illustration as its pre-play poster.
- `playsinline`, muted autoplay after a tap, looping and native controls; preserve full frame with `object-contain` and a bounded height rather than forcing portrait footage into a cropped landscape box.
- Network/codec failures show an in-app retry and point to the unchanged form checks and optional tutorial. Never launch an external video app automatically.
- Close and exercise changes unload playback. Nested YouTube tutorials also stop when their outer guide closes.
- Local paths use Vite's base URL, including under `/workout_tracker/` on GitHub Pages. MP4 and JPEG media are deliberately excluded from Workbox precaching, so offline demo playback is not promised.
- Adapted wger assets total about 15.4 MB of MP4s, fetched individually on demand rather than during installation. No HEVC originals, audio tracks, private gym photos or user records are included.

## Validation record

- `npm run check`: formatting, **120 tests**, TypeScript checking and production build passed on Node 24.
- Real Chrome playback from the production build: all 11 distinct videos decoded and playback time advanced. Confirmed muted, inline, looping portrait playback and bundled landscape playback inside the exercise guide.
- Browser interaction: no remote requests before playing the first demo; forced network failure displayed the retry state and recovered in place; closing a guide unloaded both native video and a nested YouTube player; the entered workout load remained unchanged after opening/closing the demo.
- No horizontal overflow at 320, 390, 480 or 1024 CSS pixels. Inspected phone-sized portrait and landscape player screenshots.
- All five Your Move endpoints returned HTTP 206 for byte-range requests with `video/mp4` and no attachment disposition.
- Production artifact contains only the six credited wger MP4s, their posters and attribution notice. No demo media appear in the service-worker precache.
- Independent implementation review found no actionable material issues. Actual physical iPhone/Safari playback and the deployed GitHub Pages version are not verified by these local checks.

## Sources

- [Your Move free collection and usage terms](https://ymove.app/free-exercise-videos)
- [wger video metadata](https://wger.de/api/v2/video/?limit=100)
- [wger licence identifiers](https://wger.de/api/v2/license/)
- [CC BY-SA 4.0 deed](https://creativecommons.org/licenses/by-sa/4.0/)
- [Native HTML video reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video)
- [OpenGym third-party media notice](https://raw.githubusercontent.com/DuarteSantos8/openGym/main/NOTICE.md)

Individual source video URLs and adaptation commands are in the bundled attribution notice. Future coverage improvements require the same per-exercise visual and rights review; this audit does not authorise a bulk import or an offline cache of supplier media.
