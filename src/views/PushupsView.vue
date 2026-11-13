<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { Flame, Plus, RotateCcw, Trophy, Undo2 } from '@lucide/vue';
import { formatDate } from '@/domain/dates';
import { calendarWeeks, challengeDays, challengeStats, type ChallengeDay } from '@/domain/pushups';
import type { AppState } from '@/domain/state';
import PushupDatePicker from '@/components/PushupDatePicker.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const props = defineProps<{ challenge: AppState['pushups']; today: string; busy: boolean }>();
const emit = defineEmits<{
  start: [dailyTarget: number];
  add: [date: string, reps: number];
  undo: [date: string];
  target: [dailyTarget: number];
  reset: [];
}>();

const quickAdds = [5, 10, 20, 25];
const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const targetInput = shallowRef<string | number>(props.challenge.dailyTarget);
// Keep the field in step when the target changes elsewhere (restore, reset, save).
watch(
  () => props.challenge.dailyTarget,
  (value) => (targetInput.value = value),
);
const customReps = shallowRef<string | number>('');
const confirmingReset = shallowRef(false);
const selected = shallowRef(props.today);
watch(
  () => props.today,
  (today, previous) => {
    // Don't move a half-entered set onto a different day at midnight.
    if (selected.value === previous && customReps.value === '') selected.value = today;
  },
);
watch(
  () => props.challenge.startDate,
  (startDate) => {
    if (startDate && selected.value < startDate) selected.value = props.today;
  },
);

const days = computed(() => challengeDays(props.challenge, props.today));
const stats = computed(() => challengeStats(days.value, props.today));
const weeks = computed(() => calendarWeeks(props.challenge, props.today));
const dayIndex = computed(() => days.value.findIndex((item) => item.date === selected.value));
const day = computed(() => days.value[dayIndex.value] ?? null);
const target = computed(() => props.challenge.dailyTarget);
const reps = computed(() => day.value?.reps ?? 0);
const ring = computed(() => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return {
    radius,
    circumference,
    offset: circumference * (1 - Math.min(reps.value / target.value, 1)),
  };
});
const targetValue = computed(() => Number(targetInput.value));
const validTarget = computed(
  () => Number.isInteger(targetValue.value) && targetValue.value >= 1 && targetValue.value <= 1000,
);
const customValue = computed(() => Number(customReps.value));
const validCustom = computed(
  () => Number.isInteger(customValue.value) && customValue.value >= 1 && customValue.value <= 1000,
);

const statTiles = computed(() => [
  { label: 'streak', value: stats.value.streak, icon: Flame },
  { label: 'best', value: stats.value.best, icon: Trophy },
  { label: 'days hit', value: stats.value.completed, icon: null },
  { label: 'total', value: stats.value.total.toLocaleString(), icon: null },
]);

