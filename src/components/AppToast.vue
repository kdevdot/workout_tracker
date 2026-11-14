<script setup lang="ts">
import { CircleCheck, X } from '@lucide/vue';

defineProps<{ message: string }>();
const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
  <Transition name="toast">
    <div
      v-if="message"
      role="status"
      class="bg-secondary text-foreground fixed inset-x-5 top-[calc(env(safe-area-inset-top)+0.75rem)] z-40 mx-auto flex max-w-md items-center gap-2.5 rounded-xl py-1 pr-1 pl-3.5 text-sm font-medium shadow-lg"
    >
      <CircleCheck class="text-primary size-4 shrink-0" />
      <span class="flex-1">{{ message }}</span>
      <button
        type="button"
        aria-label="Dismiss message"
        class="text-muted-foreground focus-visible:ring-ring/60 flex size-11 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-2"
        @click="emit('dismiss')"
      >
        <X class="size-4" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
