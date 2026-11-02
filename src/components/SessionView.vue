<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import type { AppState, Session, SetLog } from '../domain/state';
import { previousPerformance, sessionProgress } from '../domain/sessions';
import { formatDate } from '../domain/dates';
import { workouts } from '../domain/programme';
import ExerciseGuide from './ExerciseGuide.vue';
import UiIcon from './UiIcon.vue';

const props = defineProps<{
  session: Session;
  state: AppState;
  busy: boolean;
  timerDisplay: string;
  timerDone: boolean;
  timerVisible: boolean;
}>();
const emit = defineEmits<{
  back: [];
  record: [exerciseId: string, log: SetLog];
  finish: [];
  stopTimer: [];
}>();
const selected = shallowRef(0);
const editing = shallowRef<number | null>(null);
const load = shallowRef<string | number>('');
const reps = shallowRef<string | number>('');
const effort = shallowRef<string | number>('');
const formError = shallowRef('');
const confirmingFinish = shallowRef(false);
const entry = computed(() => props.session.exercises[selected.value]!);
const exercise = computed(() => entry.value.exercise);
const progress = computed(() => sessionProgress(props.session));
const previous = computed(() => previousPerformance(props.state, props.session, exercise.value.id));
const nextIndex = computed(
  () =>
    editing.value ??
    Array.from({ length: exercise.value.sets }, (_, index) => index + 1).find(
      (index) => !entry.value.logs.some((log) => log.index === index),
    ) ??
    null,
);
const loadHint = computed(
  () =>
    ({
      smith: 'Total added plates, both sides; excludes the Smith bar.',
      dumbbell: 'Kilograms per dumbbell. If one DB is used, record that one DB.',
      cable: 'Record the selected stack setting in kg; pulley ratios vary.',
      machine: 'Record the selected machine setting in kg; confirm setup first.',
      bodyweight: 'Bodyweight movement: no external load required.',
    })[exercise.value.loadKind],
);
watch(
  () => [props.session.id, selected.value],
  () => resetForm(),
  { immediate: true },
);
function resetForm() {
  editing.value = null;
  load.value = '';
  reps.value = '';
  effort.value = '';
  formError.value = '';
}
function edit(log: SetLog) {
  editing.value = log.index;
  load.value = log.load === null ? '' : String(log.load);
  reps.value = String(log.reps);
  effort.value = String(log.effort);
  formError.value = '';
}
function submit() {
  formError.value = '';
  if (nextIndex.value === null) return;
  const numericLoad =
    exercise.value.loadKind === 'bodyweight' && load.value === '' ? null : Number(load.value);
  const numericReps = Number(reps.value);
  const numericEffort = Number(effort.value);
  if (
    (exercise.value.loadKind !== 'bodyweight' && String(load.value).trim() === '') ||
    (numericLoad !== null &&
      (!Number.isFinite(numericLoad) || numericLoad < 0 || numericLoad > 1000)) ||
    !Number.isInteger(numericReps) ||
    numericReps <= 0 ||
    numericReps > 3600 ||
    String(effort.value).trim() === '' ||
    !Number.isFinite(numericEffort) ||
    numericEffort < 0 ||
    numericEffort > (exercise.value.unit === 'seconds' ? 120 : 10)
  ) {
    formError.value =
      'Enter a valid load, positive whole reps/time, and your actual effort reserve.';
    return;
  }
  emit('record', exercise.value.id, {
    index: nextIndex.value,
    load: numericLoad,
    reps: numericReps,
    effort: numericEffort,
    loggedAt: new Date().toISOString(),
  });
}
watch(
  () => JSON.stringify(entry.value.logs),
  () => resetForm(),
);
</script>

