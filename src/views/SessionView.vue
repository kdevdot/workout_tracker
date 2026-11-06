<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue';
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
import {
  formatSet,
  previousPerformance,
  restFor,
  sessionProgress,
  shortSet,
} from '@/domain/sessions';
import type { Session, SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import ExerciseGuide from '@/components/ExerciseGuide.vue';
import RestTimer from '@/components/RestTimer.vue';
import SetForm from '@/components/SetForm.vue';

const props = defineProps<{
  session: Session;
  history: Session[];
  restMinutes: number | null;
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
// Start a new set from this session's last set, or the same set last time.
const defaults = computed(
  () =>
    entry.value.logs.at(-1) ??
    previous.value?.logs.find((log) => log.index === nextIndex.value) ??
    null,
);
const previousSummary = computed(() => previous.value?.logs.map(shortSet).join(' · '));
const chips = computed(() =>
  props.session.exercises.map((item) => ({
    item,
    finished: item.logs.length >= item.exercise.sets,
  })),
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
      bodyweight: 'Bodyweight: no load to log.',
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
  { value: restFor(exercise.value, props.restMinutes).label, label: 'rest' },
]);

const chipButtons = useTemplateRef<HTMLButtonElement[]>('chipButtons');
function centreActive(behavior: ScrollBehavior) {
  chipButtons.value?.[selected.value]?.scrollIntoView?.({
    inline: 'center',
    block: 'nearest',
    behavior,
  });
}
onMounted(() => centreActive('instant'));
watch(selected, () => nextTick(() => centreActive('smooth')));

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

  <nav aria-label="Exercises" class="-mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-1">
    <button
      v-for="({ item, finished }, index) in chips"
      ref="chipButtons"
      :key="item.exercise.id"
      :aria-pressed="selected === index"
      :aria-label="`${index + 1}. ${item.exercise.name}, ${item.logs.length} of ${item.exercise.sets} sets`"
      :class="
        cn(
          'flex min-h-11 shrink-0 snap-center items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors',
          'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
          selected === index
            ? 'bg-primary text-primary-foreground border-primary'
            : finished
              ? 'border-success/40 bg-success-soft hover:bg-success-soft/70'
              : 'bg-card hover:bg-muted',
        )
      "
      @click="selected = index"
    >
      <span
        v-if="finished"
        class="bg-success flex size-4 items-center justify-center rounded-full text-white"
        ><Check class="size-3 stroke-3"
      /></span>
      <span v-else class="tabular-nums">{{ index + 1 }}</span>
      <span>{{ item.exercise.name }}</span>
    </button>
  </nav>

  <section class="flex flex-col gap-2">
    <h1 class="page-heading">{{ exercise.name }}</h1>
    <p class="text-muted-foreground text-sm leading-6">
      {{ loadHint
      }}{{ exercise.perSide ? ' One set = left and right. Log each side; aim to match them.' : '' }}
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
        {{ previousSummary }}
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
    :defaults="defaults"
    :busy="busy"
    @submit="emit('record', exercise.id, $event)"
    @cancel="editing = null"
  />
  <p
    v-else
    class="bg-success-soft text-success flex items-center gap-2 rounded-xl p-4 text-sm font-semibold"
  >
    <Check class="size-4 stroke-3" />All planned sets for this exercise are saved.
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
      variant="outline"
      size="lg"
      class="border-primary/40 text-primary"
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

  <!-- Room to scroll the form above the floating timer. -->
  <div v-if="timerVisible" class="h-14 shrink-0" aria-hidden="true" />
  <RestTimer
    v-if="timerVisible"
    :display="timerDisplay"
    :done="timerDone"
    :busy="busy"
    @dismiss="emit('stopTimer')"
  />
</template>
