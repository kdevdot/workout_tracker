<script setup lang="ts">
import { computed, shallowRef } from 'vue';
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
const load = shallowRef<string | number>(start?.load ?? '');
const reps = shallowRef<string | number>(start?.reps ?? '');
const left = shallowRef<string | number>(start?.sides?.left ?? start?.reps ?? '');
const right = shallowRef<string | number>(start?.sides?.right ?? start?.reps ?? '');
const effort = shallowRef<string | number>(start?.effort ?? '');
const error = shallowRef('');
// Bodyweight movements have no load to type; one-sided movements log each side.
const weighted = computed(() => props.exercise.loadKind !== 'bodyweight');
const sided = computed(() => props.exercise.perSide);
const timed = computed(() => props.exercise.unit === 'seconds');
const maxEffort = computed(() => (timed.value ? 120 : 10));
const unitShort = computed(() => (timed.value ? 's' : props.exercise.unit));
const columns = computed(
  () =>
    ({ 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' })[
      (weighted.value ? 1 : 0) + (sided.value ? 2 : 1) + 1
    ],
);
const field = 'h-12 px-1 text-center text-lg font-bold tabular-nums';

const count = (value: string | number) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= 3600 ? number : null;
};

function submit() {
  error.value = '';
  const numericLoad = weighted.value
    ? String(load.value).trim() === ''
      ? NaN
      : Number(load.value)
    : (props.initial?.load ?? null);
  const sides = sided.value ? { left: count(left.value), right: count(right.value) } : null;
  const numericReps = sides ? Math.min(sides.left ?? 0, sides.right ?? 0) : count(reps.value);
  const numericEffort = Number(effort.value);
  if (numericLoad !== null && !(numericLoad >= 0 && numericLoad <= 1000)) {
    error.value = 'Enter the load in kg.';
  } else if (!numericReps) {
    error.value = sides
      ? `Enter whole ${props.exercise.unit} for both sides.`
      : `Enter whole ${props.exercise.unit}.`;
  } else if (
    String(effort.value).trim() === '' ||
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
    class="set-form bg-card flex flex-col gap-5 rounded-xl border p-5"
    novalidate
    @submit.prevent="submit"
  >
    <div class="flex items-baseline justify-between gap-2">
      <h3 class="section-heading">
        {{ initial ? 'Edit' : 'Record' }} set {{ index }}
        <span v-if="sided" class="text-muted-foreground text-sm font-normal">· both sides</span>
      </h3>
      <span class="text-muted-foreground text-xs font-medium">of {{ exercise.sets }}</span>
    </div>
    <div :class="cn('set-fields grid gap-2.5', columns)">
      <div v-if="weighted" class="flex flex-col gap-1.5">
        <Label :for="`load-${index}`" class="text-muted-foreground text-xs">Load · kg</Label>
        <Input
          :id="`load-${index}`"
          v-model="load"
          type="number"
          inputmode="decimal"
          min="0"
          max="1000"
          step="any"
          required
          placeholder="—"
          :class="field"
        />
      </div>
      <template v-if="sided">
        <div class="flex flex-col gap-1.5">
          <Label :for="`left-${index}`" class="text-muted-foreground text-xs"
            >Left · {{ unitShort }}</Label
          >
          <Input
            :id="`left-${index}`"
            v-model="left"
            type="number"
            inputmode="numeric"
            min="1"
            max="3600"
            step="1"
            required
            placeholder="—"
            :class="field"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label :for="`right-${index}`" class="text-muted-foreground text-xs"
            >Right · {{ unitShort }}</Label
          >
          <Input
            :id="`right-${index}`"
            v-model="right"
            type="number"
            inputmode="numeric"
            min="1"
            max="3600"
            step="1"
            required
            placeholder="—"
            :class="field"
          />
        </div>
      </template>
      <div v-else class="flex flex-col gap-1.5">
        <Label :for="`reps-${index}`" class="text-muted-foreground text-xs capitalize">{{
          exercise.unit
        }}</Label>
        <Input
          :id="`reps-${index}`"
          v-model="reps"
          type="number"
          inputmode="numeric"
          min="1"
          max="3600"
          step="1"
          required
          placeholder="—"
          :class="field"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label :for="`effort-${index}`" class="text-muted-foreground text-xs">{{
          timed ? 'Reserve · s' : 'RIR'
        }}</Label>
        <Input
          :id="`effort-${index}`"
          v-model="effort"
          type="number"
          inputmode="decimal"
          min="0"
          :max="maxEffort"
          step="0.5"
          required
          placeholder="—"
          :class="field"
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
