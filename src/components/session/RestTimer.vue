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
        'flex items-center gap-2 rounded-xl py-2 pr-1 pl-2',
        done ? 'bg-coral-soft text-coral' : 'bg-card',
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
      <BellRing v-if="done" class="size-5" />
    </span>
    <div class="flex flex-1 flex-col">
      <strong class="font-display text-2xl leading-none font-semibold tabular-nums">{{
        done ? 'Ready' : display
      }}</strong>
      <span class="text-muted-foreground text-xs" :class="done && 'text-coral'">{{
        done ? 'Rest complete' : 'Rest'
      }}</span>
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
      size="icon-lg"
      class="rounded-lg hover:text-current"
      aria-label="Dismiss rest timer"
      :disabled="busy"
      @click="emit('dismiss')"
      ><X class="size-5"
    /></Button>
  </aside>
</template>
