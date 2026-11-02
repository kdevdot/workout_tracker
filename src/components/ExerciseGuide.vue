<script setup lang="ts">
import type { Exercise } from '@/domain/programme-types';
defineProps<{ exercise: Exercise }>();
</script>

<template>
  <div class="flex flex-col gap-3 text-sm leading-6">
    <dl class="grid grid-cols-2 gap-3">
      <div>
        <dt class="text-muted-foreground text-xs font-semibold uppercase">Equipment</dt>
        <dd>{{ exercise.equipment }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground text-xs font-semibold uppercase">Targets</dt>
        <dd>{{ exercise.primary.join(' · ') }}</dd>
      </div>
    </dl>
    <ul class="marker:text-coral list-disc space-y-1.5 pl-5">
      <li v-for="cue in exercise.cues" :key="cue">{{ cue }}</li>
    </ul>
    <div class="bg-muted rounded-lg p-3">
      <p class="font-semibold">
        Alternative · {{ exercise.alternative.name }}
        <span class="text-muted-foreground font-normal">{{
          exercise.alternative.prescription
        }}</span>
      </p>
      <p class="text-muted-foreground mt-1">{{ exercise.alternative.note }}</p>
    </div>
    <p class="text-muted-foreground text-xs leading-5">
      An alternative replaces the original exercise; do not add it as extra work or log its loads
      under this exercise. No video yet: movement coverage and reuse permissions are still being
      audited.
    </p>
  </div>
</template>
