<script setup lang="ts">
import type { Session } from '@/domain/state';
import { isExerciseComplete } from '@/domain/sessions';

defineProps<{ exercises: Session['exercises']; selected?: number }>();
const emit = defineEmits<{ select: [index: number] }>();
</script>

<template>
  <nav v-if="selected !== undefined" aria-label="Exercises" class="step-bar">
    <button
      v-for="(item, index) in exercises"
      :key="item.exercise.id"
      type="button"
      :aria-current="selected === index ? 'step' : undefined"
      :aria-label="`${index + 1}. ${item.exercise.name}, ${item.logs.length} of ${item.exercise.sets} sets`"
      :class="{ 'is-current': selected === index, 'is-done': isExerciseComplete(item) }"
      @click="emit('select', index)"
    >
      <span />
    </button>
  </nav>
  <div v-else class="segments" aria-hidden="true">
    <span v-for="item in exercises" :key="item.exercise.id">
      <i :style="{ transform: `scaleX(${isExerciseComplete(item) ? 1 : 0})` }" />
    </span>
  </div>
</template>
