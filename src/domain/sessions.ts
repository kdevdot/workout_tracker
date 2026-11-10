import { getExercises } from './programme';
import type { Phase, WorkoutId } from './programme-types';
import type { Exercise } from './programme-types';
import { sessionSchema, setSchema, type Session, type SetLog } from './state';

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
export function sessionProgress(session: Session): { done: number; total: number } {
  return {
    done: session.exercises.filter((entry) => entry.logs.length >= entry.exercise.sets).length,
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
      const entry = candidate.exercises.find((item) => item.exercise.id === exerciseId);
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
  if (!last) return null;
  const top = bestSet(last.logs)!;
  // One RIR below target still counts: the plan takes isolation last sets to 0–1 RIR.
  const reserve = Number.parseFloat(exercise.targetRir) - 1;
  const ready =
    last.logs.length >= last.sets &&
    last.logs.every(
      (log) => log.reps >= exercise.max && (exercise.unit === 'seconds' || log.effort >= reserve),
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
      ? `${nextStep[exercise.loadKind]}${fixedJump && top.load !== null ? ` (${top.load + 2.5} kg)` : ''}. Every set reached ${exercise.max} ${exercise.unit} last time, so expect about ${exercise.min} now.`
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
