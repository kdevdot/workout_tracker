<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight, ChevronDown, CircleCheck, Flame, History, Repeat } from '@lucide/vue';
import { getExercises, workouts } from '@/domain/programme';
import type { Phase, WorkoutId } from '@/domain/programme-types';
import type { Session } from '@/domain/state';
import { restFor, sessionProgress } from '@/domain/sessions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ExerciseGuide from '@/components/ExerciseGuide.vue';
import ExerciseIcon from '@/components/ExerciseIcon.vue';
import MuscleMap from '@/components/MuscleMap.vue';
import WeekStrip from '@/components/WeekStrip.vue';
import WorkoutArt from '@/components/WorkoutArt.vue';

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

function chooseWorkout(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emit('workout', value in workouts ? (value as WorkoutId) : null);
}
</script>

<template>
  <WeekStrip :date="date" :today="today" :done-dates="doneDates" @date="emit('date', $event)" />

  <section class="workout-hero screen-enter">
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-3">
        <p
          v-if="done && progress"
          class="bg-success-soft text-success flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
        >
          <CircleCheck class="size-4" />{{
            progress.done < progress.total ? 'Completed · partial' : 'Completed'
          }}
        </p>
        <h2 class="workout-title">{{ workout?.name ?? 'Rest day' }}</h2>
        <p v-if="workout" class="text-muted-foreground text-xs leading-5 font-medium">
          {{ exercises.length }} exercises<span class="mx-1.5">·</span>{{ totalSets }} working sets
        </p>
        <p v-else class="text-muted-foreground text-xs leading-5">
          Recovery is part of your programme. Supplements stay on track, even today.
        </p>
      </div>
      <WorkoutArt :rest="!workout" class="size-20 shrink-0" />
    </div>
    <div class="flex flex-col gap-4">
      <p v-if="workout" class="text-muted-foreground flex items-start gap-2 text-xs leading-5">
        <span class="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
        {{
          activePhase === 'intro'
            ? 'Introduction · 2 sets, 3 RIR'
            : 'Full baseline · exercise-specific RIR'
        }}
      </p>
      <p
        v-if="workout && readyForBaseline && !shown"
        class="bg-secondary flex flex-wrap items-center gap-x-1 rounded-lg px-3 py-2 text-xs leading-5"
      >
        Two weeks of introduction done. Recovering well?
        <Button variant="link" size="sm" class="h-auto p-0 text-xs" @click="emit('settings')"
          >Switch to Full baseline</Button
        >
      </p>
      <div v-if="progress" class="flex flex-col gap-2">
        <div class="flex justify-between text-xs font-medium">
          <span>{{ progress.done }} / {{ progress.total }} exercises done</span>
          <span class="text-muted-foreground">{{
            done ? 'Saved to history' : 'Session targets locked'
          }}</span>
        </div>
        <Progress
          :model-value="(progress.done / progress.total) * 100"
          :class="
            done
              ? 'bg-success-soft [&_[data-slot=progress-indicator]]:bg-success'
              : 'bg-secondary [&_[data-slot=progress-indicator]]:bg-primary'
          "
        />
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
      <label class="flex items-center justify-between gap-3 text-sm font-medium">
        <span class="flex items-center gap-2"
          ><Repeat class="text-muted-foreground size-4" />Switch workout</span
        >
        <select
          :value="workoutId ?? ''"
          :disabled="busy"
          class="border-input bg-card focus-visible:ring-ring/50 h-10 rounded-lg border px-3 outline-none focus-visible:ring-3"
          @change="chooseWorkout"
        >
          <option value="">Rest day</option>
          <option v-for="option in workouts" :key="option.id" :value="option.id">
            {{ option.name }}
          </option>
        </select>
      </label>
    </div>
  </section>

  <div class="workout-layout">
    <aside class="workout-sidebar flex min-w-0 flex-col gap-5">
      <MuscleMap :primary="workout?.primary ?? []" :supporting="workout?.supporting ?? []" />
    </aside>

    <div v-if="workout" class="workout-content flex min-w-0 flex-col gap-6">
      <details class="group bg-secondary rounded-xl px-4">
        <summary class="flex min-h-14 items-center gap-3 text-sm font-semibold">
          <Flame class="size-4" />Warm-up & preparation
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

      <section class="flex flex-col gap-4">
        <div class="flex items-end justify-between gap-2">
          <h3 class="section-heading">Exercise order</h3>
          <span class="text-muted-foreground text-[10px] font-medium"
            >Sets ×
            {{
              exercises.some((exercise) => exercise.unit === 'seconds') ? 'reps / time' : 'reps'
            }}</span
          >
        </div>
        <div class="exercise-list">
          <details v-for="exercise in exercises" :key="exercise.id" class="group/exercise">
            <summary class="exercise-row">
              <ExerciseIcon :exercise-id="exercise.id" class="size-14 shrink-0" />
              <span class="flex min-w-0 flex-1 flex-col gap-1.5">
                <span class="text-sm leading-snug font-semibold">{{ exercise.name }}</span>
                <small class="text-muted-foreground text-[10px] leading-relaxed sm:text-xs"
                  >{{ restFor(exercise, restMinutes).label }} rest · {{ exercise.targetRir
                  }}{{ exercise.unit === 'seconds' ? '' : ' RIR' }}</small
                >
              </span>
              <span class="flex shrink-0 flex-col items-end gap-1 text-right">
                <strong class="font-display text-[24px] leading-none font-semibold tabular-nums"
                  >{{ exercise.sets }} × {{ exercise.min }}–{{ exercise.max }}</strong
                >
                <small
                  v-if="exercise.perSide || exercise.unit !== 'reps'"
                  class="text-muted-foreground text-[10px]"
                  >{{ exercise.unit }}{{ exercise.perSide ? ' / side' : '' }}</small
                >
                <ChevronDown
                  class="text-muted-foreground size-3.5 transition-transform group-open/exercise:rotate-180"
                />
              </span>
            </summary>
            <div class="bg-card rounded-xl border p-4"><ExerciseGuide :exercise="exercise" /></div>
          </details>
        </div>
        <p class="text-muted-foreground text-xs leading-5">
          Tap an exercise for its demonstration, setup and form checks.
        </p>
      </section>
    </div>
  </div>
</template>
