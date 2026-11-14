import { getExercises } from './programme';
import type { Phase, WorkoutId } from './programme-types';
import type { Exercise } from './programme-types';
import { sessionSchema, setSchema, type Session, type SetLog } from './state';
import { canonicalExerciseId, LEGACY_ALTERNATIVE_SUFFIX } from './exercise-identity';
import { formatPrescription } from './prescriptions';

/** Safe to replace when switching workouts or changing the default phase. */
export function isUntouchedSession(session: Session): boolean {
  return session.status === 'active' && session.exercises.every((entry) => entry.logs.length === 0);
}

export function startSession(workoutId: WorkoutId, date: string, phase: Phase): Session {
  return sessionSchema.parse({
    id: crypto.randomUUID(),
    date,
    workoutId,
    phase,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'active',
    exercises: getExercises(workoutId, phase).map((exercise) => ({ exercise, logs: [] })),
  });
}

export function recordSet(session: Session, exerciseId: string, input: SetLog): Session {
  if (session.status !== 'active') throw new Error('Completed workouts cannot be edited.');
  const log = setSchema.parse(input);
  if (!session.exercises.some((entry) => entry.exercise.id === exerciseId)) {
    throw new Error('Exercise is not part of this session.');
  }
  return sessionSchema.parse({
    ...session,
    exercises: session.exercises.map((entry) =>
      entry.exercise.id !== exerciseId
        ? entry
        : {
            ...entry,
            logs: [...entry.logs.filter((existing) => existing.index !== log.index), log].sort(
              (first, second) => first.index - second.index,
            ),
          },
    ),
  });
}

/** Compatibility only: older saved alternatives contain display text rather than typed fields. */
function legacyLoadKind(name: string): Exercise['loadKind'] {
  if (/smith/i.test(name)) return 'smith';
  if (/unica|machine/i.test(name)) return 'machine';
  if (/cable/i.test(name)) return 'cable';
  if (/\bDB\b|dumbbell/i.test(name)) return 'dumbbell';
  if (/barbell/i.test(name)) return 'barbell';
  return 'bodyweight';
}

/** New prescriptions are structured. Display-text parsing is confined to older saved sessions. */
export function alternativeOf(exercise: Exercise): Exercise {
  const { name, prescription, note, movement } = exercise.alternative;
  const legacy = movement ? null : /(\d+) × (\d+)–(\d+) (reps|s)(\/side|\/leg)?/.exec(prescription);
  if (!movement && !legacy) throw new Error(`Unreadable alternative prescription: ${prescription}`);
  const details = movement ?? {
    id: canonicalExerciseId(`${exercise.id}${LEGACY_ALTERNATIVE_SUFFIX}`),
    min: Number(legacy![2]),
    max: Number(legacy![3]),
    unit: legacy![4] === 's' ? ('seconds' as const) : ('reps' as const),
    perSide: !!legacy![5],
    loadKind: legacyLoadKind(name),
  };
  return {
    ...exercise,
    ...details,
    name,
    sets: legacy ? Number(legacy[1]) : exercise.sets,
    equipment: name,
    cues: [note],
    alternative: {
      name: exercise.name,
      prescription: formatPrescription(exercise.sets, exercise),
      note: 'The programmed exercise.',
      movement: {
        id: exercise.id,
        min: exercise.min,
        max: exercise.max,
        unit: exercise.unit,
        perSide: exercise.perSide,
        loadKind: exercise.loadKind,
      },
    },
  };
}

export function isSwappedExercise(entry: Session['exercises'][number]): boolean {
  return !!entry.originalExercise || entry.exercise.id.endsWith(LEGACY_ALTERNATIVE_SUFFIX);
}

// The old reverse display string omitted /side even for these unilateral originals.
// Keep this historical metadata separate from future programme changes.
const legacyUnilateralOriginals = new Set([
  'one-arm-cable-overhead-triceps-extension',
  'supported-single-leg-standing-db-calf-raise',
  'db-stationary-split-squat',
  'cable-anti-rotation-press',
]);

