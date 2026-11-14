<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { validPushupCount } from '@/domain/pushups';
import { MAX_PUSHUPS_PER_ENTRY } from '@/domain/limits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const props = defineProps<{
  target: number;
  busy: boolean;
  inputId: string;
  action: 'Start' | 'Save';
}>();
const emit = defineEmits<{ submit: [target: number] }>();
const value = shallowRef<string | number>(props.target);
watch(
  () => props.target,
  (target) => {
    value.value = target;
  },
);
const valid = computed(() => validPushupCount(value.value));
function submit() {
  if (!props.busy && valid.value) emit('submit', Number(value.value));
}
</script>

<template>
  <form class="flex items-end gap-2" @submit.prevent="submit">
    <div class="flex flex-1 flex-col gap-1.5">
      <Label :for="inputId">Push-ups per day</Label>
      <Input
        :id="inputId"
        v-model="value"
        type="number"
        min="1"
        :max="MAX_PUSHUPS_PER_ENTRY"
        step="1"
        inputmode="numeric"
        class="h-11"
      />
    </div>
    <Button
      type="submit"
      size="lg"
      class="h-11"
      :disabled="busy || !valid || (action === 'Save' && Number(value) === target)"
      >{{ action }}</Button
    >
  </form>
</template>
