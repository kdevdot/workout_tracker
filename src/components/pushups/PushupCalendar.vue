<script setup lang="ts">
import { computed } from 'vue';
import { Check, ChevronLeft, ChevronRight } from '@lucide/vue';
import { formatDate, shiftMonth } from '@/domain/dates';
import { calendarMonth, type ChallengeDay } from '@/domain/pushups';
import type { AppState } from '@/domain/state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps<{ challenge: AppState['pushups']; today: string; busy: boolean }>();
const selected = defineModel<string>({ required: true });
const month = defineModel<string>('month', { required: true });
const firstMonth = computed(() => `${(props.challenge.startDate ?? props.today).slice(0, 7)}-01`);
const lastMonth = computed(() => `${props.today.slice(0, 7)}-01`);
const days = computed(() => calendarMonth(props.challenge, props.today, month.value));
const monthLabel = computed(() => formatDate(month.value, { month: 'long', year: 'numeric' }));
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayClass: Record<ChallengeDay['state'], string> = {
  done: 'bg-success-soft text-success',
  partial: 'bg-secondary text-foreground',
  missed: 'text-secondary-foreground hover:bg-secondary',
  today: 'text-foreground hover:bg-secondary',
  upcoming: 'text-muted-foreground/50',
  before: 'text-muted-foreground/50',
};

function browseMonth(offset: number) {
  const next = shiftMonth(month.value, offset);
  if (!props.busy && next >= firstMonth.value && next <= lastMonth.value) month.value = next;
}

function chooseDay(item: ChallengeDay) {
  if (props.busy || item.date > props.today || item.state === 'before') return;
  selected.value = item.date;
  month.value = `${item.date.slice(0, 7)}-01`;
}

function dayLabel(item: ChallengeDay) {
  const when = formatDate(item.date, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${when}: ${item.reps} of ${props.challenge.dailyTarget} push-ups`;
}
</script>

<template>
  <section class="bg-card flex flex-col gap-3 rounded-2xl p-4">
    <div class="flex items-center justify-between gap-2">
      <h2 class="section-heading" aria-live="polite">{{ monthLabel }}</h2>
      <div class="flex gap-1">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Previous month"
          :disabled="busy || month <= firstMonth"
          @click="browseMonth(-1)"
          ><ChevronLeft
        /></Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Next month"
          :disabled="busy || month >= lastMonth"
          @click="browseMonth(1)"
          ><ChevronRight
        /></Button>
      </div>
    </div>
    <p class="text-muted-foreground text-sm">Choose a day to log or review it.</p>
    <ol class="text-muted-foreground grid grid-cols-7 gap-1 text-center text-xs" aria-hidden="true">
      <li v-for="day in weekdays" :key="day">{{ day }}</li>
    </ol>
    <div class="grid grid-cols-7 gap-1" role="group" aria-label="Push-up days">
      <button
        v-for="item in days"
        :key="item.date"
        type="button"
        :aria-label="dayLabel(item)"
        :aria-pressed="item.date === selected"
        :aria-current="item.date === today ? 'date' : undefined"
        :disabled="busy || item.date > today || item.state === 'before'"
        :class="
          cn(
            'relative flex min-h-11 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors',
            'focus-visible:ring-ring outline-none focus-visible:ring-2',
            dayClass[item.state],
            !item.date.startsWith(month.slice(0, 7)) && 'enabled:text-muted-foreground',
            item.date === today && 'border-primary border',
            item.date === selected && 'ring-foreground ring-offset-card ring-2 ring-offset-1',
          )
        "
        @click="chooseDay(item)"
      >
        {{ Number(item.date.slice(-2)) }}
        <Check v-if="item.state === 'done'" class="absolute right-0.5 bottom-0.5 size-2.5" />
        <span
          v-else-if="item.state === 'partial'"
          class="bg-primary absolute bottom-1 size-1 rounded-full"
          aria-hidden="true"
        />
      </button>
    </div>
    <ul class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs">
      <li class="flex items-center gap-1.5"><Check class="text-success size-3.5" />Target hit</li>
      <li class="flex items-center gap-1.5">
        <span class="bg-primary size-1.5 rounded-full" aria-hidden="true" />Partial
      </li>
      <li class="flex items-center gap-1.5">
        <span class="border-primary size-3 rounded-sm border" aria-hidden="true" />Today
      </li>
    </ul>
  </section>
</template>
