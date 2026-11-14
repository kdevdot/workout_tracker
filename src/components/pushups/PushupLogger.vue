<script setup lang="ts">
import { computed } from 'vue';
import { Check, Plus, Undo2 } from '@lucide/vue';
import { validPushupCount, type ChallengeDay } from '@/domain/pushups';
import { MAX_PUSHUPS_PER_ENTRY } from '@/domain/limits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const props = defineProps<{
  day: ChallengeDay | null;
  dayNumber: number;
  date: string;
  target: number;
  busy: boolean;
}>();
const customReps = defineModel<string | number>('draft', { required: true });
const emit = defineEmits<{
  add: [date: string, reps: number, onSaved?: () => void];
  undo: [date: string];
}>();
const quickAdds = [5, 10, 20, 25];
const reps = computed(() => props.day?.reps ?? 0);
const target = computed(() => props.target);
const validCustom = computed(() => validPushupCount(customReps.value));
const ring = computed(() => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return {
    radius,
    circumference,
    offset: circumference * (1 - Math.min(reps.value / target.value, 1)),
  };
});

function addCustom() {
  if (props.busy || !props.day || !validCustom.value) return;
  const submitted = customReps.value;
  const date = props.date;
  emit('add', date, Number(submitted), () => {
    if (customReps.value === submitted && props.date === date) customReps.value = '';
  });
}
</script>

<template>
  <div class="flex items-center gap-5">
    <div class="relative size-24 shrink-0">
      <svg viewBox="0 0 120 120" class="size-full -rotate-90 overflow-visible" aria-hidden="true">
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
              'transition-[stroke-dashoffset] duration-200 ease-out',
              reps >= target ? 'stroke-success' : 'stroke-primary',
            )
          "
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <strong class="font-display text-[30px] leading-none font-semibold tabular-nums">{{
          reps
        }}</strong>
        <span class="text-muted-foreground text-xs tabular-nums">of {{ target }}</span>
      </div>
    </div>
    <div class="flex min-w-0 flex-col gap-1">
      <p class="text-base font-medium">
        <template v-if="day">Day {{ dayNumber }}</template>
        <template v-else>Before you started</template>
      </p>
      <p
        v-if="day"
        :class="
          cn(
            'flex items-center gap-1.5 text-sm',
            reps >= target ? 'text-success font-semibold' : 'text-muted-foreground',
          )
        "
      >
        <Check v-if="reps >= target" class="size-3.5" />
        {{ reps >= target ? 'Target hit' : `${target - reps} to go` }}
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
        class="font-semibold tabular-nums"
        :disabled="busy"
        @click="emit('add', date, amount)"
        >+{{ amount }}</Button
      >
    </div>
    <form class="flex gap-2" @submit.prevent="addCustom">
      <Input
        v-model="customReps"
        aria-label="Custom number of push-ups"
        type="number"
        min="1"
        :max="MAX_PUSHUPS_PER_ENTRY"
        step="1"
        inputmode="numeric"
        placeholder="Reps"
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
        @click="emit('undo', date)"
        ><Undo2
      /></Button>
    </form>
  </div>
</template>
