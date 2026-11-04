import { computed, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { localDate, validDate } from '../domain/dates';
import { workoutForDate } from '../domain/programme';
import type { WorkoutId } from '../domain/programme-types';
import { finishSession, recordSet, restFor, startSession } from '../domain/sessions';
import { intakeSchema, type AppState, type SetLog } from '../domain/state';
import { useRestTimer } from './useRestTimer';
import { useTrainingStore } from './useTrainingStore';

export type View = 'plan' | 'session' | 'history' | 'pushups' | 'supplements' | 'settings';

/** App-level orchestration: navigation state plus every persisted user action. */
export function useTrainingApp() {
  const store = useTrainingStore();
  const { state, update } = store;
  const timer = useRestTimer(state);
  const view = shallowRef<View>('plan');
  const today = shallowRef(localDate());
  const date = shallowRef(today.value);
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

  let hideMessage: ReturnType<typeof setTimeout> | undefined;
  /** Shows a short confirmation toast that hides itself. */
  function notify(text: string) {
    clearTimeout(hideMessage);
    message.value = text;
    hideMessage = setTimeout(() => (message.value = ''), 3000);
  }
  function dismissMessage() {
    clearTimeout(hideMessage);
    message.value = '';
  }

  // Phones resume the app from memory, so re-check the calendar day whenever it comes back.
  useEventListener(document, 'visibilitychange', () => {
    const now = localDate();
    if (document.visibilityState !== 'visible' || now === today.value) return;
    if (date.value === today.value) changeDate(now);
    today.value = now;
  });

  onMounted(store.load);
  onUnmounted(() => clearTimeout(hideMessage));
  watch(view, () => {
    dismissMessage();
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
            endsAt:
              Date.now() + restFor(entry.exercise, current.settings.restMinutes).seconds * 1000,
          },
    }));
    if (saved)
      notify(correcting ? 'Corrected set saved on this device.' : 'Set saved on this device.');
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
      notify('Intake saved on this device.');
  }
  function removeIntake(id: string) {
    return update((current) => ({
      ...current,
      intakes: current.intakes.filter((entry) => entry.id !== id),
    }));
  }
  function savePushups(change: (pushups: AppState['pushups']) => AppState['pushups']) {
    return update((current) => ({ ...current, pushups: change(current.pushups) }));
  }
  async function startPushups(dailyTarget: number) {
    if (await savePushups(() => ({ startDate: today.value, dailyTarget, entries: [] })))
      notify('Challenge started. Day 1 is today.');
  }
  async function addPushups(day: string, reps: number) {
    if (day > localDate()) return;
    const entry = {
      id: crypto.randomUUID(),
      date: day,
      reps,
      recordedAt: new Date().toISOString(),
    };
    if (await savePushups((pushups) => ({ ...pushups, entries: [...pushups.entries, entry] })))
      notify(`+${reps} push-ups saved.`);
  }
  async function undoPushups(day: string) {
    const last = state.value.pushups.entries.findLastIndex((entry) => entry.date === day);
    if (last === -1) return;
    if (
      await savePushups((pushups) => ({
        ...pushups,
        entries: pushups.entries.filter((_, index) => index !== last),
      }))
    )
      notify('Last push-up entry removed.');
  }
  async function setPushupTarget(dailyTarget: number) {
    if (await savePushups((pushups) => ({ ...pushups, dailyTarget })))
      notify(`Daily target set to ${dailyTarget}.`);
  }
  async function resetPushups() {
    if (await savePushups((pushups) => ({ ...pushups, startDate: null, entries: [] })))
      notify('Challenge cleared.');
  }
  async function saveSettings(settings: AppState['settings']) {
    if (await update((current) => ({ ...current, settings })))
      notify('Settings saved. Existing records are unchanged.');
  }
  async function restore(imported: AppState) {
    if (await update(() => ({ ...imported, timer: null }))) {
      sessionId.value = null;
      override.value = undefined;
      view.value = 'plan';
      await nextTick(); // let the view change clear the old message first
      notify('Backup restored on this device.');
    }
  }

  return {
    ...store,
    timer,
    view,
    today,
    date,
    workoutId,
    draft,
    completed,
    doneDates,
    currentSession,
    hasLabel,
    message,
    dismissMessage,
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
    startPushups,
    addPushups,
    undoPushups,
    setPushupTarget,
    resetPushups,
    restore,
  };
}
