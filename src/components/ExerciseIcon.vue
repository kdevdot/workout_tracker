<script setup lang="ts">
import { computed } from 'vue';
import { Dumbbell } from '@lucide/vue';

const props = defineProps<{ exerciseId: string }>();
const base = import.meta.env.BASE_URL;

const illustrations: Readonly<Record<string, string>> = {
  'smith-flat-bench-press': 'bench-press',
  'one-arm-cable-pushdown': 'tricep-pushdown',
  'unica-leg-extension': 'leg-extension',
  'supine-heel-walkout': 'glute-bridge',
  'supported-single-leg-standing-db-calf-raise': 'single-leg-calf-raise',
  'dead-bug': 'dead-bug',
  'low-incline-db-bench-press': 'incline-dumbbell-press',
  'machine-pec-fly': 'pec-deck',
  'machine-reverse-fly': 'reverse-pec-deck',
  'seated-db-calf-raise': 'seated-calf-raise',
  'fixed-handle-pull-up': 'pull-up',
  'bench-supported-one-arm-db-row': 'one-arm-dumbbell-row',
  'seated-db-shoulder-press': 'seated-dumbbell-press',
  'db-lateral-raise': 'lateral-raise',
  'standing-db-curl': 'bicep-curl',
  'smith-squat': 'smith-machine-squat',
  'db-romanian-deadlift': 'dumbbell-romanian-deadlift',
  'one-db-two-hand-overhead-triceps-extension': 'dumbbell-overhead-tricep-extension',
  'smith-romanian-deadlift': 'smith-machine-romanian-deadlift',
  'db-stationary-split-squat': 'split-squat',
  'side-plank': 'side-plank',
};

const illustration = computed(() => illustrations[props.exerciseId]);
</script>

<template>
  <span
    aria-hidden="true"
    :data-exercise-icon="illustration ?? 'equipment'"
    class="flex items-center justify-center overflow-hidden rounded-lg bg-stone-100"
  >
    <img
      v-if="illustration"
      :src="`${base}exercises/${illustration}.svg`"
      alt=""
      width="56"
      height="56"
      class="size-full object-contain p-0.5 opacity-80 brightness-0"
    />
    <component v-else :is="Dumbbell" class="text-muted-foreground size-6" :stroke-width="1.5" />
  </span>
</template>
