<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight, ChevronDown, CircleCheck, Flame, History, Repeat } from '@lucide/vue';
import { getExercises, workouts } from '@/domain/programme';
import type { Phase, WorkoutId } from '@/domain/programme-types';
import type { Session } from '@/domain/state';
import { restFor, sessionProgress } from '@/domain/sessions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ExerciseProgress from '@/components/session/ExerciseProgress.vue';
import WorkoutExerciseList from '@/components/plan/WorkoutExerciseList.vue';
import MuscleMap from '@/components/MuscleMap.vue';
import WeekStrip from '@/components/WeekStrip.vue';

const props = defineProps<{
  date: string;
  today: string;
  workoutId: WorkoutId | null;
  phase: Phase;
  readyForBaseline: boolean;
  restMinutes: number | null;
  session: Session | null;
  completed: Session | null;
  doneDates: Set<string>;
  busy: boolean;
}>();
const emit = defineEmits<{
  date: [value: string];
  workout: [value: WorkoutId | null];
  start: [];
  swap: [exerciseId: string];
  supplements: [];
  history: [];
  settings: [];
}>();

const workout = computed(() => (props.workoutId ? workouts[props.workoutId] : null));
// An active draft wins; otherwise a finished session shows what was actually done.
const shown = computed(() => props.session ?? props.completed);
const exercises = computed(
  () =>
    shown.value?.exercises.map((entry) => entry.exercise) ??
    (props.workoutId ? getExercises(props.workoutId, props.phase) : []),
);
const totalSets = computed(() => exercises.value.reduce((sum, exercise) => sum + exercise.sets, 0));
const activePhase = computed(() => shown.value?.phase ?? props.phase);
const progress = computed(() => (shown.value ? sessionProgress(shown.value) : null));
const done = computed(() => !props.session && props.completed !== null);
const future = computed(() => props.date > props.today);
// Swaps live on today's workout, so only before its sets are logged and never on a preview.
function canSwap(exerciseId: string) {
  if (!workout.value || done.value || future.value || props.busy) return false;
  return !props.session?.exercises.find((entry) => entry.exercise.id === exerciseId)?.logs.length;
}
const swappableIds = computed(
  () =>
    new Set(
      exercises.value.filter((exercise) => canSwap(exercise.id)).map((exercise) => exercise.id),
    ),
);
// Rough session length: each set plus its rest, and about 40 s to do the set itself.
const minutes = computed(
  () =>
    Math.round(
      exercises.value.reduce(
        (sum, exercise) =>
          sum + exercise.sets * (restFor(exercise, props.restMinutes).seconds + 40),
        0,
      ) / 300,
    ) * 5,
);

function chooseWorkout(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emit('workout', value in workouts ? (value as WorkoutId) : null);
}
</script>

