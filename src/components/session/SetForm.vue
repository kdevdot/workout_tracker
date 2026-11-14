<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue';
import { Check } from '@lucide/vue';
import type { Exercise } from '@/domain/programme-types';
import type { SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Parent re-keys this form per exercise/set, so fields initialise from props once.
const props = defineProps<{
  exercise: Exercise;
  index: number;
  initial: SetLog | null;
  /** Values to start a new set with: the last set logged, so a repeat set is one tap. */
  defaults: SetLog | null;
  busy: boolean;
}>();
const emit = defineEmits<{ submit: [log: SetLog]; cancel: [] }>();

const start = props.initial ?? props.defaults;
type Key = 'load' | 'reps' | 'left' | 'right' | 'effort';
const values = reactive<Record<Key, string | number>>({
  load: start?.load ?? '',
  reps: start?.reps ?? '',
  left: start?.sides?.left ?? start?.reps ?? '',
  right: start?.sides?.right ?? start?.reps ?? '',
  effort: start?.effort ?? '',
});
const error = shallowRef('');
// Bodyweight movements have no load to type; one-sided movements log each side.
const weighted = computed(() => props.exercise.loadKind !== 'bodyweight');
const sided = computed(() => props.exercise.perSide);
const timed = computed(() => props.exercise.unit === 'seconds');
const maxEffort = computed(() => (timed.value ? 120 : 10));
const fields = computed(() => {
  const unit = props.exercise.unit;
  const unitShort = timed.value ? 's' : unit;
  const count = { inputmode: 'numeric', min: 1, max: 3600, step: 1 } as const;
  const list: {
    key: Key;
    label: string;
    inputmode: string;
    min: number;
    max: number;
    step: number | 'any';
  }[] = [
    ...(weighted.value
      ? [
          {
            key: 'load' as const,
            label: 'Load · kg',
            inputmode: 'decimal',
            min: 0,
            max: 1000,
            step: 'any' as const,
          },
        ]
      : []),
    ...(sided.value
      ? [
          { key: 'left' as const, label: `Left · ${unitShort}`, ...count },
          { key: 'right' as const, label: `Right · ${unitShort}`, ...count },
        ]
      : [{ key: 'reps' as const, label: unit[0]!.toUpperCase() + unit.slice(1), ...count }]),
    {
      key: 'effort',
      label: timed.value ? 'Reserve · s' : 'RIR',
      inputmode: 'decimal',
      min: 0,
      max: maxEffort.value,
      step: 0.5,
    },
  ];
  // With four fields, pair load/RIR on the first row and left/right on the next.
  if (weighted.value && sided.value) list.splice(1, 0, list.pop()!);
  return list;
});
const columns = computed(
  () => ({ 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2' })[fields.value.length],
);

const count = (value: string | number) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= 3600 ? number : null;
};

function submit() {
  error.value = '';
  const numericLoad = weighted.value
    ? String(values.load).trim() === ''
      ? NaN
      : Number(values.load)
    : (props.initial?.load ?? null);
  const sides = sided.value ? { left: count(values.left), right: count(values.right) } : null;
  const numericReps = sides ? Math.min(sides.left ?? 0, sides.right ?? 0) : count(values.reps);
  const numericEffort = Number(values.effort);
  if (numericLoad !== null && !(numericLoad >= 0 && numericLoad <= 1000)) {
    error.value = 'Enter the load in kg.';
  } else if (!numericReps) {
    error.value = sides
      ? `Enter whole ${props.exercise.unit} for both sides.`
      : `Enter whole ${props.exercise.unit}.`;
  } else if (
    String(values.effort).trim() === '' ||
    !(numericEffort >= 0 && numericEffort <= maxEffort.value)
  ) {
    error.value = timed.value
      ? 'Enter the seconds you had left in reserve.'
      : 'Enter your reps in reserve (0–10).';
  }
  if (error.value || !numericReps) return;
  emit('submit', {
    index: props.index,
    load: numericLoad,
    reps: numericReps,
    ...(sides ? { sides: { left: sides.left!, right: sides.right! } } : {}),
    effort: numericEffort,
    loggedAt: new Date().toISOString(),
  });
}
</script>

<template>
  <form
    class="set-form bg-card flex flex-col gap-4 rounded-xl p-4"
    :class="{
      'set-form--three-fields': fields.length === 3,
      'set-form--four-fields': fields.length === 4,
    }"
    novalidate
    @submit.prevent="submit"
  >
    <div class="flex items-baseline justify-between gap-2">
      <h2 class="section-heading">
        {{ initial ? 'Edit' : 'Record' }} set {{ index }}
        <span v-if="sided" class="text-muted-foreground text-sm font-normal">· both sides</span>
      </h2>
      <span class="text-muted-foreground text-sm">of {{ exercise.sets }}</span>
    </div>
    <div :class="cn('set-fields grid items-end gap-2.5', columns)">
      <div v-for="item in fields" :key="item.key" class="flex flex-col gap-1.5">
        <Label :for="`${item.key}-${index}`" class="text-muted-foreground text-xs">{{
          item.label
        }}</Label>
        <Input
          :id="`${item.key}-${index}`"
          v-model="values[item.key]"
          type="number"
          :inputmode="item.inputmode"
          :min="item.min"
          :max="item.max"
          :step="item.step"
          required
          placeholder="—"
          class="set-input h-12 px-1 text-center text-lg font-bold tabular-nums"
        />
      </div>
    </div>
    <p v-if="error" class="text-destructive text-sm font-medium" role="alert">{{ error }}</p>
    <Button type="submit" size="lg" class="h-12 text-base font-bold" :disabled="busy">
      {{ busy ? 'Saving…' : initial ? 'Save corrected set' : `Record set ${index}` }}
      <Check class="size-5" />
    </Button>
    <Button v-if="initial" type="button" variant="ghost" @click="emit('cancel')">
      Cancel correction
    </Button>
  </form>
</template>

<style scoped>
.set-form {
  border-radius: 16px;
}
.set-input {
  min-height: 4rem;
  background: var(--background);
  border-color: var(--input);
  border-radius: 8px;
  font-family: var(--font-display);
  font-stretch: 75%;
  font-size: 1.875rem;
  font-weight: 600;
}
.set-input:focus-visible {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-focus);
}
.set-form--four-fields {
  gap: 12px;
  padding: 12px;
}
.set-form--four-fields .set-input {
  min-height: 3.5rem;
}
@media (max-width: 360px) {
  .set-form--three-fields .set-input {
    font-size: 1.5rem;
    padding-inline: 0;
  }
}
</style>
