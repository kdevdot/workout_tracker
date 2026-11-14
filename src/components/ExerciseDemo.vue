<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { Info, Play, RotateCcw, X } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import type { ExerciseDemo } from '@/domain/demos';
import ExerciseMotion from './ExerciseMotion.vue';

const props = defineProps<{ demo: ExerciseDemo; exerciseId: string; exerciseName: string }>();
const root = useTemplateRef<HTMLElement>('root');
const watching = shallowRef(false);
const failed = shallowRef(false);
const posterFailed = shallowRef(false);
const retry = shallowRef(0);
const disclosure = computed(() => root.value?.closest('details') ?? null);
const duration = computed(() => Math.ceil(props.demo.durationSeconds));
const source = computed(() => {
  if (props.demo.kind === 'file') return mediaUrl(props.demo.src);
  if (props.demo.kind === 'animation') return undefined;
  const params = new URLSearchParams({
    autoplay: '1',
    muted: '1',
    loop: '1',
    playsinline: '1',
    dnt: '1',
  });
  return `https://player.vimeo.com/video/${props.demo.videoId}?${params}`;
});
const poster = computed(() =>
  props.demo.kind === 'animation' ? undefined : mediaUrl(props.demo.poster),
);

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

watch([() => props.demo, () => props.exerciseId], () => {
  stop();
  posterFailed.value = false;
});
useEventListener(disclosure, 'toggle', () => {
  if (!disclosure.value?.open) stop();
});
</script>

<template>
  <figure ref="root" class="flex min-w-0 flex-col gap-2">
    <div class="flex min-h-11 items-center justify-between gap-3">
      <p class="text-sm font-semibold">Exercise demonstration</p>
      <Button v-if="watching" type="button" variant="ghost" class="min-h-11" @click="close">
        <X class="size-4" />Close demo
      </Button>
      <span v-else class="text-muted-foreground text-xs tabular-nums">{{
        demo.kind === 'animation' ? 'Movement animation' : `${duration} sec · loops`
      }}</span>
    </div>

    <p
      v-if="demo.match === 'related'"
      class="bg-coral-soft flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-5"
    >
      <Info class="mt-0.5 size-4 shrink-0" />
      <span><strong>Variation note:</strong> {{ demo.difference }}</span>
    </p>

    <template v-if="watching">
      <ExerciseMotion
        v-if="demo.kind === 'animation'"
        :kind="demo.motion"
        :label="exerciseName"
        :playing="true"
      />
      <video
        v-else-if="!failed && demo.kind === 'file'"
        :key="`${exerciseId}-${retry}`"
        :src="source"
        :poster="poster"
        :aria-label="`Exercise demonstration: ${exerciseName}`"
        controls
        autoplay
        muted
        loop
        playsinline
        preload="none"
        class="max-h-96 w-full rounded-2xl bg-secondary object-contain"
        @error="failed = true"
      />
      <div v-else-if="!failed" class="relative aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          :key="`${exerciseId}-${retry}`"
          :src="source"
          :title="`Exercise demonstration: ${exerciseName}`"
          class="absolute inset-0 size-full border-0"
          width="560"
          height="315"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          @error="failed = true"
        />
      </div>
      <div v-else role="alert" class="bg-secondary flex flex-col gap-3 rounded-2xl p-4">
        <p class="text-sm font-semibold">This demo couldn’t load.</p>
        <p class="text-muted-foreground text-xs leading-5">
          Check your connection, then retry here. Your workout is still saved. The form checks are
          below.
        </p>
        <Button type="button" variant="outline" class="min-h-11 self-start" @click="reload">
          <RotateCcw class="size-4" />Retry demo
        </Button>
      </div>
      <p
        v-if="!failed && demo.kind !== 'animation'"
        class="text-muted-foreground text-xs leading-5"
      >
        {{ duration }} sec · starts muted · pause or replay with the video controls
      </p>
      <details v-if="!failed && demo.kind === 'vimeo'" class="text-muted-foreground text-xs">
        <summary class="flex min-h-11 cursor-pointer items-center font-medium">
          Video not playing?
        </summary>
        <p class="mb-2 leading-5">Check your connection, then reload the player here.</p>
        <Button type="button" variant="outline" class="min-h-11" @click="reload">
          <RotateCcw class="size-4" />Retry demo
        </Button>
      </details>
    </template>

    <button
      v-else
      type="button"
      data-quick-demo
      :aria-label="`Play demonstration: ${exerciseName}`"
      class="group/demo focus-visible:ring-ring/60 relative flex items-center justify-center overflow-hidden rounded-2xl bg-secondary outline-none focus-visible:ring-2"
      :class="demo.kind === 'animation' ? 'aspect-[8/5]' : 'aspect-video'"
      @click="watching = true"
    >
      <ExerciseMotion
        v-if="demo.kind === 'animation'"
        :kind="demo.motion"
        :label="exerciseName"
        :playing="false"
      />
      <img
        v-else-if="!posterFailed"
        :src="poster"
        alt=""
        loading="lazy"
        decoding="async"
        class="size-full object-contain"
        @error="posterFailed = true"
      />
      <span v-else class="text-muted-foreground absolute top-3 px-4 text-sm font-medium">
        {{ exerciseName }}
      </span>
      <span
        class="bg-card text-foreground absolute flex size-14 items-center justify-center rounded-full shadow-lg transition-transform group-active/demo:scale-95"
      >
        <Play class="ml-0.5 size-6 fill-current" />
      </span>
      <span class="bg-card/95 absolute bottom-2 left-2 rounded-md px-2 py-1 text-xs font-semibold">
        {{
          demo.kind === 'animation' ? 'Play movement animation' : `Play ${duration}-second video`
        }}
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
      <template v-if="demo.kind === 'file'">
        ·
        <a
          :href="demo.licenceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2"
          >{{ demo.licence }}</a
        >
      </template>
      <template v-else-if="demo.kind === 'vimeo'"> · Vimeo</template>
      <template v-if="demo.kind !== 'animation'"> · needs internet</template>
    </figcaption>
  </figure>
</template>
