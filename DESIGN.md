# Steady — calm night-gym interface

## Visual authority

The accepted design uses dark graphite surfaces, a volt accent and coral highlights. The approved refinement makes this identity calmer: flat surfaces, readable sentence-case headings and logging controls before supporting information. The earlier light-dashboard document was superseded by the approved dark design.

## Tokens and typography

- Canvas `#101215`; panels `#191c21`; secondary surfaces `#22262d`.
- Text `#eef0ea`; muted text `#a0a7b3`. Enabled dates and secondary copy must remain readable without reduced-opacity text.
- Primary action and completion `#d4f53c`, with dark foreground.
- Coral `#ff7a59` identifies effort and primary muscle regions; errors use the destructive token.
- Define shared colours, focus treatments and surfaces in `src/style.css`; reference tokens from components.
- Geist Variable is the UI font. Bricolage Grotesque Variable carries headings and tabular training numbers. Both are self-hosted and OFL-licensed.
- At the default text size, page headings are 28 px, workout headings 30 px, section headings 18 px, body copy 14–16 px and supporting labels 12 px. Set-entry numbers remain 30 px in 64 px inputs. Use relative type sizes to respect larger text settings. Keep the compact five-item navigation readable at narrow phone widths.
- Reserve lime emphasis for actions, selection and meaningful progress. Use 12–16 px panel radii, flat fills and subtle dividers. Avoid decorative grain, background glows, watermark letters and repeated entrance animations.

## Layout and interaction

- Use one fluid, centred frame up to 480 px, with 20 px gutters and safe-area support.
- Preserve the existing bottom navigation and consistent alignment between tabs. The dock is opaque, with a quiet selected background and no sliding accent pill.
- Use generous touch targets for logging. Keep the selected date, exercise name and load convention clear.
- During a workout, show the exercise name and compact prescription before the set form. Put previous performance, progression guidance, saved-set corrections, technique and swaps below it. Keep the rest timer in the page immediately after the form so it cannot cover inputs or the record button; retain adjustment, dismissal, persistence and completion states.
- Four-field unilateral forms use two rows: load/RIR, then left/right, with 56 px-high numeric inputs. Never squeeze decimal loads into four narrow columns.
- On phones at 360 px or narrower, three-column set inputs use 24 px numbers and reduced horizontal padding so decimal loads remain visible.
- Plan shows exercise order before the folded muscle map. Warm-up guidance remains easy to find. Rest days show a compact recovery panel without an empty anatomy map.
- Supplement forms come before recorded nutrition. Product-label setup remains available, and missing historical nutrition stays explicit.
- Workout progress counts whole exercises. Plan and History show static segments; an active workout uses one tappable bar. Do not reintroduce a second row of progress controls.
- The month calendar is the sole date selector for push-ups. The logging card opens on today and displays the full selected date. Tapping any enabled calendar day reveals and focuses its logging card, including when choosing the same day again. Record entries only after a logging action.
- Use a Monday-first month calendar with readable dates and 44 px-high day targets. Bound month navigation to the challenge start and current month. Browsing a month does not change the logging date; selecting a day does. Keep daily logging above the calendar for quick access; omit the redundant date input and day shortcuts.
- Unsubmitted custom push-up amounts clear only after a successful save. Midnight must not move a half-entered push-up set to another date.

## Components and styling

- `src/components/ui/` is owned shadcn-vue source. Put shared Card/Button/Input defaults in those components, rather than targeting their internal `data-slot` attributes with global CSS.
- Native date inputs, selects and disclosures are intentional where they provide a useful phone/browser affordance.
- Keep feature-specific styles with the feature. The set form owns its large numeric inputs; global CSS must not reach into those inputs.
- Compose substantial session and push-up sections from their feature folders. Keep props and events typed and responsibilities focused.
- Retain visible keyboard focus, disabled/error states and reduced-motion support.

## Media and data truth

- Short demos are tap-to-load, silent, looping videos. State source, licence and differences from the prescribed movement.
- YouTube remains an optional detailed explanation, folded away by default. Provider and internet requirements stay explicit.
- Reuse guides for the same movement, including legacy alternative IDs. When a dedicated guide is absent, show the session's stored setup cues.
- Body maps show target regions, not measured activation, fatigue or recovery.
- Preserve device-local storage, revision-conflict protection and JSON backup/restore. A UI update does not imply cloud sync.
