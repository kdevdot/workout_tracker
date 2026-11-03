<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Pencil,
} from '@lucide/vue';
import { formatDate } from '@/domain/dates';
import { workouts } from '@/domain/programme';
import { formatLoad, formatSet, previousPerformance, sessionProgress } from '@/domain/sessions';
import type { Session, SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import ExerciseGuide from './ExerciseGuide.vue';
import RestTimer from './RestTimer.vue';
import SetForm from './SetForm.vue';

const props = defineProps<{
  session: Session;
  history: Session[];
  busy: boolean;
  timerDisplay: string;
  timerDone: boolean;
  timerVisible: boolean;
}>();
const emit = defineEmits<{
  back: [];
  record: [exerciseId: string, log: SetLog];
  finish: [];
  stopTimer: [];
}>();

const selected = shallowRef(0);
const editing = shallowRef<SetLog | null>(null);
const confirmingFinish = shallowRef(false);
const entry = computed(() => props.session.exercises[selected.value]!);
const exercise = computed(() => entry.value.exercise);
const progress = computed(() => sessionProgress(props.session));
const previous = computed(() =>
  previousPerformance(props.history, props.session, exercise.value.id),
);
const nextIndex = computed(() => {
  if (editing.value) return editing.value.index;
  for (let index = 1; index <= exercise.value.sets; index++)
    if (!entry.value.logs.some((log) => log.index === index)) return index;
  return null;
});
const loadHint = computed(
  () =>
    ({
      smith: 'Total added plates, both sides; excludes the Smith bar.',
      dumbbell: 'Kilograms per dumbbell. If one DB is used, record that one DB.',
      cable: 'Record the selected stack setting in kg; pulley ratios vary.',
      machine: 'Record the selected machine setting in kg; confirm setup first.',
      bodyweight: 'Bodyweight movement: no external load required.',
    })[exercise.value.loadKind],
);
const stats = computed(() => [
  {
    value: `${exercise.value.min}–${exercise.value.max}`,
    label: `${exercise.value.unit}${exercise.value.perSide ? '/side' : ''}`,
  },
  {
    value: exercise.value.targetRir,
    label: exercise.value.unit === 'seconds' ? 'form reserve' : 'target RIR',
  },
  { value: exercise.value.restLabel, label: 'rest' },
]);

// A saved set (new or corrected) or a different exercise ends any correction in progress.
watch([selected, () => JSON.stringify(entry.value.logs)], () => {
  editing.value = null;
});
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
    <div class="flex items-center gap-3">
      <Progress :model-value="(progress.done / progress.total) * 100" class="h-2.5" />
      <span class="text-sm font-bold whitespace-nowrap tabular-nums"
        >{{ progress.done }}/{{ progress.total }} sets saved</span
      >
    </div>
  </div>

  <nav aria-label="Exercises" class="flex snap-x gap-2 overflow-x-auto pb-1">
    <button
      v-for="(item, index) in session.exercises"
      :key="item.exercise.id"
      :aria-pressed="selected === index"
      :aria-label="`${index + 1}. ${item.exercise.name}, ${item.logs.length} of ${item.exercise.sets} sets`"
      :class="
        cn(
          'flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
          'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
          selected === index
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card hover:bg-muted',
        )
      "
      @click="selected = index"
    >
      <Check v-if="item.logs.length >= item.exercise.sets" class="size-3.5" />
      <span v-else class="tabular-nums">{{ index + 1 }}</span>
      <span class="max-w-32 truncate">{{ item.exercise.name }}</span>
    </button>
  </nav>

  <section class="flex flex-col gap-2">
    <h1 class="page-heading">{{ exercise.name }}</h1>
    <p class="text-muted-foreground text-sm leading-6">
      {{ loadHint
      }}{{ exercise.perSide ? ' Complete both sides for one set; match clean reps.' : '' }}
    </p>
  </section>

  <dl class="grid grid-cols-3 gap-2">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex flex-col-reverse items-center gap-1 border-y px-2 py-4 text-center"
    >
      <dt class="text-muted-foreground text-xs">{{ stat.label }}</dt>
      <dd class="font-display text-3xl leading-none font-semibold tabular-nums">
        {{ stat.value }}
      </dd>
    </div>
  </dl>

  <section class="bg-secondary/60 flex gap-3 rounded-xl p-4">
    <History class="text-primary mt-0.5 size-4 shrink-0" />
    <div class="flex flex-col gap-0.5 text-sm">
      <h3 class="font-semibold">Previous session</h3>
      <p v-if="previous" class="text-secondary-foreground">
        {{ formatDate(previous.date, { day: 'numeric', month: 'short' }) }} ·
        {{ previous.logs.map((log) => `${formatLoad(log)} × ${log.reps}`).join(' · ') }}
      </p>
      <p v-else class="text-muted-foreground">No previous completed entries for this movement.</p>
    </div>
  </section>

  <ul v-if="entry.logs.length" class="flex flex-col gap-2">
    <li
      v-for="log in entry.logs"
      :key="log.index"
      class="bg-card flex items-center gap-3 rounded-xl border py-2 pr-2 pl-3 text-sm"
    >
      <span
        class="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        >{{ log.index }}</span
      >
      <span class="flex-1 tabular-nums">{{ formatSet(log, exercise) }}</span>
      <Button
        variant="ghost"
        size="sm"
        :disabled="busy"
        :aria-label="`Edit set ${log.index}`"
        @click="editing = log"
        ><Pencil />Edit</Button
      >
    </li>
  </ul>

  <SetForm
    v-if="nextIndex !== null"
    :key="`${exercise.id}:${nextIndex}:${entry.logs.length}:${editing?.index ?? 'new'}`"
    :exercise="exercise"
    :index="nextIndex"
    :initial="editing"
    :busy="busy"
    @submit="emit('record', exercise.id, $event)"
    @cancel="editing = null"
  />
  <p
    v-else
    class="bg-secondary text-secondary-foreground flex items-center gap-2 rounded-xl p-4 text-sm font-semibold"
  >
    <Check class="size-4" />All planned sets for this exercise are saved.
  </p>

  <details class="group bg-card rounded-xl border px-4">
    <summary class="flex min-h-12 items-center text-sm font-semibold">
      How to do it · video & form check
      <ChevronDown class="ml-auto size-4 transition-transform group-open:rotate-180" />
    </summary>
    <div class="pb-4"><ExerciseGuide :exercise="exercise" /></div>
  </details>

  <p class="text-muted-foreground text-xs leading-5">
    RIR = clean repetitions you could still perform. Record actual results, not just the target.
    Walkout reps are complete out-and-back cycles.
  </p>

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
      variant="secondary"
      size="lg"
      :disabled="busy || !progress.done"
      @click="confirmingFinish = !confirmingFinish"
    >
      Finish workout
    </Button>
    <div v-if="confirmingFinish" class="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <p class="text-sm leading-6">
        {{ progress.done }} of {{ progress.total }} sets saved.
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

  <RestTimer
    v-if="timerVisible"
    :display="timerDisplay"
    :done="timerDone"
    :busy="busy"
    @dismiss="emit('stopTimer')"
  />
</template>
