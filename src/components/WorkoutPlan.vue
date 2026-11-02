<script setup lang="ts">
import { computed } from 'vue';
import { formatDate, localDate, shiftDate, weekFor } from '../domain/dates';
import { getExercises, workouts } from '../domain/programme';
import type { Phase, WorkoutId } from '../domain/programme-types';
import type { Session } from '../domain/state';
import { sessionProgress } from '../domain/sessions';
import ExerciseGuide from './ExerciseGuide.vue';
import MuscleMap from './MuscleMap.vue';
import UiIcon from './UiIcon.vue';

const props = defineProps<{
  date: string;
  workoutId: WorkoutId | null;
  phase: Phase;
  session: Session | null;
  busy: boolean;
}>();
const emit = defineEmits<{
  date: [value: string];
  workout: [value: WorkoutId | null];
  start: [];
  supplements: [];
}>();
const week = computed(() => weekFor(props.date));
const workout = computed(() => (props.workoutId ? workouts[props.workoutId] : null));
const exercises = computed(
  () =>
    props.session?.exercises.map((entry) => entry.exercise) ??
    (props.workoutId ? getExercises(props.workoutId, props.phase) : []),
);
const total = computed(() => exercises.value.reduce((sum, exercise) => sum + exercise.sets, 0));
const phaseName = computed(() =>
  (props.session?.phase ?? props.phase) === 'intro'
    ? 'Introduction · 3 RIR for rep-based sets'
    : 'Full baseline · exercise-specific RIR',
);
const future = computed(() => props.date > localDate());
function chooseWorkout(event: Event) {
  emit('workout', ((event.target as HTMLSelectElement).value || null) as WorkoutId | null);
}
</script>

<template>
  <header class="date-heading">
    <div>
      <p class="weekday">{{ formatDate(date, { weekday: 'long' }) }}</p>
      <h1>{{ formatDate(date, { day: 'numeric', month: 'long' }) }}</h1>
    </div>
    <span class="year">{{ date.slice(0, 4) }}</span>
  </header>
  <div class="calendar-tools">
    <button
      class="icon-button"
      aria-label="Previous week"
      @click="emit('date', shiftDate(date, -7))"
    >
      ‹</button
    ><label class="date-picker"
      >Choose date<input
        type="date"
        :value="date"
        @change="emit('date', ($event.target as HTMLInputElement).value)" /></label
    ><button class="icon-button" aria-label="Next week" @click="emit('date', shiftDate(date, 7))">
      ›
    </button>
  </div>
  <div class="week-strip" aria-label="Week dates">
    <button
      v-for="day in week"
      :key="day"
      :aria-pressed="date === day"
      :aria-label="formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' })"
      @click="emit('date', day)"
    >
      <span>{{ formatDate(day, { weekday: 'short' }) }}</span
      ><strong>{{ Number(day.slice(-2)) }}</strong
      ><i :class="{ today: day === localDate() }" />
    </button>
  </div>
  <section class="session-card">
    <div class="session-summary">
      <div>
        <h2>{{ workout?.name ?? 'Rest day' }}</h2>
        <p>
          {{
            workout
              ? `${exercises.length} exercises · ${total} working sets`
              : 'No lifting session scheduled'
          }}
        </p>
      </div>
      <UiIcon name="weights" />
    </div>
    <p v-if="workout" class="phase-note">{{ phaseName }}</p>
    <p v-if="session" class="phase-note">
      {{ sessionProgress(session).done }} / {{ sessionProgress(session).total }} sets saved ·
      prescriptions locked to this session
    </p>
  </section>
  <details class="schedule-options">
    <summary>Change this day's session</summary>
    <label
      >Workout<select :value="workoutId ?? ''" :disabled="busy" @change="chooseWorkout">
        <option value="">Rest day</option>
        <option v-for="option in workouts" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select></label
    >
    <p class="fine-print">
      Choose what you actually train; this does not change the weekly template.
    </p>
  </details>
  <MuscleMap
    :workout-id="workoutId"
    :primary="workout?.primary ?? []"
    :supporting="workout?.supporting ?? []"
  />
  <template v-if="workout">
    <details class="warmup">
      <summary>Warm-up & preparation</summary>
      <p>{{ workout.warmup }}</p>
      <p v-if="(session?.phase ?? phase) === 'intro'">
        Use 2 working sets per exercise for the introduction. If this is substantially more than
        recent training, reduce isolation work further. Increase only when recovery is acceptable.
      </p>
    </details>
    <div class="section-heading exercise-heading">
      <h3>Exercise order</h3>
      <span class="muted"
        >Sets ×
        {{
          exercises.some((exercise) => exercise.unit === 'seconds') ? 'reps / time' : 'reps'
        }}</span
      >
    </div>
    <details v-for="(exercise, index) in exercises" :key="exercise.id" class="exercise-row">
      <summary>
        <span class="exercise-number">{{ String(index + 1).padStart(2, '0') }}</span
        ><span class="exercise-name"
          >{{ exercise.name
          }}<small
            >{{ exercise.restLabel }} rest · {{ exercise.targetRir
            }}{{ exercise.unit === 'seconds' ? '' : ' RIR' }}</small
          ></span
        ><span class="prescription"
          >{{ exercise.sets }} × {{ exercise.min }}–{{ exercise.max
          }}<small>{{ exercise.unit }}{{ exercise.perSide ? ' / side' : '' }}</small></span
        >
      </summary>
      <ExerciseGuide :exercise="exercise" />
    </details>
    <p v-if="future" class="fine-print">
      Future date: preview only. Choose today or an earlier date to record actual training.
    </p>
    <button class="primary-button" :disabled="busy || future" @click="emit('start')">
      <span>{{ session ? 'Resume workout' : 'Start workout' }}</span
      ><UiIcon name="arrow" />
    </button>
  </template>
  <template v-else
    ><p class="rest-copy">Rest is part of the plan. Your next session stays in the calendar.</p>
    <button class="primary-button" @click="emit('supplements')">
      <span>Log supplements</span><UiIcon name="arrow" /></button
  ></template>
</template>
