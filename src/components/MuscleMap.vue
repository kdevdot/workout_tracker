<script setup lang="ts">
import type { WorkoutId } from '@/domain/programme-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
defineProps<{ workoutId: WorkoutId | null; primary: string[]; supporting: string[] }>();
const base = import.meta.env.BASE_URL;
</script>

<template>
  <Card class="gap-4 py-5" role="region" aria-labelledby="muscle-heading">
    <CardHeader class="flex items-center justify-between px-5">
      <CardTitle id="muscle-heading">Muscle focus</CardTitle>
      <div class="text-muted-foreground flex gap-3 text-xs font-medium">
        <span class="flex items-center gap-1.5"
          ><i class="bg-coral size-2 rounded-full" />Primary</span
        >
        <span class="flex items-center gap-1.5"
          ><i class="bg-primary/60 size-2 rounded-full" />Supporting</span
        >
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-3 px-5">
      <figure class="bg-muted/60 rounded-xl p-2">
        <img
          :src="`${base}muscles/${workoutId ?? 'rest'}.png`"
          :alt="
            workoutId
              ? `Front and back target regions: ${primary.join(', ')}`
              : 'Neutral front and back body diagrams; no lifting scheduled'
          "
          width="600"
          height="620"
          class="mx-auto h-auto w-full max-w-xs"
        />
        <figcaption
          class="text-muted-foreground grid grid-cols-2 text-center text-xs font-semibold uppercase"
        >
          <span>Front</span><span>Back</span>
        </figcaption>
      </figure>
      <div v-if="primary.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="muscle in primary"
          :key="muscle"
          class="bg-coral-soft rounded-full px-2.5 py-1 text-xs font-semibold"
          >{{ muscle }}</span
        >
        <span
          v-for="muscle in supporting"
          :key="muscle"
          class="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-medium"
          >{{ muscle }}</span
        >
      </div>
      <p v-else class="text-sm">Rest from lifting. Daily supplement tracking is still available.</p>
      <p class="text-muted-foreground text-xs leading-5">
        Schematic regions, not activation, intensity, or recovery scores. Shoulder heads and back
        muscles are grouped.
      </p>
    </CardContent>
  </Card>
</template>
