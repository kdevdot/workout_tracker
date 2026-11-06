<script setup lang="ts">
import { BellRing, Timer } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

defineProps<{ display: string; done: boolean; busy: boolean }>();
const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
  <aside
    role="timer"
    aria-label="Rest timer"
    :class="
      cn(
        'fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 mx-auto flex w-[calc(100%-2.5rem)] max-w-[28rem] items-center gap-3 rounded-xl py-2.5 pr-2 pl-4 shadow-lg',
        done ? 'bg-coral text-white' : 'bg-foreground text-background',
      )
    "
  >
    <component :is="done ? BellRing : Timer" class="size-5 shrink-0" />
    <div class="flex flex-1 items-baseline gap-2">
      <strong class="font-display text-2xl leading-none font-semibold tabular-nums">{{
        done ? 'Rest complete' : display
      }}</strong>
      <span class="text-xs opacity-75">{{ done ? 'Go when ready' : 'rest' }}</span>
    </div>
    <Button
      variant="ghost"
      size="sm"
      class="hover:bg-white/15 hover:text-current"
      :disabled="busy"
      @click="emit('dismiss')"
      >Dismiss</Button
    >
  </aside>
</template>
