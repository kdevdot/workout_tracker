# Steady — night-gym interface

## Visual authority

The accepted live design uses dark graphite surfaces, a volt accent and coral highlights. Preserve this identity during maintenance. The earlier light-dashboard document was superseded by the approved dark design.

## Tokens and typography

- Canvas `#0a0c0f`; panels `#13161b`; secondary surfaces `#1b1f26`.
- Text `#eef0ea`; muted text `#8b94a3`.
- Primary action and completion `#d4f53c`, with dark foreground.
- Coral `#ff7a59` identifies effort and primary muscle regions; errors use the destructive token.
- Define shared colours, focus treatments and surfaces in `src/style.css`; reference tokens from components.
- Geist Variable is the UI font. Bricolage Grotesque Variable carries headings and tabular training numbers. Both are self-hosted and OFL-licensed.

## Layout and interaction

- Use one fluid, centred frame up to 480 px, with 20 px gutters and safe-area support.
- Preserve the existing bottom navigation and consistent alignment between tabs.
- Use generous touch targets for logging. Keep the selected date, exercise name and load convention clear.
- Workout progress counts whole exercises. Plan and History show static segments; an active workout uses one tappable bar. Do not reintroduce a second row of progress controls.
- Push-up logging has a visible date input, previous/next-day controls and Today/Yesterday shortcuts. The full selected date remains visible; late entries belong to the chosen day.
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
