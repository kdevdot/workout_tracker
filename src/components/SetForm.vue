<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { Check } from '@lucide/vue';
import type { Exercise } from '@/domain/programme-types';
import type { SetLog } from '@/domain/state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Parent re-keys this form per exercise/set, so fields initialise from props once.
const props = defineProps<{
  exercise: Exercise;
  index: number;
  initial: SetLog | null;
  busy: boolean;
}>();
const emit = defineEmits<{ submit: [log: SetLog]; cancel: [] }>();

const load = shallowRef<string | number>(props.initial?.load ?? '');
const reps = shallowRef<string | number>(props.initial?.reps ?? '');
const effort = shallowRef<string | number>(props.initial?.effort ?? '');
const error = shallowRef('');
const bodyweight = computed(() => props.exercise.loadKind === 'bodyweight');
const timed = computed(() => props.exercise.unit === 'seconds');
const maxEffort = computed(() => (timed.value ? 120 : 10));

function submit() {
  error.value = '';
  const blankLoad = String(load.value).trim() === '';
  const numericLoad = bodyweight.value && blankLoad ? null : Number(load.value);
  const numericReps = Number(reps.value);
  const numericEffort = Number(effort.value);
  if (
    (!bodyweight.value && blankLoad) ||
    (numericLoad !== null &&
      (!Number.isFinite(numericLoad) || numericLoad < 0 || numericLoad > 1000)) ||
    !Number.isInteger(numericReps) ||
    numericReps <= 0 ||
    numericReps > 3600 ||
    String(effort.value).trim() === '' ||
    !Number.isFinite(numericEffort) ||
    numericEffort < 0 ||
    numericEffort > maxEffort.value
  ) {
    error.value = 'Enter a valid load, positive whole reps/time, and your actual effort reserve.';
    return;
  }
  emit('submit', {
    index: props.index,
    load: numericLoad,
    reps: numericReps,
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
    <div class="flex items-baseline justify-between">
      <h3 class="section-heading">{{ initial ? 'Edit' : 'Record' }} set {{ index }}</h3>
      <span class="text-muted-foreground text-xs font-medium">of {{ exercise.sets }}</span>
    </div>
    <div class="set-fields grid grid-cols-3 gap-2.5">
      <div class="flex flex-col gap-1.5">
        <Label :for="`load-${index}`" class="text-muted-foreground text-xs">Load · kg</Label>
        <Input
          :id="`load-${index}`"
          v-model="load"
          type="number"
          inputmode="decimal"
          min="0"
          max="1000"
          step="any"
          :required="!bodyweight"
          :placeholder="bodyweight ? 'BW' : '—'"
          class="h-12 text-center text-lg font-bold tabular-nums"
        />
      </div>
      <div class="flex flex-col gap-1.5">
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
          class="h-12 text-center text-lg font-bold tabular-nums"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label :for="`effort-${index}`" class="text-muted-foreground text-xs">{{
          timed ? 'Reserve · s' : 'Actual RIR'
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
          class="h-12 text-center text-lg font-bold tabular-nums"
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
