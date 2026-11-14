<script setup lang="ts">
import { shallowRef } from 'vue';
import { RotateCcw } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import PushupTargetForm from './PushupTargetForm.vue';
defineProps<{ target: number; busy: boolean }>();
const emit = defineEmits<{ target: [target: number]; reset: [] }>();
const confirmingReset = shallowRef(false);
function reset() {
  emit('reset');
  confirmingReset.value = false;
}
</script>

<template>
  <details class="group bg-card rounded-xl px-4">
    <summary class="flex min-h-12 items-center text-sm font-semibold">Tracker settings</summary>
    <div class="flex flex-col gap-3 pb-4">
      <PushupTargetForm
        :target="target"
        :busy="busy"
        input-id="pushup-daily"
        action="Save"
        @submit="emit('target', $event)"
      />
      <p class="text-muted-foreground text-xs">Changing the target re-scores every day.</p>
      <Button
        v-if="!confirmingReset"
        variant="ghost"
        class="text-destructive w-fit"
        @click="confirmingReset = true"
        ><RotateCcw />Start over from today</Button
      >
      <div v-else class="bg-coral-soft/60 flex flex-col gap-2 rounded-lg p-3 text-sm">
        <p>This deletes all push-up entries and starts from zero. It can't be undone.</p>
        <div class="flex gap-2">
          <Button variant="destructive" :disabled="busy" @click="reset">Delete and restart</Button>
          <Button variant="ghost" @click="confirmingReset = false">Keep it</Button>
        </div>
      </div>
    </div>
  </details>
</template>
