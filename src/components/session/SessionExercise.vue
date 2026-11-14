<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { ArrowRightLeft, Check, ChevronDown, History, Pencil, TrendingUp } from '@lucide/vue';
import { formatDate } from '@/domain/dates';
import {
  formatSet,
  nextTarget,
  previousPerformance,
  restFor,
  shortSet,
  isSwappedExercise,
} from '@/domain/sessions';
import type { Session, SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ExerciseGuide from '@/components/ExerciseGuide.vue';
import SetForm from './SetForm.vue';

const props = defineProps<{
  entry: Session['exercises'][number];
  session: Session;
  history: Session[];
  restMinutes: number | null;
  busy: boolean;
  position: number;
  total: number;
}>();
const emit = defineEmits<{
  record: [exerciseId: string, log: SetLog];
  swap: [exerciseId: string];
}>();
const editing = shallowRef<SetLog | null>(null);
const entry = computed(() => props.entry);
const exercise = computed(() => entry.value.exercise);
const swapped = computed(() => isSwappedExercise(entry.value));
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

// Other saves also replace state objects. Only actual log changes end a correction.
watch(
  () => JSON.stringify(props.entry.logs),
  () => {
    editing.value = null;
  },
);
</script>

<template>
  <section :key="exercise.id" class="screen-enter flex flex-col gap-2">
    <span class="eyebrow">Exercise {{ position }} of {{ total }}</span>
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
</template>
