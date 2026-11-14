<script setup lang="ts">
import { ChevronDown } from '@lucide/vue';
import type { Exercise } from '@/domain/programme-types';
import { restFor } from '@/domain/sessions';
import ExerciseGuide from '@/components/ExerciseGuide.vue';
import ExerciseIcon from '@/components/ExerciseIcon.vue';

defineProps<{ exercises: Exercise[]; restMinutes: number | null; swappableIds: Set<string> }>();
const emit = defineEmits<{ swap: [exerciseId: string] }>();
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-end justify-between gap-2">
      <h3 class="section-heading">Exercise order</h3>
      <span class="text-muted-foreground text-xs"
        >Sets ×
        {{
          exercises.some((exercise) => exercise.unit === 'seconds') ? 'reps / time' : 'reps'
        }}</span
      >
    </div>
    <div class="exercise-list">
      <details v-for="exercise in exercises" :key="exercise.id" class="group/exercise">
        <summary class="exercise-row">
          <ExerciseIcon :exercise-id="exercise.id" class="size-11 shrink-0" />
          <span class="flex min-w-0 flex-1 flex-col gap-1.5">
            <span class="text-sm leading-snug font-semibold">{{ exercise.name }}</span>
            <small class="text-muted-foreground text-xs leading-relaxed"
              >{{ restFor(exercise, restMinutes).label }} rest · {{ exercise.targetRir
              }}{{ exercise.unit === 'seconds' ? '' : ' RIR' }}</small
            >
          </span>
          <span class="flex shrink-0 flex-col items-end gap-1 text-right">
            <strong class="font-display text-lg leading-none font-semibold tabular-nums"
              >{{ exercise.sets }} × {{ exercise.min }}–{{ exercise.max }}</strong
            >
            <small
              v-if="exercise.perSide || exercise.unit !== 'reps'"
              class="text-muted-foreground text-xs"
              >{{ exercise.unit }}{{ exercise.perSide ? ' / side' : '' }}</small
            >
            <ChevronDown
              class="text-muted-foreground size-3.5 transition-transform group-open/exercise:rotate-180"
            />
          </span>
        </summary>
        <div class="border-t pt-4">
          <ExerciseGuide
            :exercise="exercise"
            :swappable="swappableIds.has(exercise.id)"
            @swap="emit('swap', exercise.id)"
          />
        </div>
      </details>
    </div>
    <p class="text-muted-foreground text-xs leading-5">
      Tap an exercise for its demonstration, setup and form checks.
    </p>
  </section>
</template>
