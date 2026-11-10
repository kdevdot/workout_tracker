<script setup lang="ts">
import { computed } from 'vue';
import { FRONT_MUSCLES, musclesFor } from '@/domain/guides';
import { cn } from '@/lib/utils';

const props = defineProps<{ primary: string[]; supporting: string[]; class?: string }>();
const base = import.meta.env.BASE_URL;

const primaryIds = computed(() => musclesFor(props.primary));
const supportingIds = computed(() =>
  musclesFor(props.supporting).filter((id) => !primaryIds.value.includes(id)),
);
const views = computed(() =>
  (['front', 'back'] as const).map((side) => {
    const onSide = (id: number) => FRONT_MUSCLES.has(id) === (side === 'front');
    return {
      side,
      layers: [
        ...supportingIds.value.filter(onSide).map((id) => `s-${id}`),
        ...primaryIds.value.filter(onSide).map((id) => `p-${id}`),
      ],
    };
  }),
);
const label = computed(() =>
  props.primary.length
    ? `Body map. Primary: ${props.primary.join(', ')}.${props.supporting.length ? ` Supporting: ${props.supporting.join(', ')}.` : ''}`
    : 'Body map with no muscles highlighted',
);
</script>

<template>
  <figure role="img" :aria-label="label" :class="cn('grid grid-cols-2 gap-1', props.class)">
    <div v-for="view in views" :key="view.side" class="flex flex-col items-center gap-1">
      <div class="relative w-full">
        <img :src="`${base}muscles/${view.side}.svg`" alt="" class="w-full opacity-60 invert" />
        <img
          v-for="layer in view.layers"
          :key="layer"
          :src="`${base}muscles/${layer}.svg`"
          alt=""
          :class="cn('absolute inset-x-0 top-0 w-full', layer.startsWith('s-') && 'opacity-60')"
        />
      </div>
      <span class="text-muted-foreground text-[9px] font-medium uppercase">
        {{ view.side }}
      </span>
    </div>
  </figure>
</template>
