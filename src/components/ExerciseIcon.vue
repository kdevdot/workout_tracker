<script setup lang="ts">
import { computed } from 'vue';
import { Activity, Armchair, Cable, Dumbbell, Footprints } from '@lucide/vue';

const props = defineProps<{ exerciseId: string }>();
const base = import.meta.env.BASE_URL;

const illustrations: Readonly<Record<string, string>> = {
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

const equipmentIcons = {
  'smith-flat-bench-press': Dumbbell,
  'one-arm-cable-pushdown': Cable,
  'unica-leg-extension': Armchair,
  'supine-heel-walkout': Footprints,
  'supported-single-leg-standing-db-calf-raise': Footprints,
  'dead-bug': Activity,
  'low-incline-db-bench-press': Dumbbell,
  'machine-pec-fly': Armchair,
  'machine-reverse-fly': Armchair,
  'seated-db-calf-raise': Footprints,
};

const illustration = computed(() => illustrations[props.exerciseId]);
const equipmentIcon = computed(
  () => equipmentIcons[props.exerciseId as keyof typeof equipmentIcons] ?? Dumbbell,
);
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
    <component
      v-else
      :is="equipmentIcon"
      class="text-muted-foreground size-6"
      :stroke-width="1.5"
    />
  </span>
</template>
