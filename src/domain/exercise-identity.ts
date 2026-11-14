export const LEGACY_ALTERNATIVE_SUFFIX = '~alt';

// Historical aliases, deliberately independent of today's programme. Never repoint an old ID
// when changing a future alternative: existing logs must keep their original movement identity.
const aliases: Readonly<Record<string, string>> = {
  'barbell-bench-press~alt': 'smith-flat-bench-press',
  'fixed-handle-pull-up~alt': 'unica-lat-pulldown',
  'seated-db-shoulder-press~alt': 'one-arm-standing-cable-press',
  'db-lateral-raise~alt': 'one-arm-low-cable-lateral-raise',
  'standing-db-curl~alt': 'one-arm-low-cable-curl',
  'one-arm-cable-overhead-triceps-extension~alt': 'one-db-two-hand-overhead-triceps-extension',
  'unica-arm-curl~alt': 'standing-db-curl',
  'barbell-back-squat~alt': 'smith-squat',
  'paused-barbell-squat~alt': 'paused-smith-squat',
  'db-romanian-deadlift~alt': 'barbell-romanian-deadlift',
  'selection-leg-extension~alt': 'unica-leg-extension',
  'seated-leg-curl~alt': 'standing-one-leg-cable-curl',
  'supported-single-leg-standing-db-calf-raise~alt': 'supported-bodyweight-single-leg-calf-raise',
  'hanging-knee-raise~alt': 'standing-high-cable-crunch',
  'paused-barbell-bench-press~alt': 'low-incline-db-bench-press',
  'landmine-t-bar-row~alt': 'unica-seated-row',
  'unica-lat-pulldown~alt': 'fixed-handle-pull-up',
  'unica-seated-row~alt': 'bench-supported-one-arm-db-row',
  'dips~alt': 'unica-chest-press',
  'machine-pec-fly~alt': 'one-arm-standing-cable-fly',
  'machine-reverse-fly~alt': 'bent-over-db-reverse-fly',
  'one-db-two-hand-overhead-triceps-extension~alt': 'one-arm-high-cable-pushdown',
  'barbell-deadlift~alt': 'smith-romanian-deadlift',
  'db-stationary-split-squat~alt': 'smith-squat',
  'seated-db-calf-raise~alt': 'supported-single-leg-standing-db-calf-raise',
  'cable-anti-rotation-press~alt': 'db-suitcase-hold',
};

export function canonicalExerciseId(id: string): string {
  return aliases[id] ?? id;
}
