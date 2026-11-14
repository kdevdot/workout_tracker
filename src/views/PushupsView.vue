<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { Flame, Trophy } from '@lucide/vue';
import { challengeDays, challengeStats } from '@/domain/pushups';
import type { AppState } from '@/domain/state';
import PushupDatePicker from '@/components/pushups/PushupDatePicker.vue';
import PushupLogger from '@/components/pushups/PushupLogger.vue';
import PushupCalendar from '@/components/pushups/PushupCalendar.vue';
import PushupSettings from '@/components/pushups/PushupSettings.vue';
import PushupTargetForm from '@/components/pushups/PushupTargetForm.vue';

const props = defineProps<{ challenge: AppState['pushups']; today: string; busy: boolean }>();
const emit = defineEmits<{
  start: [dailyTarget: number];
  add: [date: string, reps: number, onSaved?: () => void];
  undo: [date: string];
  target: [dailyTarget: number];
  reset: [];
}>();

const customReps = shallowRef<string | number>('');
const selected = shallowRef(props.today);
const month = shallowRef(`${props.today.slice(0, 7)}-01`);
function showMonth(date: string) {
  month.value = `${date.slice(0, 7)}-01`;
}
watch(selected, showMonth);
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
    showMonth(selected.value);
  },
);

const days = computed(() => challengeDays(props.challenge, props.today));
const stats = computed(() => challengeStats(days.value, props.today));
const dayIndex = computed(() => days.value.findIndex((item) => item.date === selected.value));
const day = computed(() => days.value[dayIndex.value] ?? null);
const statTiles = computed(() => [
  { label: 'streak', value: stats.value.streak, icon: Flame },
  { label: 'best', value: stats.value.best, icon: Trophy },
  { label: 'days hit', value: stats.value.completed, icon: null },
  { label: 'total', value: stats.value.total.toLocaleString(), icon: null },
]);
</script>

<template>
  <header class="page-header">
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
    <PushupTargetForm
      :target="challenge.dailyTarget"
      :busy="busy"
      input-id="pushup-target"
      action="Start"
      @submit="emit('start', $event)"
    />
  </section>

  <template v-else>
    <section class="workout-hero flex flex-col gap-5">
      <PushupDatePicker
        v-model="selected"
        :start-date="challenge.startDate"
        :today="today"
        :busy="busy"
        @choose="showMonth"
      />
      <PushupLogger
        v-model:draft="customReps"
        :day="day"
        :day-number="dayIndex + 1"
        :date="selected"
        :target="challenge.dailyTarget"
        :busy="busy"
        @add="(date, reps, onSaved) => emit('add', date, reps, onSaved)"
        @undo="emit('undo', $event)"
      />
    </section>

    <dl class="grid grid-cols-4 gap-2 border-y py-4">
      <div
        v-for="stat in statTiles"
        :key="stat.label"
        class="flex flex-col-reverse items-center gap-1 text-center"
      >
        <dt class="text-muted-foreground text-xs">{{ stat.label }}</dt>
        <dd
          class="flex flex-wrap items-center justify-center gap-1 text-lg leading-none font-semibold tabular-nums"
        >
          <component :is="stat.icon" v-if="stat.icon" class="text-muted-foreground size-3.5" />{{
            stat.value
          }}
        </dd>
      </div>
    </dl>

    <PushupCalendar
      v-model="selected"
      v-model:month="month"
      :challenge="challenge"
      :today="today"
      :busy="busy"
    />
    <PushupSettings
      :target="challenge.dailyTarget"
      :busy="busy"
      @target="emit('target', $event)"
      @reset="emit('reset')"
    />
  </template>
</template>
