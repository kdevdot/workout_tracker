<script setup lang="ts">
import type { Exercise } from '../domain/programme-types';
defineProps<{ exercise: Exercise }>();
</script>

<template>
  <div class="exercise-guide">
    <p><strong>Equipment</strong><br />{{ exercise.equipment }}</p>
    <p><strong>Targets</strong><br />{{ exercise.primary.join(' · ') }}</p>
    <ul>
      <li v-for="cue in exercise.cues" :key="cue">{{ cue }}</li>
    </ul>
    <p>
      <strong>Available alternative</strong><br />{{ exercise.alternative.name }} ·
      {{ exercise.alternative.prescription }}<br />{{ exercise.alternative.note }}
    </p>
    <p class="fine-print">
      An alternative replaces the original exercise; do not add it as extra work. This milestone
      logs the listed movement only. Do not enter an alternative's loads under a different exercise
      name.
    </p>
    <p class="fine-print">
      No video yet: exact movement coverage and reuse permissions are still being audited.
    </p>
  </div>
</template>
