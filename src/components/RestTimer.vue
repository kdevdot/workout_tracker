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
        'fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 mx-auto flex w-[calc(100%-2.5rem)] max-w-[24rem] items-center gap-3 rounded-2xl p-3 pl-4 shadow-xl',
        done ? 'bg-coral text-white' : 'bg-foreground text-background',
      )
    "
  >
    <component :is="done ? BellRing : Timer" class="size-6 shrink-0" />
    <div class="flex flex-1 flex-col">
      <strong class="text-2xl leading-none font-extrabold tabular-nums">{{
        done ? 'Rest complete' : display
      }}</strong>
      <span class="text-xs opacity-75">{{
        done ? 'Continue when ready.' : 'Rest timer · continues when backgrounded'
      }}</span>
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
