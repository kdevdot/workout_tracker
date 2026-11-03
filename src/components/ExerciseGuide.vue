<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRightLeft, ExternalLink, OctagonAlert, Scale } from '@lucide/vue';
import type { Exercise } from '@/domain/programme-types';
import { guides } from '@/domain/guides';
import BodyMap from './BodyMap.vue';
import ExerciseVideo from './ExerciseVideo.vue';

const props = defineProps<{ exercise: Exercise }>();
const guide = computed(() => guides[props.exercise.id]);
</script>

<template>
  <div class="flex flex-col gap-4 text-sm">
    <ExerciseVideo v-if="guide?.video" :video="guide.video" :exercise-name="exercise.name" />
    <p v-else class="text-muted-foreground bg-muted rounded-lg px-3 py-2 text-xs">
      No matching demonstration has been selected for this movement yet.
    </p>

    <div class="grid grid-cols-[7.5rem_1fr] items-start gap-4">
      <BodyMap :primary="exercise.primary" :supporting="exercise.supporting" />
      <div class="flex flex-col gap-2">
        <h4 class="text-muted-foreground text-xs font-semibold uppercase">Form check</h4>
        <ol v-if="guide" class="flex flex-col gap-1.5">
          <li v-for="(check, index) in guide.checks" :key="check" class="flex gap-2 leading-snug">
            <span
              class="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              >{{ index + 1 }}</span
            >{{ check }}
          </li>
        </ol>
      </div>
    </div>

    <ul v-if="guide" class="flex flex-col gap-1">
      <li
        v-for="item in guide.stop"
        :key="item"
        class="text-destructive flex items-start gap-1.5 text-xs font-medium"
      >
        <OctagonAlert class="mt-0.5 size-3.5 shrink-0" />{{ item }}
      </li>
    </ul>

    <section
      v-if="guide?.comparison"
      class="bg-secondary/60 flex flex-col gap-2 rounded-xl p-3"
      :aria-label="`Technique comparison: ${guide.comparison.topic}`"
    >
      <h4 class="flex items-center gap-1.5 text-xs font-bold uppercase">
        <Scale class="size-3.5" />Bad · Okay · Great: {{ guide.comparison.topic }}
      </h4>
      <p class="text-xs">
        <span class="text-muted-foreground">Creator's ranking:</span>
        {{ guide.comparison.ranking }}
      </p>
      <p class="leading-snug"><strong>Evidence:</strong> {{ guide.comparison.verdict }}</p>
      <p class="leading-snug"><strong>For you:</strong> {{ guide.comparison.forYou }}</p>
      <a
        :href="guide.comparison.reel"
        target="_blank"
        rel="noopener"
        class="text-primary flex w-fit items-center gap-1 text-xs font-semibold underline underline-offset-2"
        >Watch the reel<ExternalLink class="size-3"
      /></a>
    </section>

    <p class="text-muted-foreground flex items-start gap-1.5 text-xs">
      <ArrowRightLeft class="mt-0.5 size-3.5 shrink-0" />
      <span
        ><strong class="text-foreground font-semibold">Swap:</strong>
        {{ exercise.alternative.name }} · {{ exercise.alternative.prescription }}. Replaces the
        exercise, not extra work.</span
      >
    </p>
  </div>
</template>
