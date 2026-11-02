<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
import { formatDate, localDate, shiftDate, weekFor } from '@/domain/dates';
import { workoutForDate, workouts } from '@/domain/programme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps<{ date: string }>();
const emit = defineEmits<{ date: [value: string] }>();

const today = localDate();
const days = computed(() =>
  weekFor(props.date).map((day) => {
    const workout = workoutForDate(day);
    return {
      day,
      selected: day === props.date,
      today: day === today,
      workout: workout ? workouts[workout].name : null,
    };
  }),
);
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="text-coral text-sm font-bold tracking-wide uppercase">
          {{ formatDate(date, { weekday: 'long' }) }}
        </p>
        <h1 class="text-[2.1rem] leading-tight font-extrabold tracking-tight">
          {{ formatDate(date, { day: 'numeric', month: 'long' }) }}
        </h1>
      </div>
      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Previous week"
          @click="emit('date', shiftDate(date, -7))"
        >
          <ChevronLeft class="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Next week"
          @click="emit('date', shiftDate(date, 7))"
        >
          <ChevronRight class="size-5" />
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1.5" aria-label="Week dates">
      <button
        v-for="item in days"
        :key="item.day"
        :aria-pressed="item.selected"
        :aria-label="`${formatDate(item.day, { weekday: 'long', day: 'numeric', month: 'long' })}${item.workout ? `, ${item.workout}` : ', rest day'}`"
        :class="
          cn(
            'flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent text-xs transition-colors',
            'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
            item.selected
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-muted text-muted-foreground',
            item.today && !item.selected && 'border-coral/60 text-foreground',
          )
        "
        @click="emit('date', item.day)"
      >
        <span class="font-semibold">{{ formatDate(item.day, { weekday: 'narrow' }) }}</span>
        <strong class="text-base">{{ Number(item.day.slice(-2)) }}</strong>
        <span
          :class="
            cn(
              'size-1.5 rounded-full',
              item.workout
                ? item.selected
                  ? 'bg-primary-foreground'
                  : 'bg-coral'
                : 'bg-transparent',
            )
          "
        />
      </button>
    </div>

    <label
      class="text-muted-foreground flex items-center justify-between gap-3 text-sm font-medium"
    >
      Choose date
      <input
        type="date"
        :value="date"
        class="border-input bg-card text-foreground focus-visible:ring-ring/50 h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
        @change="emit('date', ($event.target as HTMLInputElement).value)"
      />
    </label>
  </section>
</template>
