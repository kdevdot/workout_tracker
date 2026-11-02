<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue';
import { useTrainingStore } from '../composables/useTrainingStore';
import { useRestTimer } from '../composables/useRestTimer';
import { localDate, validDate } from '../domain/dates';
import { workoutForDate } from '../domain/programme';
import type { WorkoutId } from '../domain/programme-types';
import { finishSession, recordSet, startSession } from '../domain/sessions';
import { intakeSchema, type AppState, type SetLog } from '../domain/state';
import HistoryView from './HistoryView.vue';
import SessionView from './SessionView.vue';
import SettingsView from './SettingsView.vue';
import SupplementsView from './SupplementsView.vue';
import WorkoutPlan from './WorkoutPlan.vue';
import UiIcon from './UiIcon.vue';

type View = 'plan' | 'session' | 'history' | 'supplements' | 'settings';
const { state, ready, busy, error, load, update } = useTrainingStore();
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
const currentSession = computed(
  () => state.value.sessions.find((session) => session.id === sessionId.value) ?? null,
);
const hasLabel = computed(
  () => state.value.settings.whey.calories !== null && state.value.settings.whey.protein !== null,
);
const nav = [
  { view: 'plan', label: 'Plan', icon: 'calendar' },
  { view: 'history', label: 'History', icon: 'history' },
  { view: 'supplements', label: 'Supplements', icon: 'bottle' },
  { view: 'settings', label: 'Settings', icon: 'settings' },
] as const;
onMounted(load);
watch(view, () => {
  message.value = '';
  window.scrollTo({ top: 0, behavior: 'instant' });
});
function changeDate(value: string) {
  if (!validDate(value)) return;
  date.value = value;
  override.value = undefined;
}
async function begin() {
  if (!workoutId.value || date.value > localDate()) return;
  if (draft.value) {
    sessionId.value = draft.value.id;
    view.value = 'session';
    return;
  }
  const session = startSession(workoutId.value, date.value, state.value.settings.phase);
  if (await update((current) => ({ ...current, sessions: [...current.sessions, session] }))) {
    sessionId.value = session.id;
    view.value = 'session';
  }
}
async function saveSet(exerciseId: string, log: SetLog) {
  const active = currentSession.value;
  if (!active) return;
  const entry = active.exercises.find((item) => item.exercise.id === exerciseId)!;
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
function resume(id: string) {
  sessionId.value = id;
  view.value = 'session';
}
</script>

<template>
  <main class="app-shell">
    <div class="app-content">
      <header class="masthead">
        <span class="wordmark">steady<span>.</span></span
        ><span class="local-badge">Local first</span>
      </header>
      <section v-if="!ready" class="empty-state">
        <h1>{{ error ? 'Storage needs attention' : 'Opening your training log…' }}</h1>
        <p v-if="!error">Reading your saved records on this device.</p>
        <button v-if="error" class="secondary-button" @click="load">Retry opening storage</button>
      </section>
      <template v-else>
        <WorkoutPlan
          v-if="view === 'plan'"
          :date="date"
          :workout-id="workoutId"
          :phase="state.settings.phase"
          :session="draft"
          :busy="busy"
          @date="changeDate"
          @workout="override = $event"
          @start="begin"
          @supplements="view = 'supplements'"
        />
        <SessionView
          v-else-if="view === 'session' && currentSession"
          :key="currentSession.id"
          :session="currentSession"
          :state="state"
          :busy="busy"
          :timer-display="timer.display.value"
          :timer-done="timer.seconds.value === 0"
          :timer-visible="state.timer?.sessionId === currentSession.id"
          @back="view = 'plan'"
          @record="saveSet"
          @finish="finish"
          @stop-timer="update((current) => ({ ...current, timer: null }))"
        />
        <HistoryView v-else-if="view === 'history'" :sessions="state.sessions" @resume="resume" />
        <SupplementsView
          v-else-if="view === 'supplements'"
          :date="date"
          :intakes="state.intakes"
          :busy="busy"
          :has-label="hasLabel"
          @date="changeDate"
          @add="addIntake"
          @remove="
            (id) =>
              update((current) => ({
                ...current,
                intakes: current.intakes.filter((entry) => entry.id !== id),
              }))
          "
          @settings="view = 'settings'"
        />
        <SettingsView
          v-else-if="view === 'settings'"
          :state="state"
          :busy="busy"
          @settings="saveSettings"
          @restore="restore"
        />
      </template>
      <div v-if="error" class="error-banner" role="alert">
        <strong>Not saved / storage unavailable</strong>
        <p>{{ error }}</p>
        <button v-if="ready" class="text-button" @click="load">Reload saved records</button>
      </div>
      <p v-if="message" class="success-text" role="status">{{ message }}</p>
      <p v-if="ready" class="save-status" role="status">
        {{
          busy
            ? 'Saving…'
            : state.savedAt
              ? `Saved on this device · ${new Date(state.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'On-device storage ready'
        }}
        · No cloud backup
      </p>
    </div>
    <nav v-if="ready" class="bottom-nav" aria-label="Main navigation">
      <button
        v-for="item in nav"
        :key="item.view"
        :class="{ active: view === item.view || (view === 'session' && item.view === 'plan') }"
        :aria-current="
          view === item.view || (view === 'session' && item.view === 'plan') ? 'page' : undefined
        "
        :disabled="busy"
        @click="view = item.view"
      >
        <UiIcon :name="item.icon" />{{ item.label }}
      </button>
    </nav>
  </main>
  <footer class="app-footer">
    Personal training companion · Export regularly. Your records stay in this browser; no cloud
    service is connected.
  </footer>
</template>