const dayClass: Record<ChallengeDay['state'], string> = {
  done: 'bg-success text-primary-foreground',
  partial: 'bg-success-soft text-success',
  missed: 'bg-muted text-muted-foreground/60',
  today: 'bg-card text-primary border-primary border-2',
  upcoming: 'border-border text-muted-foreground/50 border border-dashed',
  before: 'text-muted-foreground/30',
};
function dayLabel(item: ChallengeDay) {
  const when = formatDate(item.date, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${when}: ${item.reps} of ${target.value} push-ups`;
}
function reset() {
  emit('reset');
  confirmingReset.value = false;
}
function addCustom() {
  if (props.busy || !day.value || !validCustom.value) return;
  emit('add', selected.value, customValue.value);
  customReps.value = '';
}
</script>

<template>
  <header class="page-header screen-enter">
    <h1 class="page-heading">Daily push-ups</h1>
    <p class="text-muted-foreground text-sm">
      Choose a date, then add the push-ups you did that day. You can log missed days later.
    </p>
  </header>

  <section v-if="!challenge.startDate" class="workout-hero flex flex-col gap-4">
    <div class="flex items-center gap-3">
      <span class="bg-accent text-primary flex size-12 items-center justify-center rounded-xl">
        <Flame class="size-6" />
      </span>
      <div>
        <h2 class="section-heading">Start tracking</h2>
        <p class="text-muted-foreground text-sm">Day 1 is today. No end date.</p>
      </div>
    </div>
    <form class="flex items-end gap-2" @submit.prevent="validTarget && emit('start', targetValue)">
      <div class="flex flex-1 flex-col gap-1.5">
        <Label for="pushup-target">Push-ups per day</Label>
        <Input
          id="pushup-target"
          v-model="targetInput"
          type="number"
          min="1"
          max="1000"
          step="1"
          inputmode="numeric"
          class="h-11"
        />
      </div>
      <Button type="submit" size="lg" class="h-11" :disabled="busy || !validTarget">Start</Button>
    </form>
  </section>

  <template v-else>
    <section class="workout-hero flex flex-col gap-5">
      <PushupDatePicker
        v-model="selected"
        :start-date="challenge.startDate"
        :today="today"
        :busy="busy"
      />
      <div class="flex items-center gap-5">
        <div class="relative size-32 shrink-0">
          <svg
            viewBox="0 0 120 120"
            class="size-full -rotate-90 overflow-visible"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              :r="ring.radius"
              fill="none"
              stroke-width="12"
              class="stroke-secondary"
            />
            <circle
              cx="60"
              cy="60"
              :r="ring.radius"
              fill="none"
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="ring.circumference"
              :stroke-dashoffset="ring.offset"
              :class="
                cn(
                  'drop-shadow-[0_0_8px_#d4f53c80] transition-[stroke-dashoffset] duration-700 ease-out',
                  reps >= target ? 'stroke-success' : 'stroke-primary',
                )
              "
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <strong
              class="font-display condensed text-[44px] leading-none font-bold tabular-nums"
              >{{ reps }}</strong
            >
            <span class="text-muted-foreground text-xs tabular-nums">of {{ target }}</span>
          </div>
        </div>
        <div class="flex min-w-0 flex-col gap-1">
          <h2 class="font-display text-xl font-semibold">
            <template v-if="day">Day {{ dayIndex + 1 }}</template>
            <template v-else>Before you started</template>
          </h2>
          <p
            v-if="day"
            :class="
              cn('text-sm', reps >= target ? 'text-success font-semibold' : 'text-muted-foreground')
            "
          >
            {{ reps >= target ? 'Target hit ✓' : `${target - reps} to go` }}
          </p>
        </div>
      </div>

      <div v-if="day && day.state !== 'upcoming'" class="flex flex-col gap-2">
        <div class="grid grid-cols-4 gap-2">
          <Button
            v-for="amount in quickAdds"
            :key="amount"
            variant="outline"
            size="lg"
            class="border-primary/40 text-primary font-bold tabular-nums"
            :disabled="busy"
            @click="emit('add', selected, amount)"
            >+{{ amount }}</Button
          >
        </div>
        <form class="flex gap-2" @submit.prevent="addCustom">
          <Input
            v-model="customReps"
            aria-label="Custom number of push-ups"
            type="number"
            min="1"
            max="1000"
            step="1"
            inputmode="numeric"
            placeholder="Other amount"
            class="h-11"
          />
          <Button type="submit" size="lg" class="h-11" :disabled="busy || !validCustom"
            ><Plus />Add</Button
          >
          <Button
            type="button"
            variant="ghost"
            size="lg"
            class="h-11"
            aria-label="Undo last entry"
            :disabled="busy || reps === 0"
            @click="emit('undo', selected)"
            ><Undo2
          /></Button>
        </form>
      </div>
    </section>

    <dl class="grid grid-cols-4 gap-2">
      <div
        v-for="stat in statTiles"
        :key="stat.label"
        class="bg-card flex flex-col-reverse items-center gap-1 rounded-xl px-1 py-3 text-center shadow-[var(--panel-shadow)]"
      >
        <dt class="text-muted-foreground text-[11px]">{{ stat.label }}</dt>
        <dd
          class="font-display flex items-center gap-1 text-2xl leading-none font-semibold tabular-nums"
        >
          <component :is="stat.icon" v-if="stat.icon" class="text-primary size-4" />{{ stat.value }}
        </dd>
      </div>
    </dl>

    <section class="bg-card flex flex-col gap-3 rounded-[20px] p-4 shadow-[var(--panel-shadow)]">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 class="section-heading">Last 12 weeks</h2>
        <span class="text-muted-foreground text-xs">Tap a day to log or review it</span>
      </div>
      <div class="flex gap-1">
        <ol class="text-muted-foreground grid grid-rows-7 gap-1 text-[10px]" aria-hidden="true">
          <li v-for="(letter, index) in weekdays" :key="index" class="flex w-3 items-center">
            {{ letter }}
          </li>
        </ol>
        <div
          class="grid min-w-0 flex-1 auto-cols-fr grid-flow-col grid-rows-7 gap-1"
          role="group"
          aria-label="Push-up days"
        >
          <template v-for="week in weeks" :key="week[0]!.date">
            <button
              v-for="item in week"
              :key="item.date"
              type="button"
              :aria-label="dayLabel(item)"
              :aria-pressed="item.date === selected"
              :disabled="item.state === 'upcoming' || item.state === 'before'"
              :class="
                cn(
                  'flex aspect-square items-center justify-center rounded-[4px] text-[9px] font-semibold tabular-nums transition-transform',
                  'focus-visible:ring-ring/60 outline-none focus-visible:ring-2 enabled:active:scale-90',
                  dayClass[item.state],
                  item.date === selected && 'ring-foreground ring-offset-card ring-2 ring-offset-1',
                )
              "
              @click="selected = item.date"
            >
              {{ Number(item.date.slice(-2)) }}
            </button>
          </template>
        </div>
      </div>
      <ul class="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        <li class="flex items-center gap-1">
          <span class="bg-success size-2.5 rounded-sm" />Target hit
        </li>
        <li class="flex items-center gap-1">
          <span class="bg-success-soft size-2.5 rounded-sm" />Partial
        </li>
        <li class="flex items-center gap-1"><span class="bg-muted size-2.5 rounded-sm" />Missed</li>
        <li class="flex items-center gap-1">
          <span class="border-primary size-2.5 rounded-sm border-2" />Today
        </li>
      </ul>
    </section>

    <details class="group bg-card rounded-xl px-4 shadow-[var(--panel-shadow)]">
      <summary class="flex min-h-12 items-center text-sm font-semibold">Tracker settings</summary>
      <div class="flex flex-col gap-3 pb-4">
        <form
          class="flex items-end gap-2"
          @submit.prevent="validTarget && emit('target', targetValue)"
        >
          <div class="flex flex-1 flex-col gap-1.5">
            <Label for="pushup-daily">Push-ups per day</Label>
            <Input
              id="pushup-daily"
              v-model="targetInput"
              type="number"
              min="1"
              max="1000"
              step="1"
              inputmode="numeric"
              class="h-11"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            class="h-11"
            :disabled="busy || !validTarget || targetValue === target"
            >Save</Button
          >
        </form>
        <p class="text-muted-foreground text-xs">Changing the target re-scores every day.</p>
        <Button
          v-if="!confirmingReset"
          variant="ghost"
          class="text-destructive w-fit"
          @click="confirmingReset = true"
          ><RotateCcw />Start over from today</Button
        >
        <div v-else class="bg-coral-soft/60 flex flex-col gap-2 rounded-lg p-3 text-sm">
          <p>This deletes all push-up entries and starts from zero. It can't be undone.</p>
          <div class="flex gap-2">
            <Button variant="destructive" :disabled="busy" @click="reset"
              >Delete and restart</Button
            >
            <Button variant="ghost" @click="confirmingReset = false">Keep it</Button>
          </div>
        </div>
      </div>
    </details>
  </template>
</template>
