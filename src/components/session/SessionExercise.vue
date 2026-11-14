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
      barbell: 'Total bar + plates, in kg.',
      smith: 'Added plates on both sides, in kg. Exclude the Smith bar.',
      dumbbell: 'kg per dumbbell.',
      cable: 'Stack setting in kg; pulley ratios vary.',
      machine: 'Stack setting in kg.',
      bodyweight: 'Bodyweight; no load to enter.',
    })[exercise.value.loadKind],
);
const stats = computed(() => [
  {
    value: `${exercise.value.sets} × ${exercise.value.min}–${exercise.value.max}`,
    label: `${exercise.value.unit}${exercise.value.perSide ? '/side' : ''}`,
  },
  {
    value: exercise.value.targetRir,
    label: exercise.value.unit === 'seconds' ? 'form reserve' : 'RIR',
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
  <section class="flex flex-col gap-4">
    <header class="flex flex-col gap-2">
      <h1 class="page-heading">{{ exercise.name }}</h1>
      <p class="text-muted-foreground text-sm leading-5">
        {{ loadHint }}{{ exercise.perSide ? ' Log both sides for each set.' : '' }}
      </p>
    </header>

    <dl class="flex flex-wrap gap-x-6 gap-y-2">
      <div v-for="stat in stats" :key="stat.label" class="flex flex-col-reverse gap-0.5">
        <dt class="text-muted-foreground text-xs">{{ stat.label }}</dt>
        <dd class="text-base font-semibold tabular-nums">{{ stat.value }}</dd>
      </div>
    </dl>

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
      class="bg-success-soft text-success flex items-center gap-2 rounded-xl p-4 text-sm font-medium"
    >
      <Check class="size-4" />All planned sets for this exercise are saved.
    </p>

    <slot name="rest-timer" />

    <section class="flex gap-2.5 py-1 text-sm">
      <History class="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="font-medium">Previous session</h2>
        <p v-if="previous" class="text-muted-foreground">
          {{ formatDate(previous.date, { day: 'numeric', month: 'short' }) }} ·
          {{ previousSummary }}
        </p>
        <p v-else class="text-muted-foreground">No previous completed entries for this movement.</p>
        <div v-if="target" class="mt-1 flex items-start gap-1.5">
          <TrendingUp
            :class="
              cn('mt-0.5 size-4 shrink-0', target.stalled ? 'text-coral' : 'text-muted-foreground')
            "
          />
          <div class="flex flex-col gap-1">
            <p class="text-secondary-foreground">
              <span class="font-medium">Today's target:</span> {{ target.text }}
            </p>
            <p v-if="target.stalled" class="text-muted-foreground">
              No progress in 3 sessions. Check sleep, food and rest times first. Still stuck: drop
              5–10% and build back up.
            </p>
          </div>
        </div>
      </div>
    </section>

    <ul v-if="entry.logs.length" class="flex flex-col gap-2" aria-label="Saved sets">
      <li
        v-for="log in entry.logs"
        :key="log.index"
        class="bg-card flex items-center gap-3 rounded-xl py-1 pr-1 pl-3 text-sm"
      >
        <span class="text-muted-foreground shrink-0 text-xs">Set {{ log.index }}</span>
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

    <details class="group border-y">
      <summary class="flex min-h-12 items-center gap-2 text-sm font-medium">
        How to do it · video & form check
        <ChevronDown class="ml-auto size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div class="pb-4">
        <ExerciseGuide :exercise="exercise" />
      </div>
    </details>

    <button
      v-if="!entry.logs.length"
      type="button"
      :disabled="busy"
      :class="
        cn(
          'flex min-h-12 items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-secondary',
          'focus-visible:ring-ring/60 outline-none focus-visible:ring-2 disabled:opacity-50',
          swapped ? 'text-coral' : 'text-secondary-foreground',
        )
      "
      @click="emit('swap', exercise.id)"
    >
      <ArrowRightLeft class="size-4 shrink-0" />
      <span>{{ swapped ? 'Back to' : 'Swap to' }} {{ exercise.alternative.name }}</span>
    </button>

    <p class="text-muted-foreground text-xs leading-5">
      RIR = clean repetitions you could still perform. Record actual results, not just the target.
    </p>
  </section>
</template>