function restoreLegacyOriginal(exercise: Exercise): Exercise {
  const id = exercise.id.slice(0, -LEGACY_ALTERNATIVE_SUFFIX.length);
  return {
    ...alternativeOf(exercise),
    id,
    perSide: exercise.alternative.movement?.perSide ?? legacyUnilateralOriginals.has(id),
  };
}

/** Swap an exercise with no sets yet for its alternative, or back to the programmed one. */
export function swapExercise(session: Session, exerciseId: string): Session {
  if (session.status !== 'active') throw new Error('Completed workouts cannot be edited.');
  const entry = session.exercises.find((item) => item.exercise.id === exerciseId);
  if (!entry) throw new Error('Exercise is not part of this session.');
  if (entry.logs.length) throw new Error('Exercises with logged sets cannot be swapped.');
  const legacySwap = exerciseId.endsWith(LEGACY_ALTERNATIVE_SUFFIX);
  // Old swaps did not retain a full original. Recover their saved reverse prescription instead
  // of replacing its sets/reps/RIR with the current template; new swaps restore an exact snapshot.
  const original =
    entry.originalExercise ?? (legacySwap ? restoreLegacyOriginal(entry.exercise) : undefined);
  const next = original
    ? { exercise: original, logs: [] }
    : { exercise: alternativeOf(entry.exercise), originalExercise: entry.exercise, logs: [] };
  return sessionSchema.parse({
    ...session,
    exercises: session.exercises.map((item) => (item === entry ? next : item)),
  });
}

