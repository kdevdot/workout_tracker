<script setup lang="ts">
import { BellRing, X } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

defineProps<{ display: string; done: boolean; busy: boolean; fraction: number }>();
const emit = defineEmits<{ dismiss: []; adjust: [seconds: number] }>();
// Ring geometry: r = 20 in a 48 × 48 box.
const circumference = 2 * Math.PI * 20;
</script>

<template>
  <aside
    role="timer"
    aria-label="Rest timer"
    :class="
      cn(
        'pop-in fixed inset-x-0 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-20 mx-auto flex w-[calc(100%-2.5rem)] max-w-[28rem] items-center gap-3 rounded-[22px] py-2 pr-2 pl-2 shadow-[0_16px_40px_-12px_#000000d9] ring-1 backdrop-blur-xl',
        done ? 'bg-coral text-primary-foreground ring-coral' : 'bg-card/90 ring-white/10',
      )
    "
  >
    <span class="relative flex size-12 shrink-0 items-center justify-center">
      <svg viewBox="0 0 48 48" class="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-opacity=".12"
          stroke-width="4"
        />
        <circle
          v-if="!done"
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="var(--primary)"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference * (1 - fraction)"
          class="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>
      <BellRing v-if="done" class="size-5 animate-bounce" />
    </span>
    <div class="flex flex-1 flex-col">
      <strong class="font-display condensed text-[28px] leading-none font-bold tabular-nums">{{
        done ? 'Go' : display
      }}</strong>
      <span class="text-[11px] font-medium opacity-70">{{ done ? 'Rest complete' : 'rest' }}</span>
    </div>
    <template v-if="!done">
      <Button
        variant="ghost"
        size="sm"
        class="h-10 rounded-xl px-2.5 tabular-nums"
        aria-label="15 seconds less rest"
        :disabled="busy"
        @click="emit('adjust', -15)"
        >−15</Button
      >
      <Button
        variant="ghost"
        size="sm"
        class="h-10 rounded-xl px-2.5 tabular-nums"
        aria-label="15 seconds more rest"
        :disabled="busy"
        @click="emit('adjust', 15)"
        >+15</Button
      >
    </template>
    <Button
      variant="ghost"
      size="icon"
      class="size-10 rounded-xl hover:bg-white/15 hover:text-current"
      aria-label="Dismiss rest timer"
      :disabled="busy"
      @click="emit('dismiss')"
      ><X class="size-5"
    /></Button>
  </aside>
</template>
