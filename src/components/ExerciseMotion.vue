<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue';
import {
  useDocumentVisibility,
  useElementVisibility,
  usePreferredReducedMotion,
  useRafFn,
} from '@vueuse/core';
import { Pause, Play, RotateCcw, StepForward } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { motionFrame, type MotionKind } from '@/domain/exercise-motion';

const props = defineProps<{ kind: MotionKind; label: string; playing: boolean }>();
const root = useTemplateRef<HTMLElement>('root');
const phase = shallowRef(0);
const paused = shallowRef(false);
const visible = useElementVisibility(root);
const documentVisibility = useDocumentVisibility();
const reduced = usePreferredReducedMotion();
const frame = computed(() => motionFrame(props.kind, phase.value));
const { pause, resume } = useRafFn(
  ({ delta }) => {
    phase.value = (phase.value + Math.min(delta, 64) / 5000) % 1;
  },
  { immediate: false },
);
watch(
  () =>
    props.playing &&
    !paused.value &&
    visible.value &&
    documentVisibility.value === 'visible' &&
    reduced.value !== 'reduce',
  (run) => (run ? resume() : pause()),
  { immediate: true },
);
watch(
  () => props.kind,
  () => {
    phase.value = 0;
    paused.value = false;
  },
);
function restart() {
  phase.value = 0;
  paused.value = false;
}
</script>

<template>
  <component
    :is="playing ? 'div' : 'span'"
    ref="root"
    class="motion-demo flex w-full flex-col gap-2"
  >
    <svg
      viewBox="0 0 320 200"
      width="320"
      height="200"
      role="img"
      :aria-label="`${label}. ${frame.view}. ${frame.cue}`"
      class="h-auto w-full rounded-2xl bg-background"
      :data-motion="kind"
      :data-phase="phase.toFixed(3)"
    >
      <g class="motion-equipment" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line
          v-for="(line, index) in frame.equipment"
          :key="`e-${index}`"
          :x1="line.a[0]"
          :y1="line.a[1]"
          :x2="line.b[0]"
          :y2="line.b[1]"
          :stroke-width="line.width"
        />
      </g>
      <g class="motion-pads">
        <rect
          v-for="(box, index) in frame.pads"
          :key="`p-${index}`"
          :x="box.x"
          :y="box.y"
          :width="box.w"
          :height="box.h"
          rx="3"
        />
      </g>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line
          v-for="(line, index) in frame.body"
          :key="`b-${index}`"
          :x1="line.a[0]"
          :y1="line.a[1]"
          :x2="line.b[0]"
          :y2="line.b[1]"
          :stroke-width="line.width"
          :class="
            line.tone === 'active'
              ? 'motion-active'
              : line.tone === 'muted'
                ? 'motion-far'
                : 'motion-body'
          "
        />
      </g>
      <circle :cx="frame.head[0]" :cy="frame.head[1]" r="10" class="motion-head" />
      <line
        v-if="frame.nose"
        :x1="frame.head[0]"
        :y1="frame.head[1] + 8"
        :x2="frame.nose[0]"
        :y2="frame.nose[1]"
        class="motion-body"
        stroke-width="4"
        stroke-linecap="round"
      />
      <g class="motion-weights">
        <circle
          v-for="(disc, index) in frame.weights"
          :key="`w-${index}`"
          :cx="disc.at[0]"
          :cy="disc.at[1]"
          :r="disc.r"
        />
      </g>
    </svg>
    <template v-if="playing">
      <p class="text-muted-foreground text-xs">{{ frame.view }} · {{ frame.cue }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-if="reduced === 'reduce'"
          type="button"
          variant="outline"
          class="min-h-11"
          @click="phase = phase < 0.25 ? 0.5 : 0"
        >
          <StepForward class="size-4" />Next position
        </Button>
        <Button v-else type="button" variant="outline" class="min-h-11" @click="paused = !paused">
          <Play v-if="paused" class="size-4" /><Pause v-else class="size-4" />{{
            paused ? 'Resume animation' : 'Pause animation'
          }}
        </Button>
        <Button type="button" variant="ghost" class="min-h-11" @click="restart"
          ><RotateCcw class="size-4" />Restart</Button
        >
      </div>
    </template>
  </component>
</template>

<style scoped>
.motion-equipment {
  stroke: var(--muted-foreground);
}
.motion-pads {
  fill: var(--input);
  stroke: var(--muted-foreground);
  stroke-width: 1;
}
.motion-body {
  stroke: var(--foreground);
}
.motion-far {
  stroke: var(--muted-foreground);
}
.motion-active {
  stroke: var(--primary);
}
.motion-head {
  fill: var(--foreground);
}
.motion-weights {
  fill: var(--secondary);
  stroke: var(--foreground);
  stroke-width: 2;
}
</style>