export function finishSession(session: Session): Session {
  if (!session.exercises.some((entry) => entry.logs.length > 0)) {
    throw new Error('Record at least one set before completing a workout.');
  }
  return sessionSchema.parse({
    ...session,
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

/** Progress counts whole exercises: one is done once all its sets are logged. */
export function isExerciseComplete(entry: Session['exercises'][number]): boolean {
  return entry.logs.length >= entry.exercise.sets;
}

export function sessionProgress(session: Session): { done: number; total: number } {
  return {
    done: session.exercises.filter(isExerciseComplete).length,
    total: session.exercises.length,
  };
}

/** Completed earlier sessions with sets for this exercise, newest first. */
function exposures(sessions: readonly Session[], session: Session, exerciseId: string) {
  return sessions
    .filter(
      (candidate) =>
        candidate.id !== session.id &&
        candidate.status === 'completed' &&
        candidate.date <= session.date,
    )
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || second.startedAt.localeCompare(first.startedAt),
    )
    .flatMap((candidate) => {
      const entry = candidate.exercises.find(
        (item) => canonicalExerciseId(item.exercise.id) === canonicalExerciseId(exerciseId),
      );
      return entry?.logs.length
        ? [{ date: candidate.date, sets: entry.exercise.sets, logs: entry.logs }]
        : [];
    });
}

export function previousPerformance(
  sessions: readonly Session[],
  session: Session,
  exerciseId: string,
) {
  return exposures(sessions, session, exerciseId)[0] ?? null;
}

const nextStep: Record<Exercise['loadKind'], string> = {
  barbell: 'Add 2.5 kg',
  smith: 'Add 2.5 kg',
  dumbbell: 'Move to the next dumbbell',
  cable: 'Move one pin heavier',
  machine: 'Move one pin heavier',
  bodyweight: 'Keep adding reps or slow the lowering',
};

// Hard for this lifter: start at the lightest setting and add up to 3 reps above the range
// before the next (relatively big) dumbbell or pin, as the research plan suggests.
const buildSlowly = new Set(['db-lateral-raise', 'one-arm-cable-overhead-triceps-extension']);

/** Top load, then total reps at that load: higher means better. */
function score(logs: SetLog[]): [number, number] {
  const top = bestSet(logs)?.load ?? 0;
  return [
    top,
    logs.filter((log) => (log.load ?? 0) >= top).reduce((sum, log) => sum + log.reps, 0),
  ];
}
const beats = (a: [number, number], b: [number, number]) =>
  a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);

/**
 * Double progression from the research plan: keep the load until every set reaches the top of
 * the range at about the target RIR, then add the smallest jump. Flags a stall when the last two
 * exposures did not beat the one before them.
 */
export function nextTarget(sessions: readonly Session[], session: Session, exercise: Exercise) {
  const [last, middle, oldest] = exposures(sessions, session, exercise.id);
  const slow = buildSlowly.has(exercise.id);
  if (!last) {
    return slow
      ? {
          ready: false,
          stalled: false,
          load: null,
          text: `Start with the ${exercise.loadKind === 'dumbbell' ? 'lightest dumbbells' : 'lowest pin'}, even if it feels easy. Clean reps first; weight comes later.`,
        }
      : null;
  }
  const goal = slow ? exercise.max + 3 : exercise.max;
  const top = bestSet(last.logs)!;
  // One RIR below target still counts: the plan takes isolation last sets to 0–1 RIR.
  const reserve = Number.parseFloat(exercise.targetRir) - 1;
  const consistentLoad = last.logs.every((log) => log.load === top.load);
  const ready =
    consistentLoad &&
    last.logs.length >= last.sets &&
    last.logs.every(
      (log) => log.reps >= goal && (exercise.unit === 'seconds' || log.effort >= reserve),
    );
  const reps = last.logs.map((log) => log.reps).join(' / ');
  const stalled =
    !ready &&
    !!oldest &&
    !beats(score(last.logs), score(oldest.logs)) &&
    !beats(score(middle!.logs), score(oldest.logs));
  const fixedJump = exercise.loadKind === 'barbell' || exercise.loadKind === 'smith';
  return {
    ready,
    stalled,
    // Pre-fill the heavier load where the jump is known; other kinds depend on the gym's steps.
    load: ready && fixedJump && top.load !== null ? top.load + 2.5 : null,
    text: ready
      ? `${nextStep[exercise.loadKind]}${fixedJump && top.load !== null ? ` (${top.load + 2.5} kg)` : ''}. Every set reached ${goal} ${exercise.unit} last time, so expect about ${exercise.min} now.`
      : !consistentLoad
        ? 'Last time used mixed loads. Keep the load steady across your working sets before increasing it.'
        : `${top.load === null ? 'Beat' : `Same ${top.load} kg, beat`} ${reps} by one rep on any set.`,
  };
}

/** Top set: heaviest load, then most reps. Bodyweight sets compare on reps alone. */
export function bestSet(logs: SetLog[]): SetLog | null {
  return logs.reduce<SetLog | null>((best, log) => {
    if (!best) return log;
    const load = log.load ?? 0;
    const bestLoad = best.load ?? 0;
    return load > bestLoad || (load === bestLoad && log.reps > best.reps) ? log : best;
  }, null);
}

function formatReps(log: SetLog): string {
  return log.sides ? `L ${log.sides.left} / R ${log.sides.right}` : String(log.reps);
}

/** Compact set, e.g. "40 kg × 8", "L 10 / R 9" for a bodyweight one-sided set. */
export function shortSet(log: SetLog): string {
  return log.load === null ? formatReps(log) : `${log.load} kg × ${formatReps(log)}`;
}

export function formatSet(log: SetLog, exercise: Exercise): string {
  const reserve = exercise.unit === 'seconds' ? 's reserve' : 'RIR';
  return `${shortSet(log)} ${exercise.unit} · ${log.effort} ${reserve}`;
}

/** Rest between sets: the user's chosen minutes, or the exercise's programme rest. */
export function restFor(
  exercise: Pick<Exercise, 'restSeconds' | 'restLabel'>,
  minutes: number | null,
) {
  return minutes === null
    ? { seconds: exercise.restSeconds, label: exercise.restLabel }
    : { seconds: Math.round(minutes * 60), label: `${minutes} min` };
}
