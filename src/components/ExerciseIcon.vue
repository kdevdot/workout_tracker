<script setup lang="ts">
import { computed } from 'vue';
import { Dumbbell } from '@lucide/vue';
import { guides } from '@/domain/guides';
import { canonicalExerciseId } from '@/domain/exercise-identity';

const props = defineProps<{ exerciseId: string }>();
const base = import.meta.env.BASE_URL;

const illustration = computed(() => guides[canonicalExerciseId(props.exerciseId)]?.illustration);
</script>

<template>
  <span
    aria-hidden="true"
    :data-exercise-icon="illustration ?? 'equipment'"
    class="flex items-center justify-center overflow-hidden rounded-lg bg-secondary"
  >
    <img
      v-if="illustration"
      :src="`${base}exercises/${illustration}.svg`"
      alt=""
      width="56"
      height="56"
      class="size-full object-contain p-0.5 opacity-90 brightness-0 invert"
    />
    <component :is="Dumbbell" v-else class="text-muted-foreground size-6" :stroke-width="1.5" />
  </span>
</template>
