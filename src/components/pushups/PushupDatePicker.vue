<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
import { formatDate, shiftDate, validDate } from '@/domain/dates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const date = defineModel<string>({ required: true });
const props = defineProps<{ startDate: string; today: string; busy: boolean }>();
const yesterday = computed(() => shiftDate(props.today, -1));
const dateLabel = computed(() =>
  formatDate(date.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
);

function chooseDate(value: string) {
  if (!props.busy && validDate(value) && value >= props.startDate && value <= props.today)
    date.value = value;
}
function changeDate(event: Event) {
  const input = event.target as HTMLInputElement;
  chooseDate(input.value);
  // Native pickers also allow clearing or typing outside min/max. Keep a valid day selected.
  input.value = date.value;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <Label for="pushup-date">Log for</Label>
      <div class="flex gap-1">
        <Button
          variant="ghost"
          class="min-h-11"
          :aria-pressed="date === yesterday"
          :disabled="busy || yesterday < startDate"
          @click="chooseDate(yesterday)"
          >Yesterday</Button
        >
        <Button
          variant="ghost"
          class="min-h-11"
          :aria-pressed="date === today"
          :disabled="busy"
          @click="chooseDate(today)"
          >Today</Button
        >
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Previous day"
        :disabled="busy || date <= startDate"
        @click="chooseDate(shiftDate(date, -1))"
        ><ChevronLeft
      /></Button>
      <Input
        id="pushup-date"
        type="date"
        :value="date"
        :min="startDate"
        :max="today"
        :disabled="busy"
        aria-describedby="pushup-date-label"
        class="h-11 flex-1"
        @change="changeDate"
      />
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Next day"
        :disabled="busy || date >= today"
        @click="chooseDate(shiftDate(date, 1))"
        ><ChevronRight
      /></Button>
    </div>
    <p id="pushup-date-label" class="text-muted-foreground text-sm" aria-live="polite">
      {{ dateLabel }}
    </p>
  </div>
</template>
