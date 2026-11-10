<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { Info, Play, X } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import type { Video } from '@/domain/guides';
import ExerciseIcon from './ExerciseIcon.vue';

const props = defineProps<{ video: Video; exerciseId: string; exerciseName: string }>();
const root = useTemplateRef<HTMLElement>('root');
const watching = shallowRef(false);
const retry = shallowRef(0);
const disclosure = computed(() => root.value?.closest('details') ?? null);
const embedUrl = computed(() => {
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    autoplay: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${props.video.id}?${params}`;
});

function stop() {
  watching.value = false;
}

async function close() {
  stop();
  await nextTick();
  root.value?.querySelector<HTMLButtonElement>('[data-watch]')?.focus();
}

watch(() => props.video, stop);
useEventListener(disclosure, 'toggle', () => {
  if (!disclosure.value?.open) stop();
});
</script>

<template>
  <figure ref="root" class="flex min-w-0 flex-col gap-2">
    <template v-if="watching">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-semibold">Demonstration · in-app player</p>
        <Button type="button" variant="ghost" class="min-h-11" @click="close">
          <X class="size-4" />Close video
        </Button>
      </div>
      <div class="relative aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          :key="`${video.id}-${retry}`"
          :src="embedUrl"
          :title="`Demonstration: ${exerciseName}`"
          class="absolute inset-0 h-full w-full border-0"
          width="560"
          height="315"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        />
      </div>
      <details class="text-muted-foreground text-xs">
        <summary class="flex min-h-11 cursor-pointer items-center font-medium">
          Video not playing?
        </summary>
        <p class="mb-2 leading-5">
          Check your connection. YouTube or your browser may block embedded playback. Retrying
          reloads the player here; it does not open another app.
        </p>
        <Button type="button" variant="outline" class="min-h-11" @click="retry++">
          Retry video here
        </Button>
      </details>
    </template>
    <!-- Poster uses the local drawing, so nothing reaches YouTube until you tap. -->
    <button
      v-else
      type="button"
      data-watch
      :aria-label="`Watch demonstration: ${exerciseName}`"
      class="group/poster focus-visible:ring-ring/60 relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-secondary outline-none ring-1 ring-white/5 focus-visible:ring-2"
      @click="watching = true"
    >
      <ExerciseIcon :exercise-id="exerciseId" class="aspect-square h-4/5 opacity-50" />
      <span
        class="bg-primary text-primary-foreground absolute flex size-14 items-center justify-center rounded-full shadow-[0_0_0_8px_#d4f53c26,0_10px_30px_-6px_#d4f53c99] transition-transform group-active/poster:scale-95"
        ><Play class="ml-0.5 size-6 fill-current"
      /></span>
      <span class="bg-card/90 absolute bottom-2 left-2 rounded-md px-2 py-1 text-xs font-semibold"
        >Watch demo</span
      >
    </button>
    <figcaption class="text-muted-foreground text-[11px] leading-4">
      {{ video.author }} · {{ video.title }} · YouTube, needs internet, may show ads
    </figcaption>
    <p
      v-if="video.variant"
      class="bg-coral-soft flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
    >
      <Info class="mt-0.5 size-3.5 shrink-0" />{{ video.variant }}
    </p>
  </figure>
</template>
