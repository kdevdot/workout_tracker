# Exercise illustration audit

Reviewed: 3 November 2026. This is a selection audit, not an app integration or a change to the training programme.

## Source and method

- Source: [Workout Guide](https://github.com/bryllim/workout-guide), pinned revision `aac599224bb9780305239607ef98540b7e0ce389`.
- [Pinned manifest](https://github.com/bryllim/workout-guide/blob/aac599224bb9780305239607ef98540b7e0ce389/packages/workout-guide/manifest.json): 302 entries. Downloaded and visually inspected all three source frames for each of the 21 closest candidates against the 21 unique movements in `src/domain/programme.ts`.
- Main programme movements only; alternatives and warm-up movements have not been comprehensively audited.
- Examined the SVGs rendered on a dark background, including larger spot checks of the Smith press and purported walkout. Inspected all 63 candidate frames, not just exercise names or equipment tags.
- This is a visual identity/setup review, not independent biomechanical validation, legal clearance, or professional certification of the drawings.

## Licensing and provenance

The project's [asset licence](https://github.com/bryllim/workout-guide/blob/aac599224bb9780305239607ef98540b7e0ce389/packages/workout-guide/LICENSE-ASSETS) states CC BY-SA 4.0; software is separately MIT-licensed. The [attribution notice](https://github.com/bryllim/workout-guide/blob/aac599224bb9780305239607ef98540b7e0ce389/packages/workout-guide/ATTRIBUTION.md) credits Bryl Lim and Everkinetic and says 76 first-pose frames are direct adaptations of Everkinetic SVGs. Per-frame upstream sources and recorded changes are in the manifest where applicable. This is a documented upstream licensing claim, not a guarantee about all underlying rights.

If adopted, retain pinned per-frame provenance, credit Bryl Lim / Workout Guide and Everkinetic where applicable, link CC BY-SA 4.0, and identify adaptations. Keep adapted artwork under CC BY-SA 4.0. These obligations concern the artwork; do not describe the entire application as CC BY-SA merely because it displays the assets. Do not ship only an MIT notice for these images.

The evaluation preview renders the original frame shapes on a forest background. Temporary PNGs were rasterized from the SVGs for inspection; the artwork itself was not redrawn. No candidate artwork has been added to app assets.

## Decision categories

- **Static candidate:** recognisably the prescribed exercise type; an individually selected still may illustrate the movement after final asset-specific review. Not approval of the three-frame animation, equipment settings, or every depicted posture.
- **Related only:** equipment, loading, setup, or execution differs. Must carry a visible, specific variation label if used; never silently substitute the movement or log identity.
- **Reject for this slot:** the illustration is misleading for the prescribed movement, even if the catalogue title sounds correct.

## Coverage of the approved programme

| Programme movement                            | Closest catalogue slug               | Decision             | Visual observations and restrictions                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Smith flat bench press                        | `smith-machine-bench-press`          | Reject for this slot | Torso/back support appears reclined rather than clearly flat. Frames do not establish a complete flat-bench repetition; do not infer flat setup from the title.                      |
| Fixed-handle pull-up or chin-up               | `pull-up`                            | Static candidate     | Overhand pull-up on a straight bar, not every grip offered by the gym's fixed handles. Represents the pull-up option only, not an underhand chin-up.                                 |
| Bench-supported one-arm DB row                | `one-arm-dumbbell-row`               | Static candidate     | Hand and knee supported on a bench, one DB. Clear match to the supported option; changing view and line weight between frames makes the loop inconsistent.                           |
| Seated DB shoulder press                      | `seated-dumbbell-press`              | Static candidate     | Seated, back-supported DB pressing. Drawings show raised and shoulder-level positions but inconsistent detail; keep the actual programme's setup and comfortable-range instructions. |
| DB lateral raise                              | `lateral-raise`                      | Static candidate     | Standing bilateral DB raise. Line thickness changes abruptly; elbow/arm angle is not a universally prescribed target.                                                                |
| Standing DB curl                              | `bicep-curl`                         | Static candidate     | Standing bilateral DB curls, both arms shown. Not a demonstration of all permitted alternating conventions.                                                                          |
| One-arm cable pushdown                        | `tricep-pushdown`                    | Related only         | Two hands on a bar, not one D-handle. Do not present as the prescribed unilateral execution.                                                                                         |
| Smith squat                                   | `smith-machine-squat`                | Static candidate     | Smith-style rails and back-loaded squat are depicted. Cannot establish safe stop height, hook operation, stance or individual depth.                                                 |
| DB Romanian deadlift                          | `dumbbell-romanian-deadlift`         | Static candidate     | Two DBs, standing and hinge positions. Knee bend and rendering vary between frames; stills cannot establish spinal control or correct individual end range.                          |
| UNICA leg extension, confirmed setup only     | `leg-extension`                      | Related only         | Generic dedicated seated machine, not the gym's confirmed multifunctional UNICA connection. Must retain the staff-confirmation warning; no setup inference.                          |
| Supine heel walkout                           | `lying-hamstring-walkout`            | Reject for this slot | Feet are visibly supported by hanging straps/lines. Not the prescribed floor-contact alternating heel walkout; do not use despite the name.                                          |
| Supported single-leg standing DB calf raise   | `single-leg-calf-raise`              | Related only         | Supported single-leg stance, but no DB is shown. Closer to the existing bodyweight alternative than the loaded main movement.                                                        |
| Dead bug                                      | `dead-bug`                           | Related only         | Opposite-limb extension is depicted, but the extended poses also lift head/shoulders. Not an exact visual prescription of the programme's basic supine setup.                        |
| Low-incline DB bench press                    | `incline-dumbbell-press`             | Related only         | Bench appears steeper than the prescribed approximately 15–30 degrees. Do not suggest copying the depicted angle.                                                                    |
| Machine pec fly                               | `pec-deck`                           | Related only         | Generic forearm-pad pec deck; gym-specific handles, lever position and available machine geometry remain unverified by the drawing.                                                  |
| Machine reverse fly                           | `reverse-pec-deck`                   | Related only         | Generic reverse pec deck, not proof that the gym machine supports that seat/handle configuration. Preserve actual setup restrictions.                                                |
| One-DB two-hand overhead triceps extension    | `dumbbell-overhead-tricep-extension` | Static candidate     | Seated overhead two-hand position. Load/grip detail is small; do not rely on the image for secure DB handling or teach a forced elbow position.                                      |
| Smith Romanian deadlift                       | `smith-machine-romanian-deadlift`    | Static candidate     | Smith rails and hinge/standing positions. Cannot establish hooks, stops, actual bar travel or allowable personal range.                                                              |
| DB stationary split squat, rear foot on floor | `split-squat`                        | Static candidate     | Rear foot stays on floor; not the Bulgarian entry. Static stance/raised-lowered positions, not proof of how to keep the feet stationary throughout a set.                            |
| Seated DB calf raise                          | `seated-calf-raise`                  | Related only         | Dedicated machine/padded lever rather than DBs supported on thighs. Not an exact loading/setup demonstration.                                                                        |
| Side plank                                    | `side-plank`                         | Static candidate     | Straight-leg side support. Static hold should stay static; small redraw changes must not be sold as necessary hip motion.                                                            |

**Summary:** 11 static candidates, 8 related-only candidates, 2 rejected for their programme slots. There are no recommended drop-in, three-frame animated demonstrations in this audit. This is deliberately stricter than counting catalogue-name matches as usable coverage.

## Six-example preview

The preview uses the original three source frames of Smith bench press, supported one-arm DB row, Smith squat, DB RDL, DB lateral raise and dead bug. It exposes source-frame selection and optional frame cycling so the visual inconsistency is visible, rather than editing it out. Source indices are not labelled as exercise start/middle/end: pose ordering differs by exercise.

The preview must retain the Smith bench rejection and dead-bug variation notice. It is a selection board, not a workout instruction screen. No new exercise, altered prescription or substitute is authorised by it.

## Recommendation

Do not replace all current exercise media with these animations. Consider selected static illustrations only if the user likes the style, with visible variation labels and existing technique cues. Keep an honest no-demo state for rejected/missing matches. For exact movement teaching, a separately cleared and reviewed demonstration is preferable to a falsely precise illustration.

No package was installed, app media replaced, production code changed, or commit/push made during the original audit.

## Subsequent thumbnail integration

Following feedback on the hand-drawn list icons, the 11 static candidates were integrated as small decorative thumbnails using frame 1 SVGs. View boxes are cropped to square artwork bounds with padding; drawn paths are unchanged. The 8 related-only and 2 rejected candidates remain excluded. Those rows use Lucide equipment icons, not misleading exercise poses. Artwork is displayed in monochrome on neutral stone backgrounds, not the earlier green panels. In-app video demonstrations remain separate. Licence, credits and pinned per-frame provenance are bundled in `public/exercises/` and linked from Settings. This does not approve the source animations or change any training prescription.

## Full thumbnail coverage (3 November 2026)

At the user's request, every list row now shows a drawing. The 8 related-only candidates are used as identifying thumbnails, without changing their audit verdicts. The two rejected slots use substitutes: `bench-press` (flat barbell bench) for the Smith flat bench press, and `glute-bridge` (hips up, heels planted) for the heel-walkout start position. Thumbnails identify the exercise; they do not teach setup or technique. The video, muscle map and form checks remain the reference.

**Update, 7 November 2026:** the floor moves (heel walkout, dead bug, side plank) were replaced with gym-equipment moves. Their drawings (`glute-bridge`, `dead-bug`, `side-plank`) are no longer bundled; `single-leg-romanian-deadlift`, `hanging-knee-raise` and `pallof-press` were added from the same source revision.
