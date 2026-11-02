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

export function sessionProgress(session: Session): { done: number; total: number } {
  return {
    done: session.exercises.reduce((sum, entry) => sum + entry.logs.length, 0),
    total: session.exercises.reduce((sum, entry) => sum + entry.exercise.sets, 0),
  };
}

export function previousPerformance(
  sessions: readonly Session[],
  session: Session,
  exerciseId: string,
) {
  return (
    sessions
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
        const entry = candidate.exercises.find((exercise) => exercise.exercise.id === exerciseId);
        return entry?.logs.length ? [{ date: candidate.date, logs: entry.logs }] : [];
      })[0] ?? null
  );
}

export function formatLoad(log: SetLog): string {
  return log.load === null ? 'BW' : `${log.load} kg`;
}

export function formatSet(log: SetLog, exercise: Exercise): string {
  const reserve = exercise.unit === 'seconds' ? 's reserve' : 'RIR';
  return `${formatLoad(log)} × ${log.reps} ${exercise.unit} · ${log.effort} ${reserve}`;
}