<template>
  <WeekStrip :date="date" :today="today" :done-dates="doneDates" @date="emit('date', $event)" />

  <section class="workout-hero screen-enter">
    <span class="hero-watermark" aria-hidden="true">{{
      workout ? workout.name.slice(-1) : 'Zz'
    }}</span>
    <div class="flex flex-col gap-3">
      <div class="flex min-h-7 items-center justify-between gap-3">
        <p class="eyebrow flex items-center gap-2">
          <span :class="cn('size-1.5 rounded-full', workout ? 'bg-primary' : 'bg-coral')" />
          {{
            !workout
              ? 'Recovery'
              : activePhase === 'intro'
                ? 'Introduction · 2 sets, 3 RIR'
                : 'Full baseline · exercise-specific RIR'
          }}
        </p>
        <p
          v-if="done && progress"
          class="bg-success-soft text-success pop-in flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
        >
          <CircleCheck class="size-4" />{{
            progress.done < progress.total ? 'Completed · partial' : 'Completed'
          }}
        </p>
      </div>
      <h2 class="workout-title">{{ workout?.name ?? 'Rest day' }}</h2>
      <p v-if="workout" class="flex gap-5 text-xs font-medium">
        <span class="text-muted-foreground"
          ><strong class="font-display condensed text-foreground mr-1 text-2xl font-bold">{{
            exercises.length
          }}</strong>
          exercises</span
        >
        <span class="text-muted-foreground"
          ><strong class="font-display condensed text-foreground mr-1 text-2xl font-bold">{{
            totalSets
          }}</strong>
          working sets</span
        >
        <span class="text-muted-foreground"
          ><strong class="font-display condensed text-foreground mr-1 text-2xl font-bold"
            >~{{ minutes }}</strong
          >
          min</span
        >
      </p>
      <p v-else class="text-muted-foreground max-w-[26ch] text-sm leading-6">
        Recovery is part of your programme. Supplements stay on track, even today.
      </p>
    </div>
    <div class="flex flex-col gap-4">
      <p
        v-if="workout && readyForBaseline && !shown"
        class="bg-secondary flex flex-wrap items-center gap-x-1 rounded-lg px-3 py-2 text-xs leading-5"
      >
        Two weeks of introduction done. Recovering well?
        <Button variant="link" size="sm" class="h-auto p-0 text-xs" @click="emit('settings')"
          >Switch to Full baseline</Button
        >
      </p>
      <div v-if="progress && shown" class="flex flex-col gap-2">
        <div class="flex justify-between text-xs font-medium">
          <span>{{ progress.done }} / {{ progress.total }} exercises done</span>
          <span class="text-muted-foreground">{{
            done ? 'Saved to history' : 'Session targets locked'
          }}</span>
        </div>
        <ExerciseProgress :exercises="shown.exercises" />
      </div>
      <p v-if="workout && future" class="text-muted-foreground text-xs leading-5">
        Future date: preview only. Choose today or an earlier date to record actual training.
      </p>
      <template v-if="workout && done">
        <Button
          size="lg"
          class="hero-action is-done w-full justify-between px-5 text-sm font-bold"
          @click="emit('history')"
        >
          View in history<History class="size-5" />
        </Button>
        <Button variant="ghost" :disabled="busy || future" @click="emit('start')">
          Train this session again
        </Button>
      </template>
      <Button
        v-else-if="workout"
        size="lg"
        class="hero-action w-full justify-between px-5 text-sm font-bold"
        :disabled="busy || future"
        @click="emit('start')"
      >
        {{ session ? 'Resume workout' : 'Start workout' }}<ArrowRight class="size-5" />
      </Button>
      <Button
        v-else
        size="lg"
        class="hero-action w-full justify-between px-5 text-sm font-bold"
        @click="emit('supplements')"
      >
        Log supplements<ArrowRight class="size-5" />
      </Button>
      <!-- Out of the way: only for a missed day or a busy station, not a change of plan. -->
      <details class="group/switch text-xs">
        <summary
          class="text-muted-foreground hover:text-foreground mx-auto flex min-h-10 w-fit items-center gap-1.5 font-medium"
        >
          <Repeat class="size-3.5" />Training on a different day?
        </summary>
        <label class="flex items-center justify-between gap-3 pt-2 text-sm font-medium">
          <span class="text-muted-foreground">Do this workout today</span>
          <select
            :value="workoutId ?? ''"
            :disabled="busy"
            class="border-input bg-background/60 focus-visible:ring-ring/50 h-10 rounded-xl border px-3 outline-none focus-visible:ring-3"
            @change="chooseWorkout"
          >
            <option value="">Rest day</option>
            <option v-for="option in workouts" :key="option.id" :value="option.id">
              {{ option.name }}
            </option>
          </select>
        </label>
      </details>
    </div>
  </section>

  <div class="workout-layout">
    <aside class="workout-sidebar flex min-w-0 flex-col gap-5">
      <MuscleMap :primary="workout?.primary ?? []" :supporting="workout?.supporting ?? []" />
    </aside>

    <div v-if="workout" class="workout-content flex min-w-0 flex-col gap-6">
      <details class="group bg-card rounded-[20px] px-4 shadow-(--panel-shadow)">
        <summary class="flex min-h-14 items-center gap-3 text-sm font-semibold">
          <Flame class="text-coral size-4" />Warm-up & preparation
          <ChevronDown class="ml-auto size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div class="flex flex-col gap-2 pb-4 text-sm leading-6">
          <p>{{ workout.warmup }}</p>
          <p v-if="activePhase === 'intro'">
            Use 2 working sets per exercise for the introduction. If this is substantially more than
            recent training, reduce isolation work further. Increase only when recovery is
            acceptable.
          </p>
        </div>
      </details>

      <WorkoutExerciseList
        :exercises="exercises"
        :rest-minutes="restMinutes"
        :swappable-ids="swappableIds"
        @swap="emit('swap', $event)"
      />
    </div>
  </div>
</template>
