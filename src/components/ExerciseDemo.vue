<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { Info, Play, RotateCcw, X } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import type { ExerciseDemo } from '@/domain/demos';
import ExerciseIcon from './ExerciseIcon.vue';

const props = defineProps<{ demo: ExerciseDemo; exerciseId: string; exerciseName: string }>();
const root = useTemplateRef<HTMLElement>('root');
const watching = shallowRef(false);
const failed = shallowRef(false);
const retry = shallowRef(0);
const disclosure = computed(() => root.value?.closest('details') ?? null);
const duration = computed(() => Math.ceil(props.demo.durationSeconds));
const source = computed(() => mediaUrl(props.demo.src));
const poster = computed(() => (props.demo.poster ? mediaUrl(props.demo.poster) : undefined));

function mediaUrl(path: string) {
  return path.startsWith('https://') ? path : `${import.meta.env.BASE_URL}${path}`;
}

function stop() {
  watching.value = false;
  failed.value = false;
}

async function close() {
  stop();
  await nextTick();
  root.value?.querySelector<HTMLButtonElement>('[data-quick-demo]')?.focus();
}

function reload() {
  failed.value = false;
  retry.value++;
}

watch([() => props.demo, () => props.exerciseId], stop);
useEventListener(disclosure, 'toggle', () => {
  if (!disclosure.value?.open) stop();
});
</script>

<template>
  <figure ref="root" class="flex min-w-0 flex-col gap-2">
    <div class="flex min-h-11 items-center justify-between gap-3">
      <p class="text-sm font-semibold">Quick demonstration</p>
      <Button v-if="watching" type="button" variant="ghost" class="min-h-11" @click="close">
        <X class="size-4" />Close demo
      </Button>
      <span v-else class="text-muted-foreground text-xs tabular-nums"
        >{{ duration }} sec · loops</span
      >
    </div>

    <p
      v-if="demo.match === 'related'"
      class="bg-coral-soft flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-5"
    >
      <Info class="mt-0.5 size-4 shrink-0" />
      <span><strong>Variation note:</strong> {{ demo.difference }}</span>
    </p>

    <template v-if="watching">
      <video
        v-if="!failed"
        :key="`${exerciseId}-${retry}`"
        :src="source"
        :poster="poster"
        :aria-label="`Quick demonstration: ${exerciseName}`"
        controls
        autoplay
        muted
        loop
        playsinline
        preload="none"
        class="max-h-96 w-full rounded-2xl bg-secondary object-contain"
        @error="failed = true"
      />
      <div v-else role="alert" class="bg-secondary flex flex-col gap-3 rounded-2xl p-4">
        <p class="text-sm font-semibold">This demo couldn’t load.</p>
        <p class="text-muted-foreground text-xs leading-5">
          Check your connection, then retry here. Your workout is still saved. The form checks and
          optional detailed explanation are below.
        </p>
        <Button type="button" variant="outline" class="min-h-11 self-start" @click="reload">
          <RotateCcw class="size-4" />Retry quick demo
        </Button>
      </div>
      <p v-if="!failed" class="text-muted-foreground text-xs leading-5">
        {{ duration }} sec · silent loop · pause or replay with the video controls
      </p>
    </template>

    <button
      v-else
      type="button"
      data-quick-demo
      :aria-label="`Play quick demonstration: ${exerciseName}`"
      class="group/demo focus-visible:ring-ring/60 relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-secondary outline-none focus-visible:ring-2"
      @click="watching = true"
    >
      <img v-if="poster" :src="poster" alt="" class="size-full object-contain" />
      <ExerciseIcon v-else :exercise-id="exerciseId" class="aspect-square h-4/5 opacity-50" />
      <span
        class="bg-card text-foreground absolute flex size-14 items-center justify-center rounded-full shadow-lg transition-transform group-active/demo:scale-95"
      >
        <Play class="ml-0.5 size-6 fill-current" />
      </span>
      <span class="bg-card/95 absolute bottom-2 left-2 rounded-md px-2 py-1 text-xs font-semibold">
        Play {{ duration }}-second demo
      </span>
    </button>

    <figcaption class="text-muted-foreground text-[11px] leading-5">
      <a
        :href="demo.creditUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-2"
      >
        {{ demo.credit }}</a
      >
      ·
      <a
        :href="demo.licenceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-2"
      >
        {{ demo.licence }}</a
      >
      · needs internet
    </figcaption>
  </figure>
</template>
