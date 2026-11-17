# UI/UX review — 17 November 2026

Reviewed Plan, active workouts, History, Push-ups, Supplements, Settings, exercise guides and the shared controls. The design direction is a refined training notebook within the existing graphite, volt and coral identity. The 480 px frame and self-hosted typefaces remain the visual foundation.

## Changes

| Area                   | Finding                                                                                                              | Result                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| History                | Collapsed sessions repeated every exercise's top set, making a few weeks of records difficult to scan.               | Compact summaries show date, status, recorded sets and exercise progress. Opening a session reveals all recorded sets. Empty history has a direct action to Plan.                                  |
| Workout navigation     | Previous/Next followed technique, swaps and progression notes.                                                       | Navigation sits after set entry and its rest timer. Changing exercise reveals and focuses its heading region.                                                                                      |
| Settings               | Training controls and the whey label appeared as one undifferentiated form.                                          | Named Training and Whey label groups share one save action. Backup copy explains the file and replacement behaviour.                                                                               |
| Shared controls        | Input sizes, surfaces and outline buttons differed; control borders had less than 2:1 contrast.                      | Owned shadcn defaults use flat surfaces, 44 px inputs and 16 px input text. Control borders provide 3.52:1 contrast on the canvas and 3.21:1 on panels. Buttons wrap within their available width. |
| Error recovery         | Set errors did not identify or focus the invalid input. A failed save left an earlier success visible in the header. | Invalid fields receive focus, `aria-invalid` and a linked error. The header reports the failed save. Correcting and retrying preserves the existing save behaviour.                                |
| Mobile and larger text | At 200% text size, exercise prescriptions collided with names and some controls extended beyond their panels.        | Component queries stack exercise rows, set inputs and form checks. Push-up controls, settings, timer actions and supplement forms wrap to available space. Calendar labels remain distinct.        |
| Keyboard access        | Tab changes did not move focus into the newly displayed page.                                                        | A skip link reaches the main content. Tab changes focus the selected page, while exercise selection focuses the active exercise region.                                                            |

The programme, progression calculations, exercise identities, media selection and persisted data schema retain their existing behaviour. Relevant regression tests cover historical sessions, rest timing, failed saves, past-day push-ups and backup replacement.

## Verification

- `npm run check`: formatting, lint, 165 tests, strict Vue/TypeScript checking and the PWA production build pass. Validated with Node 24.15.0.
- Rendered all six application screens at 320, 390, 480 and 1024 px. Layout checks at 100% and 200% text size found no horizontal overflow.
- Exercised keyboard navigation, synthesized touch navigation, empty history, set validation and saving, exercise changes, expanded guides, the push-up reset review, invalid backup files, replacement review and cancellation.
- Axe checks for WCAG 2 A/AA, WCAG 2.1 AA and best practices found zero violations on the five tabs and the set-entry error state.
- The Impeccable source detector reported zero findings across the 22 changed UI targets.
- Browser fixtures used synthetic records in an isolated Chrome context. Physical iOS/Android devices and screen-reader output were not tested.

Keep the layout and interaction rules in [DESIGN.md](../DESIGN.md) when extending these screens. Supporting content should follow the logging task, and larger-text support should use wrapping and component space rather than hiding overflow.
