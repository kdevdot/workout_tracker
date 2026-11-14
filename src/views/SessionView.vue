<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { ArrowLeft, ChevronLeft, ChevronRight } from '@lucide/vue';
import { formatDate } from '@/domain/dates';
import { workouts } from '@/domain/programme';
import { isExerciseComplete, sessionProgress } from '@/domain/sessions';
import type { Session, SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
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
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <Button variant="ghost" class="-ml-3" @click="emit('back')"><ArrowLeft />Back to plan</Button>
      <span class="text-muted-foreground text-xs font-medium">
        {{ formatDate(session.date, { weekday: 'short', day: 'numeric', month: 'short' }) }} ·
        {{ workouts[session.workoutId].name }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex items-baseline justify-between">
        <span class="eyebrow">Workout progress</span>
        <span class="text-sm font-bold whitespace-nowrap tabular-nums"
          >{{ progress.done }}/{{ progress.total }} exercises done</span
        >
      </div>
      <ExerciseProgress
        :exercises="session.exercises"
        :selected="selected"
        @select="selected = $event"
      />
    </div>
  </div>

  <SessionExercise
    :key="entry.exercise.id"
    :entry="entry"
    :session="session"
    :history="history"
    :rest-minutes="restMinutes"
    :busy="busy"
    :position="selected + 1"
    :total="session.exercises.length"
    @record="(exerciseId, log) => emit('record', exerciseId, log)"
    @swap="emit('swap', $event)"
  />

  <div class="grid grid-cols-2 gap-2">
    <Button variant="outline" size="lg" :disabled="selected === 0" @click="selected--"
      ><ChevronLeft />Previous</Button
    >
    <Button
      variant="outline"
      size="lg"
      :disabled="selected === session.exercises.length - 1"
      @click="selected++"
      >Next exercise<ChevronRight
    /></Button>
  </div>

  <section class="flex flex-col gap-3 border-t pt-5">
    <Button
      variant="outline"
      size="lg"
      class="border-primary/40 text-primary rounded-2xl bg-transparent"
      :disabled="busy || !session.exercises.some((item) => item.logs.length)"
      @click="confirmingFinish = !confirmingFinish"
    >
      Finish workout
    </Button>
    <div
      v-if="confirmingFinish"
      class="bg-card pop-in flex flex-col gap-3 rounded-[20px] p-4 shadow-(--panel-shadow)"
    >
      <p class="text-sm leading-6">
        {{ progress.done }} of {{ progress.total }} exercises done.
        {{
          progress.done < progress.total
            ? 'This will be recorded as a partial workout, not full completion.'
            : 'Ready to complete this session?'
        }}
      </p>
      <Button size="lg" :disabled="busy" @click="emit('finish')">Confirm finish</Button>
      <Button variant="ghost" @click="confirmingFinish = false">Keep training</Button>
    </div>
  </section>

  <!-- Room to scroll the form above the floating timer. -->
  <div v-if="timerVisible" class="h-14 shrink-0" aria-hidden="true" />
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
