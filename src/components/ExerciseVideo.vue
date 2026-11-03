<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { Info, Play, X } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { VIDEO_CREDIT, type Video } from '@/domain/guides';

const props = defineProps<{ video: Video; exerciseName: string }>();
const root = useTemplateRef<HTMLElement>('root');
const localPlayer = useTemplateRef<HTMLVideoElement>('localPlayer');
const watching = shallowRef(false);
const retry = shallowRef(0);
const base = import.meta.env.BASE_URL;
const disclosure = computed(() => root.value?.closest('details') ?? null);
const embedUrl = computed(() => {
  if (props.video.provider !== 'youtube') return '';
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    autoplay: '1',
    enablejsapi: '1',
    origin: window.location.origin,
  });
  return `https://www.youtube-nocookie.com/embed/${props.video.id}?${params}`;
});

function stop() {
  watching.value = false;
  localPlayer.value?.pause();
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
    <template v-if="video.provider === 'youtube'">
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
      <template v-else>
        <Button type="button" data-watch class="min-h-12 w-full" @click="watching = true">
          <Play class="size-4" />Watch demonstration here
        </Button>
        <p class="text-muted-foreground text-xs leading-5">
          Plays inside this exercise guide. Tapping loads YouTube; internet is required and ads may
          appear. No video is downloaded.
        </p>
      </template>
      <figcaption class="text-muted-foreground text-[11px]">
        {{ video.author }} · {{ video.title }} · YouTube embed, not an open-licence download
      </figcaption>
    </template>
    <template v-else>
      <video
        ref="localPlayer"
        :src="`${base}videos/wger-${video.id}.mp4`"
        :poster="`${base}videos/wger-${video.id}.jpg`"
        :aria-label="`Demonstration: ${exerciseName}`"
        class="bg-muted aspect-video w-full rounded-xl object-cover"
        controls
        muted
        loop
        playsinline
        preload="none"
      />
      <figcaption class="text-muted-foreground text-[11px]">
        Video: {{ VIDEO_CREDIT.author }} ·
        <a
          class="underline underline-offset-2"
          :href="`https://wger.de/en/exercise/${video.exercise}/view/`"
          target="_blank"
          rel="noopener"
          >{{ VIDEO_CREDIT.source }}</a
        >
        ·
        <a
          class="underline underline-offset-2"
          :href="VIDEO_CREDIT.licenceUrl"
          target="_blank"
          rel="noopener"
          >{{ VIDEO_CREDIT.licence }}</a
        >
        · audio removed, resized
      </figcaption>
    </template>
    <p
      v-if="video.variant"
      class="bg-coral-soft flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
    >
      <Info class="mt-0.5 size-3.5 shrink-0" />{{ video.variant }}
    </p>
  </figure>
</template>
