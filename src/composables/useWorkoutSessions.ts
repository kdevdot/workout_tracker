import type { Ref } from 'vue';
import { localDate } from '@/domain/dates';
import {
  finishSession,
  isUntouchedSession,
  recordSet,
  restFor,
  startSession,
  swapExercise,
} from '@/domain/sessions';
import type { Session, SetLog } from '@/domain/state';
import type { WorkoutId } from '@/domain/programme-types';
import type { TrainingActions } from './training-types';

interface Deps extends TrainingActions {
  date: Ref<string>;
  workoutId: Readonly<Ref<WorkoutId | null>>;
  draft: Readonly<Ref<Session | null>>;
  currentSession: Readonly<Ref<Session | null>>;
  open: (id: string) => void;
  onFinished: () => void;
}

/** Workout writes and their timer deadlines, independent of the app's navigation implementation. */
export function useWorkoutSessions({
  state,
  date,
  workoutId,
  draft,
  currentSession,
  update,
  notify,
  open,
  onFinished,
}: Deps) {
  async function begin() {
    if (!workoutId.value || date.value > localDate()) return null;
    if (draft.value) {
      open(draft.value.id);
      return draft.value.id;
    }
    const session = startSession(workoutId.value, date.value, state.value.settings.phase);
    // Switching workouts drops an untouched draft for this day instead of leaving it behind.
    const saved = await update((current) => ({
      ...current,
      sessions: [
        ...current.sessions.filter(
          (item) => item.date !== session.date || !isUntouchedSession(item),
        ),
        session,
      ],
    }));
    if (saved) open(session.id);
    return saved ? session.id : null;
  }
  async function saveSet(exerciseId: string, log: SetLog) {
    const active = currentSession.value;
    const entry = active?.exercises.find((item) => item.exercise.id === exerciseId);
    if (!active || !entry) return;
    const correcting = entry.logs.some((existing) => existing.index === log.index);
    const saved = await update((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === active.id ? recordSet(session, exerciseId, log) : session,
      ),
      timer: correcting
        ? current.timer
        : {
            sessionId: active.id,
            exerciseId,
            endsAt:
              Date.now() + restFor(entry.exercise, current.settings.restMinutes).seconds * 1000,
          },
    }));
    if (saved) navigator.vibrate?.(15);
    if (saved)
      notify(correcting ? 'Corrected set saved on this device.' : 'Set saved on this device.');
  }
  async function swap(exerciseId: string) {
    const active = currentSession.value;
    if (!active) return;
    if (
      await update((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === active.id ? swapExercise(session, exerciseId) : session,
        ),
      }))
    )
      notify('Exercise swapped for this workout.');
  }
  /** From the plan: start (or resume) today's workout, then swap the exercise in it. */
  async function swapFromPlan(exerciseId: string) {
    if (!(await begin())) return;
    if (currentSession.value?.exercises.some((entry) => entry.exercise.id === exerciseId))
      await swap(exerciseId);
  }
  async function finish() {
    const active = currentSession.value;
    if (!active) return;
    if (
      await update((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === active.id ? finishSession(session) : session,
        ),
        timer: current.timer?.sessionId === active.id ? null : current.timer,
      }))
    )
      onFinished();
  }
  return { begin, saveSet, swap, swapFromPlan, finish };
}