<template>
  <button class="back-button" @click="emit('back')"><UiIcon name="back" />Back to plan</button>
  <p class="muted">
    {{ formatDate(session.date, { weekday: 'short', day: 'numeric', month: 'short' }) }} ·
    {{ workouts[session.workoutId].name }} · {{ progress.done }}/{{ progress.total }} sets saved
  </p>
  <label class="exercise-select"
    >Exercise<select v-model="selected">
      <option v-for="(item, index) in session.exercises" :key="item.exercise.id" :value="index">
        {{ index + 1 }}. {{ item.exercise.name }}
      </option>
    </select></label
  >
  <h1 class="exercise-title">{{ exercise.name }}</h1>
  <p class="muted">
    {{ loadHint
    }}{{ exercise.perSide ? ' Complete both sides for one set; match clean reps.' : '' }}
  </p>
  <div class="prescription-stats">
    <div>
      <strong>{{ exercise.min }}–{{ exercise.max }}</strong
      ><span>{{ exercise.unit }}{{ exercise.perSide ? '/side' : '' }}</span>
    </div>
    <div>
      <strong>{{ exercise.targetRir }}</strong
      ><span>{{ exercise.unit === 'seconds' ? 'form reserve' : 'target RIR' }}</span>
    </div>
    <div>
      <strong>{{ exercise.restLabel }}</strong
      ><span>rest</span>
    </div>
  </div>
  <details class="warmup">
    <summary>Setup, technique & alternative</summary>
    <ExerciseGuide :exercise="exercise" />
  </details>
  <section class="previous-performance">
    <h3>Previous session</h3>
    <p v-if="previous">
      {{ formatDate(previous.date, { day: 'numeric', month: 'short' }) }} ·
      {{
        previous.logs
          .map((log) => `${log.load === null ? 'BW' : `${log.load} kg`} × ${log.reps}`)
          .join(' · ')
      }}
    </p>
    <p v-else>No previous completed entries for this movement.</p>
  </section>
  <ul v-if="entry.logs.length" class="logged-sets">
    <li v-for="log in entry.logs" :key="log.index">
      <UiIcon name="check" /><span
        >Set {{ log.index }} · {{ log.load === null ? 'BW' : `${log.load} kg` }} × {{ log.reps }}
        {{ exercise.unit }} · {{ log.effort }}
        {{ exercise.unit === 'seconds' ? 's reserve' : 'RIR' }}</span
      ><button :disabled="busy" @click="edit(log)">Edit</button>
    </li>
  </ul>
  <form v-if="nextIndex !== null" class="set-form" @submit.prevent="submit">
    <h3>{{ editing ? 'Edit' : 'Record' }} set {{ nextIndex }} of {{ exercise.sets }}</h3>
    <div class="set-fields">
      <label
        >Load · kg<input
          v-model="load"
          type="number"
          inputmode="decimal"
          min="0"
          max="1000"
          step="any"
          :required="exercise.loadKind !== 'bodyweight'"
          :placeholder="exercise.loadKind === 'bodyweight' ? 'BW' : '—'" /></label
      ><label
        >{{ exercise.unit
        }}<input
          v-model="reps"
          type="number"
          inputmode="numeric"
          min="1"
          max="3600"
          step="1"
          required
          placeholder="—" /></label
      ><label
        >{{ exercise.unit === 'seconds' ? 'Reserve · s' : 'Actual RIR'
        }}<input
          v-model="effort"
          type="number"
          inputmode="decimal"
          min="0"
          :max="exercise.unit === 'seconds' ? 120 : 10"
          step="0.5"
          required
          placeholder="—"
      /></label>
    </div>
    <p v-if="formError" class="error-text" role="alert">{{ formError }}</p>
    <button class="primary-button" :disabled="busy">
      <span>{{
        busy ? 'Saving…' : editing ? 'Save corrected set' : `Record set ${nextIndex}`
      }}</span
      ><UiIcon name="check" /></button
    ><button v-if="editing" type="button" class="text-button" @click="resetForm">
      Cancel correction
    </button>
  </form>
  <p v-else class="success-text">All planned sets for this exercise are saved.</p>
  <p class="fine-print">
    RIR = clean repetitions you could still perform. Record actual results, not just the target.
    Walkout reps are complete out-and-back cycles.
  </p>
  <aside v-if="timerVisible" class="rest-timer" role="timer" aria-label="Rest timer">
    <div>
      <strong>{{ timerDone ? 'Rest complete' : timerDisplay }}</strong
      ><span>{{
        timerDone ? 'Continue when ready.' : 'Rest timer · continues when backgrounded'
      }}</span>
    </div>
    <button class="text-button" :disabled="busy" @click="emit('stopTimer')">Dismiss</button>
  </aside>
  <div class="exercise-navigation">
    <button class="secondary-button" :disabled="selected === 0" @click="selected--">Previous</button
    ><button
      class="secondary-button"
      :disabled="selected === session.exercises.length - 1"
      @click="selected++"
    >
      Next exercise
    </button>
  </div>
  <div class="finish-section">
    <button
      class="secondary-button"
      :disabled="busy || !progress.done"
      @click="confirmingFinish = !confirmingFinish"
    >
      Finish workout
    </button>
    <div v-if="confirmingFinish" class="confirmation">
      <p>
        {{ progress.done }} of {{ progress.total }} sets saved.
        {{
          progress.done < progress.total
            ? 'This will be recorded as a partial workout, not full completion.'
            : 'Ready to complete this session?'
        }}
      </p>
      <button class="primary-button" :disabled="busy" @click="emit('finish')">Confirm finish</button
      ><button class="text-button" @click="confirmingFinish = false">Keep training</button>
    </div>
  </div>
</template>
