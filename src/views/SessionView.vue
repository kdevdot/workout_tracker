<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef } from 'vue';
import { ArrowLeft, ChevronLeft, ChevronRight } from '@lucide/vue';
import { formatDate } from '@/domain/dates';
import { workouts } from '@/domain/programme';
import { isExerciseComplete, sessionProgress } from '@/domain/sessions';
import type { Session, SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'reka-ui';
import RestTimer from '@/components/session/RestTimer.vue';
import SessionExercise from '@/components/session/SessionExercise.vue';
import ExerciseProgress from '@/components/session/ExerciseProgress.vue';

const props = defineProps<{
  session: Session;
  history: Session[];
  restMinutes: number | null;
  busy: boolean;
  timerDisplay: string;
  timerDone: boolean;
  timerVisible: boolean;
  timerFraction: number;
}>();
const emit = defineEmits<{
  back: [];
  record: [exerciseId: string, log: SetLog];
  swap: [exerciseId: string];
  finish: [];
  stopTimer: [];
  adjustTimer: [seconds: number];
}>();

// Resume at the first unfinished exercise; progress is shared with Plan and History.
const firstOpen = props.session.exercises.findIndex((item) => !isExerciseComplete(item));
const selected = shallowRef(firstOpen === -1 ? props.session.exercises.length - 1 : firstOpen);
const confirmingFinish = shallowRef(false);
const entry = computed(() => props.session.exercises[selected.value]!);
const progress = computed(() => sessionProgress(props.session));
const exerciseContent = useTemplateRef<HTMLElement>('exerciseContent');

async function selectExercise(index: number) {
  if (index === selected.value) return;
  selected.value = index;
  await nextTick();
  exerciseContent.value?.scrollIntoView?.({ block: 'start' });
  exerciseContent.value?.focus({ preventScroll: true });
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <Button variant="ghost" class="-ml-[12px]" @click="emit('back')"
        ><ArrowLeft />Back to plan</Button
      >
      <span class="text-muted-foreground text-right text-xs">
        {{ formatDate(session.date, { weekday: 'short', day: 'numeric', month: 'short' }) }} ·
        {{ workouts[session.workoutId].name }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span class="text-muted-foreground text-xs"
          >Exercise {{ selected + 1 }} of {{ session.exercises.length }}</span
        >
        <span class="text-xs font-medium whitespace-nowrap tabular-nums"
          >{{ progress.done }}/{{ progress.total }} exercises done</span
        >
      </div>
      <ExerciseProgress
        :exercises="session.exercises"
        :selected="selected"
        @select="selectExercise"
      />
    </div>
  </div>

  <section
    ref="exerciseContent"
    class="outline-none"
    aria-labelledby="active-exercise-title"
    tabindex="-1"
  >
    <SessionExercise
      :key="entry.exercise.id"
      :entry="entry"
      :session="session"
      :history="history"
      :rest-minutes="restMinutes"
      :busy="busy"
      @record="(exerciseId, log) => emit('record', exerciseId, log)"
      @swap="emit('swap', $event)"
    >
      <template #rest-timer>
        <RestTimer
          v-if="timerVisible"
          :display="timerDisplay"
          :done="timerDone"
          :busy="busy"
          :fraction="timerFraction"
          @dismiss="emit('stopTimer')"
          @adjust="emit('adjustTimer', $event)"
        />
      </template>
      <template #navigation>
        <nav class="grid grid-cols-2 gap-2" aria-label="Exercise navigation">
          <Button variant="outline" :disabled="selected === 0" @click="selectExercise(selected - 1)"
            ><ChevronLeft />Previous</Button
          >
          <Button
            variant="outline"
            :disabled="selected === session.exercises.length - 1"
            @click="selectExercise(selected + 1)"
            >Next exercise<ChevronRight
          /></Button>
        </nav>
      </template>
    </SessionExercise>
  </section>

  <section class="flex flex-col gap-3 border-t pt-5">
    <Button
      variant="outline"
      size="lg"
      class="border-primary/40 text-primary rounded-2xl bg-transparent"
      :disabled="busy || !session.exercises.some((item) => item.logs.length)"
      @click="confirmingFinish = true"
    >
      Finish workout
    </Button>
  </section>

  <DialogRoot v-model:open="confirmingFinish">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]" />
      <DialogContent
        class="bg-card surface-edge fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-2xl p-5 shadow-2xl outline-none"
      >
        <DialogTitle class="text-lg font-semibold">Finish this workout?</DialogTitle>
        <DialogDescription class="text-muted-foreground text-sm leading-6">
          {{ progress.done }} of {{ progress.total }} exercises done.
          {{
            progress.done < progress.total
              ? 'This will be saved as a partial workout.'
              : 'Your session will be marked complete.'
          }}
        </DialogDescription>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" :disabled="busy" @click="confirmingFinish = false">
            Keep training
          </Button>
          <Button size="lg" :disabled="busy" @click="emit('finish')">Finish workout</Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
