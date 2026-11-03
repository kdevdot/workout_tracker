import { computed, onMounted, shallowRef, watch } from 'vue';
import { localDate, validDate } from '../domain/dates';
import { workoutForDate } from '../domain/programme';
import type { WorkoutId } from '../domain/programme-types';
import { finishSession, recordSet, startSession } from '../domain/sessions';
import { intakeSchema, type AppState, type SetLog } from '../domain/state';
import { useRestTimer } from './useRestTimer';
import { useTrainingStore } from './useTrainingStore';

export type View = 'plan' | 'session' | 'history' | 'supplements' | 'settings';

/** App-level orchestration: navigation state plus every persisted user action. */
export function useTrainingApp() {
  const store = useTrainingStore();
  const { state, update } = store;
  const timer = useRestTimer(state);
  const view = shallowRef<View>('plan');
  const date = shallowRef(localDate());
  const override = shallowRef<WorkoutId | null | undefined>(undefined);
  const sessionId = shallowRef<string | null>(null);
  const message = shallowRef('');

  const workoutId = computed(() =>
    override.value === undefined ? workoutForDate(date.value) : override.value,
  );
  const draft = computed(
    () =>
      state.value.sessions.find(
        (session) =>
          session.date === date.value &&
          session.workoutId === workoutId.value &&
          session.status === 'active',
      ) ?? null,
  );
  const completed = computed(
    () =>
      state.value.sessions
        .filter(
          (session) =>
            session.date === date.value &&
            session.workoutId === workoutId.value &&
            session.status === 'completed',
        )
        .at(-1) ?? null,
  );
  const doneDates = computed(
    () =>
      new Set(
        state.value.sessions
          .filter((session) => session.status === 'completed')
          .map((session) => session.date),
      ),
  );
  const currentSession = computed(
    () => state.value.sessions.find((session) => session.id === sessionId.value) ?? null,
  );
  const hasLabel = computed(
    () => state.value.settings.whey.calories !== null && state.value.settings.whey.protein !== null,
  );

  onMounted(store.load);
  watch(view, () => {
    message.value = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  function changeDate(value: string) {
    if (!validDate(value)) return;
    date.value = value;
    override.value = undefined;
  }
  function chooseWorkout(id: WorkoutId | null) {
    override.value = id;
  }
  function open(id: string) {
    sessionId.value = id;
    view.value = 'session';
  }
  async function begin() {
    if (!workoutId.value || date.value > localDate()) return;
    if (draft.value) return open(draft.value.id);
    const session = startSession(workoutId.value, date.value, state.value.settings.phase);
    if (await update((current) => ({ ...current, sessions: [...current.sessions, session] })))
      open(session.id);
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
            endsAt: Date.now() + entry.exercise.restSeconds * 1000,
          },
    }));
    if (saved)
      message.value = correcting
        ? 'Corrected set saved on this device.'
        : 'Set saved on this device.';
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
      view.value = 'history';
  }
  function stopTimer() {
    return update((current) => ({ ...current, timer: null }));
  }
  async function addIntake(kind: 'whey' | 'creatine', amount: number) {
    if (date.value > localDate()) return;
    const whey = state.value.settings.whey;
    const input = {
      id: crypto.randomUUID(),
      date: date.value,
      kind,
      amount,
      product: kind === 'whey' ? whey.name : 'Optimum Nutrition creatine',
      calories: kind === 'whey' && whey.calories !== null ? whey.calories * amount : null,
      protein: kind === 'whey' && whey.protein !== null ? whey.protein * amount : null,
      recordedAt: new Date().toISOString(),
    };
    if (
      await update((current) => ({
        ...current,
        intakes: [...current.intakes, intakeSchema.parse(input)],
      }))
    )
      message.value = 'Intake saved on this device.';
  }
  function removeIntake(id: string) {
    return update((current) => ({
      ...current,
      intakes: current.intakes.filter((entry) => entry.id !== id),
    }));
  }
  async function saveSettings(settings: AppState['settings']) {
    if (await update((current) => ({ ...current, settings })))
      message.value = 'Settings saved. Existing records are unchanged.';
  }
  async function restore(imported: AppState) {
    if (await update(() => ({ ...imported, timer: null }))) {
      sessionId.value = null;
      override.value = undefined;
      view.value = 'plan';
      message.value = 'Backup restored on this device.';
    }
  }

  return {
    ...store,
    timer,
    view,
    date,
    workoutId,
    draft,
    completed,
    doneDates,
    currentSession,
    hasLabel,
    message,
    changeDate,
    chooseWorkout,
    open,
    begin,
    saveSet,
    finish,
    stopTimer,
    addIntake,
    removeIntake,
    saveSettings,
    restore,
  };
}
