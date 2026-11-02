<script setup lang="ts">
import type { WorkoutId } from '../domain/programme-types';
defineProps<{ workoutId: WorkoutId | null; primary: string[]; supporting: string[] }>();
const base = import.meta.env.BASE_URL;
</script>

<template>
  <section class="muscle-section" aria-labelledby="muscle-heading">
    <div class="section-heading">
      <h3 id="muscle-heading">Muscle focus</h3>
      <div class="legend">
        <span><i />Primary</span><span><i class="support" />Supporting</span>
      </div>
    </div>
    <div class="muscle-layout">
      <figure>
        <img
          :src="`${base}muscles/${workoutId ?? 'rest'}.png`"
          :alt="
            workoutId
              ? `Front and back target regions: ${primary.join(', ')}`
              : 'Neutral front and back body diagrams; no lifting scheduled'
          "
          width="600"
          height="620"
        />
        <figcaption><span>Front</span><span>Back</span></figcaption>
      </figure>
      <div class="target-regions">
        <p>{{ primary.length ? primary.join(' · ') : 'Rest from lifting.' }}</p>
        <small>{{
          supporting.length
            ? `Supporting: ${supporting.join(', ')}.`
            : 'Daily supplement tracking is still available.'
        }}</small>
      </div>
    </div>
    <p class="fine-print">
      Schematic regions—not activation, intensity, or recovery scores. Shoulder heads and back
      muscles are grouped.
    </p>
  </section>
</template>
