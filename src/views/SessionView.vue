<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue';
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Pencil,
  TrendingUp,
} from '@lucide/vue';
import { formatDate } from '@/domain/dates';
import { workouts } from '@/domain/programme';
import {
  formatSet,
  nextTarget,
  previousPerformance,
  restFor,
  sessionProgress,
  shortSet,
} from '@/domain/sessions';
import type { Session, SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
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

// Resume at the first exercise with sets left, or the last one when all are done.
const firstOpen = props.session.exercises.findIndex(
  (item) => item.logs.length < item.exercise.sets,
);
const selected = shallowRef(firstOpen === -1 ? props.session.exercises.length - 1 : firstOpen);
const editing = shallowRef<SetLog | null>(null);
const confirmingFinish = shallowRef(false);
const entry = computed(() => props.session.exercises[selected.value]!);
const exercise = computed(() => entry.value.exercise);
const progress = computed(() => sessionProgress(props.session));
const swapped = computed(() => exercise.value.id.endsWith('~alt'));
const previous = computed(() =>
  previousPerformance(props.history, props.session, exercise.value.id),
);
const target = computed(() => nextTarget(props.history, props.session, exercise.value));
// Start a new set from this session's last set, or the same set last time (at the new load).
const defaults = computed(() => {
  if (entry.value.logs.length) return entry.value.logs.at(-1)!;
  const last = previous.value?.logs.find((log) => log.index === nextIndex.value);
  return last && target.value?.load ? { ...last, load: target.value.load } : (last ?? null);
});
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
      barbell: 'Total weight: bar plus plates on both sides.',
      smith: 'Total added plates, both sides; excludes the Smith bar.',
      dumbbell: 'Kilograms per dumbbell. If one DB is used, record that one DB.',
      cable: 'Record the selected stack setting in kg; pulley ratios vary.',
      machine: 'Record the selected stack setting in kg.',
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
    <div class="flex flex-col gap-2">
      <div class="flex items-baseline justify-between">
        <span class="eyebrow">Workout progress</span>
        <span class="text-sm font-bold whitespace-nowrap tabular-nums"
          >{{ progress.done }}/{{ progress.total }} exercises done</span
        >
      </div>
      <div class="segments" aria-hidden="true">
        <span
          v-for="(item, index) in session.exercises"
          :key="item.exercise.id"
          :class="{ 'is-current': index === selected }"
          ><i
            :style="{ transform: `scaleX(${Math.min(1, item.logs.length / item.exercise.sets)})` }"
        /></span>
      </div>
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
          'flex min-h-11 shrink-0 snap-center items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-300',
          'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
          selected === index
            ? 'bg-primary text-primary-foreground border-primary shadow-[0_6px_20px_-6px_#d4f53c99]'
            : finished
              ? 'border-success/30 bg-success-soft text-success hover:bg-success-soft/70'
              : 'bg-card text-secondary-foreground hover:bg-secondary',
        )
      "
      @click="selected = index"
    >
      <span
        v-if="finished"
        :class="
          cn(
            'flex size-4 items-center justify-center rounded-full',
            selected === index
              ? 'bg-primary-foreground text-primary'
              : 'bg-success text-primary-foreground',
          )
        "
        ><Check class="size-3 stroke-3"
      /></span>
      <span v-else class="tabular-nums">{{ index + 1 }}</span>
      <span>{{ item.exercise.name }}</span>
    </button>
  </nav>

  <section :key="exercise.id" class="screen-enter flex flex-col gap-2">
    <span class="eyebrow">Exercise {{ selected + 1 }} of {{ session.exercises.length }}</span>
    <h1 class="page-heading">{{ exercise.name }}</h1>
    <p class="text-muted-foreground text-sm leading-6">
      {{ loadHint
      }}{{ exercise.perSide ? ' One set = left and right. Log each side; aim to match them.' : '' }}
    </p>
  </section>

  <button
    v-if="!entry.logs.length"
    type="button"
    :disabled="busy"
    :class="
      cn(
        'flex min-h-12 items-center gap-3 rounded-[18px] px-4 py-2.5 text-left text-sm ring-1 transition-colors',
        'focus-visible:ring-ring/60 outline-none focus-visible:ring-2 disabled:opacity-50',
        swapped ? 'bg-coral-soft ring-coral/30' : 'bg-card ring-white/5 hover:bg-secondary',
      )
    "
    @click="emit('swap', exercise.id)"
  >
    <ArrowRightLeft :class="cn('size-4 shrink-0', swapped ? 'text-coral' : 'text-primary')" />
    <span class="flex flex-col">
      <span class="text-muted-foreground text-xs">{{
        swapped ? 'Swapped for this workout' : "Can't do it today?"
      }}</span>
      <span class="font-semibold"
        >{{ swapped ? 'Back to' : 'Swap to' }} {{ exercise.alternative.name }}</span
      >
    </span>
  </button>

  <dl class="grid grid-cols-3 gap-2">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="stat-tile flex flex-col-reverse items-center gap-1.5 px-2 py-4 text-center"
    >
      <dt class="eyebrow">{{ stat.label }}</dt>
      <dd class="font-display condensed text-[32px] leading-none font-bold tabular-nums">
        {{ stat.value }}
      </dd>
    </div>
  </dl>

  <section class="bg-card flex gap-3 rounded-[18px] p-4 shadow-(--panel-shadow)">
    <History class="text-muted-foreground mt-0.5 size-4 shrink-0" />
    <div class="flex flex-col gap-0.5 text-sm">
      <h3 class="font-semibold">Previous session</h3>
      <p v-if="previous" class="text-secondary-foreground">
        {{ formatDate(previous.date, { day: 'numeric', month: 'short' }) }} ·
        {{ previousSummary }}
      </p>
      <p v-else class="text-muted-foreground">No previous completed entries for this movement.</p>
    </div>
  </section>

  <section
    v-if="target"
    :class="
      cn(
        'relative flex gap-3 overflow-hidden rounded-[18px] p-4 ring-1',
        target.stalled
          ? 'bg-coral-soft ring-coral/30'
          : target.ready
            ? 'bg-success-soft ring-primary/40'
            : 'bg-card ring-white/5',
      )
    "
  >
    <TrendingUp
      :class="cn('mt-0.5 size-4 shrink-0', target.stalled ? 'text-coral' : 'text-primary')"
    />
    <div class="flex flex-col gap-0.5 text-sm">
      <h3 class="font-semibold">Today's target</h3>
      <p class="text-secondary-foreground">{{ target.text }}</p>
      <p v-if="target.stalled" class="text-secondary-foreground">
        No progress in 3 sessions. Check sleep, food and rest times first. Still stuck: drop 5–10%
        and build back up.
      </p>
    </div>
  </section>

  <ul v-if="entry.logs.length" class="flex flex-col gap-2">
    <li
      v-for="log in entry.logs"
      :key="log.index"
      class="bg-card pop-in flex items-center gap-3 rounded-2xl py-2 pr-2 pl-3 text-sm shadow-(--panel-shadow)"
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
    class="bg-success-soft text-success pop-in flex items-center gap-2 rounded-[18px] p-4 text-sm font-semibold ring-1 ring-primary/30"
  >
    <Check class="size-4 stroke-3" />All planned sets for this exercise are saved.
  </p>

  <details class="group bg-card rounded-[18px] px-4 shadow-(--panel-shadow)">
    <summary class="flex min-h-12 items-center text-sm font-semibold">
      How to do it · video & form check
      <ChevronDown class="ml-auto size-4 transition-transform group-open:rotate-180" />
    </summary>
    <div class="pb-4">
      <ExerciseGuide
        :exercise="exercise"
        :swappable="!entry.logs.length && !busy"
        @swap="emit('swap', exercise.id)"
      />
    </div>
  </details>

  <p class="text-muted-foreground text-xs leading-5">
    RIR = clean repetitions you could still perform. Record actual results, not just the target.
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
