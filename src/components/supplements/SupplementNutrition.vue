<script setup lang="ts">
import { computed } from 'vue';
import { Info } from '@lucide/vue';
import type { Intake } from '@/domain/state';
import { Button } from '@/components/ui/button';

const props = defineProps<{ entries: Intake[]; hasLabel: boolean }>();
const emit = defineEmits<{ settings: [] }>();
const wheyEntries = computed(() => props.entries.filter((entry) => entry.kind === 'whey'));
const labelMissing = computed(() =>
  wheyEntries.value.some((entry) => entry.calories === null || entry.protein === null),
);
const totals = computed(() =>
  wheyEntries.value.reduce(
    (sum, entry) => ({
      calories: sum.calories + (entry.calories ?? 0),
      protein: sum.protein + (entry.protein ?? 0),
    }),
    { calories: 0, protein: 0 },
  ),
);
</script>

<template>
  <section v-if="wheyEntries.length || !hasLabel" class="flex flex-col gap-3 border-t pt-4">
    <template v-if="wheyEntries.length">
      <h2 class="section-heading">Recorded whey nutrition</h2>
      <p class="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span
          ><strong class="text-lg font-semibold tabular-nums">{{
            Math.round(totals.calories)
          }}</strong>
          kcal</span
        >
        <span
          ><strong class="text-lg font-semibold tabular-nums">{{
            Math.round(totals.protein * 10) / 10
          }}</strong>
          g protein</span
        >
        <span v-if="labelMissing" class="text-muted-foreground">Partial totals</span>
      </p>
      <p v-if="labelMissing" class="text-muted-foreground text-sm leading-5">
        Some entries had no configured label. Their nutrition is unknown, not zero. Updating your
        label does not rewrite historical entries.
      </p>
      <p class="text-muted-foreground text-xs">Whey only, not your whole day.</p>
    </template>
    <Button v-if="!hasLabel" variant="outline" class="w-fit" @click="emit('settings')">
      <Info />Configure your product label
    </Button>
  </section>
</template>
