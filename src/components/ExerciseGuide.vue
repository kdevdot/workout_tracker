<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRightLeft, ChevronDown, ExternalLink, OctagonAlert, Scale } from '@lucide/vue';
import type { Exercise } from '@/domain/programme-types';
import { guides } from '@/domain/guides';
import { demos } from '@/domain/demos';
import { canonicalExerciseId } from '@/domain/exercise-identity';
import BodyMap from './BodyMap.vue';
import ExerciseDemo from './ExerciseDemo.vue';
import ExerciseVideo from './ExerciseVideo.vue';

const props = defineProps<{ exercise: Exercise; swappable?: boolean }>();
const emit = defineEmits<{ swap: [] }>();
const guide = computed(() => guides[canonicalExerciseId(props.exercise.id)]);
const demo = computed(() => demos[canonicalExerciseId(props.exercise.id)]);
const checks = computed(() => guide.value?.checks ?? props.exercise.cues);
</script>

<template>
  <div class="flex flex-col gap-4 text-sm">
    <ExerciseDemo
      v-if="demo"
      :demo="demo"
      :exercise-id="exercise.id"
      :exercise-name="exercise.name"
    />
    <p v-else class="text-muted-foreground bg-muted rounded-lg px-3 py-2 text-xs">
      A matching quick demo is not available yet. Use the form checks or the optional detailed
      explanation below.
    </p>

    <details v-if="guide?.video" class="group/tutorial rounded-xl border border-border px-3">
      <summary class="flex min-h-11 items-center gap-2 text-xs font-semibold">
        Detailed explanation · YouTube
        <ChevronDown
          class="ml-auto size-4 shrink-0 transition-transform group-open/tutorial:rotate-180"
        />
      </summary>
      <div class="pb-3">
        <ExerciseVideo
          :video="guide.video"
          :exercise-id="exercise.id"
          :exercise-name="exercise.name"
        />
      </div>
    </details>

    <div class="grid grid-cols-[minmax(5rem,7.5rem)_minmax(0,1fr)] items-start gap-4">
      <BodyMap :primary="exercise.primary" :supporting="exercise.supporting" />
      <div class="flex flex-col gap-2">
        <h4 class="text-muted-foreground text-sm font-medium">Form check</h4>
        <ol class="flex flex-col gap-1.5">
          <li v-for="(check, index) in checks" :key="check" class="flex gap-2 leading-snug">
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

    <details v-if="guide?.comparison" class="group/compare bg-secondary/60 rounded-xl px-3">
      <summary class="flex min-h-11 items-center gap-1.5 text-xs font-bold">
        <Scale class="size-3.5 shrink-0" />Bad · Okay · Great: {{ guide.comparison.topic }}
        <ChevronDown
          class="ml-auto size-4 shrink-0 transition-transform group-open/compare:rotate-180"
        />
      </summary>
      <div class="flex flex-col gap-2 pb-3">
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
      </div>
    </details>

    <button
      v-if="swappable"
      type="button"
      class="bg-secondary hover:bg-accent focus-visible:ring-ring/60 flex min-h-12 items-center gap-3 rounded-2xl px-4 py-2.5 text-left outline-none focus-visible:ring-2"
      @click="emit('swap')"
    >
      <ArrowRightLeft class="text-primary size-4 shrink-0" />
      <span class="flex flex-col">
        <span class="text-muted-foreground text-xs">Can't do it today? Swap for this workout</span>
        <span class="font-semibold"
          >{{ exercise.alternative.name }} · {{ exercise.alternative.prescription }}</span
        >
      </span>
    </button>
    <p v-else class="text-muted-foreground flex items-start gap-1.5 text-xs">
      <ArrowRightLeft class="mt-0.5 size-3.5 shrink-0" />
      <span
        ><strong class="text-foreground font-semibold">Swap:</strong>
        {{ exercise.alternative.name }} · {{ exercise.alternative.prescription }}. Replaces the
        exercise, not extra work.</span
      >
    </p>
  </div>
</template>
