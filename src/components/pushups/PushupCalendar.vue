<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '@/domain/dates';
import { calendarWeeks, type ChallengeDay } from '@/domain/pushups';
import type { AppState } from '@/domain/state';
import { cn } from '@/lib/utils';
const props = defineProps<{ challenge: AppState['pushups']; today: string; busy: boolean }>();
const selected = defineModel<string>({ required: true });
const weeks = computed(() => calendarWeeks(props.challenge, props.today));
const target = computed(() => props.challenge.dailyTarget);
const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
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
</script>

<template>
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
            :disabled="busy || item.state === 'upcoming' || item.state === 'before'"
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
</template>
