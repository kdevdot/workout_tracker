<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight, ChevronDown, Dumbbell, Flame, Moon, Repeat } from '@lucide/vue';
import { localDate } from '@/domain/dates';
import { getExercises, workouts } from '@/domain/programme';
import type { Phase, WorkoutId } from '@/domain/programme-types';
import type { Session } from '@/domain/state';
import { sessionProgress } from '@/domain/sessions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ExerciseGuide from './ExerciseGuide.vue';
import MuscleMap from './MuscleMap.vue';
import WeekStrip from './WeekStrip.vue';

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

const workout = computed(() => (props.workoutId ? workouts[props.workoutId] : null));
// A started session keeps its snapshotted prescriptions; otherwise show the current template.
const exercises = computed(
  () =>
    props.session?.exercises.map((entry) => entry.exercise) ??
    (props.workoutId ? getExercises(props.workoutId, props.phase) : []),
);
const totalSets = computed(() => exercises.value.reduce((sum, exercise) => sum + exercise.sets, 0));
const activePhase = computed(() => props.session?.phase ?? props.phase);
const progress = computed(() => (props.session ? sessionProgress(props.session) : null));
const future = computed(() => props.date > localDate());

function chooseWorkout(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emit('workout', value in workouts ? (value as WorkoutId) : null);
}
</script>

<template>
  <WeekStrip :date="date" @date="emit('date', $event)" />

  <section
    class="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl p-5 shadow-lg shadow-primary/15"
  >
    <component
      :is="workout ? Dumbbell : Moon"
      class="absolute -top-3 -right-3 size-28 opacity-10"
      :stroke-width="1.2"
    />
    <div class="relative flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <Badge
          v-if="workout"
          class="bg-primary-foreground/15 text-primary-foreground w-fit border-0"
        >
          {{
            activePhase === 'intro'
              ? 'Introduction · 3 RIR for rep-based sets'
              : 'Full baseline · exercise-specific RIR'
          }}
        </Badge>
        <h2 class="text-3xl font-extrabold tracking-tight">{{ workout?.name ?? 'Rest day' }}</h2>
        <p class="text-primary-foreground/80 text-sm">
          {{
            workout
              ? `${exercises.length} exercises · ${totalSets} working sets`
              : 'No lifting session scheduled'
          }}
        </p>
      </div>

      <div v-if="progress" class="flex flex-col gap-2">
        <div class="flex justify-between text-xs font-semibold">
          <span>{{ progress.done }} / {{ progress.total }} sets saved</span>
          <span class="text-primary-foreground/70">Prescriptions locked to this session</span>
        </div>
        <Progress
          :model-value="(progress.done / progress.total) * 100"
          class="bg-primary-foreground/20 [&_[data-slot=progress-indicator]]:bg-coral"
        />
      </div>

      <template v-if="workout">
        <p v-if="future" class="text-primary-foreground/80 text-xs">
          Future date: preview only. Choose today or an earlier date to record actual training.
        </p>
        <Button
          size="lg"
          class="bg-coral hover:bg-coral/90 h-12 w-full text-base font-bold text-white"
          :disabled="busy || future"
          @click="emit('start')"
        >
          {{ session ? 'Resume workout' : 'Start workout' }}<ArrowRight class="size-5" />
        </Button>
      </template>
      <template v-else>
        <p class="text-primary-foreground/80 text-sm">
          Rest is part of the plan. Your next session stays in the calendar.
        </p>
        <Button
          size="lg"
          variant="secondary"
          class="h-12 w-full text-base font-bold"
          @click="emit('supplements')"
        >
          Log supplements<ArrowRight class="size-5" />
        </Button>
      </template>
    </div>
  </section>

  <details class="group bg-card rounded-xl border px-4">
    <summary class="flex min-h-12 items-center gap-2 text-sm font-semibold">
      <Repeat class="text-muted-foreground size-4" />Change this day's session
      <ChevronDown class="ml-auto size-4 transition-transform group-open:rotate-180" />
    </summary>
    <div class="flex flex-col gap-2 pb-4">
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        Workout
        <select
          :value="workoutId ?? ''"
          :disabled="busy"
          class="border-input bg-background focus-visible:ring-ring/50 h-11 rounded-lg border px-3 outline-none focus-visible:ring-3"
          @change="chooseWorkout"
        >
          <option value="">Rest day</option>
          <option v-for="option in workouts" :key="option.id" :value="option.id">
            {{ option.name }}
          </option>
        </select>
      </label>
      <p class="text-muted-foreground text-xs">
        Choose what you actually train; this does not change the weekly template.
      </p>
    </div>
  </details>

  <MuscleMap
    :workout-id="workoutId"
    :primary="workout?.primary ?? []"
    :supporting="workout?.supporting ?? []"
  />

  <template v-if="workout">
    <details class="group bg-coral-soft/60 rounded-xl px-4">
      <summary class="flex min-h-12 items-center gap-2 text-sm font-semibold">
        <Flame class="text-coral size-4" />Warm-up & preparation
        <ChevronDown class="ml-auto size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div class="flex flex-col gap-2 pb-4 text-sm leading-6">
        <p>{{ workout.warmup }}</p>
        <p v-if="activePhase === 'intro'">
          Use 2 working sets per exercise for the introduction. If this is substantially more than
          recent training, reduce isolation work further. Increase only when recovery is acceptable.
        </p>
      </div>
    </details>

    <section class="flex flex-col gap-3">
      <div class="flex items-baseline justify-between">
        <h3 class="text-lg font-bold tracking-tight">Exercise order</h3>
        <span class="text-muted-foreground text-xs font-medium">
          Sets ×
          {{ exercises.some((exercise) => exercise.unit === 'seconds') ? 'reps / time' : 'reps' }}
        </span>
      </div>
      <Card class="gap-0 divide-y overflow-hidden p-0">
        <details v-for="(exercise, index) in exercises" :key="exercise.id" class="group">
          <summary class="hover:bg-muted/50 flex items-center gap-3 px-4 py-3.5 transition-colors">
            <span
              class="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums"
              >{{ String(index + 1).padStart(2, '0') }}</span
            >
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-[0.95rem] leading-snug font-semibold">{{ exercise.name }}</span>
              <small class="text-muted-foreground text-xs">
                {{ exercise.restLabel }} rest · {{ exercise.targetRir
                }}{{ exercise.unit === 'seconds' ? '' : ' RIR' }}
              </small>
            </span>
            <span class="flex flex-col items-end text-right">
              <strong class="text-sm tabular-nums"
                >{{ exercise.sets }} × {{ exercise.min }}–{{ exercise.max }}</strong
              >
              <small class="text-muted-foreground text-xs"
                >{{ exercise.unit }}{{ exercise.perSide ? ' / side' : '' }}</small
              >
            </span>
          </summary>
          <div class="bg-muted/30 border-t px-4 py-4">
            <ExerciseGuide :exercise="exercise" />
          </div>
        </details>
      </Card>
    </section>
  </template>
</template>
