<script setup lang="ts">
import BodyMap from './BodyMap.vue';
defineProps<{ primary: string[]; supporting: string[] }>();
</script>

<template>
  <section class="flex flex-col" role="region" aria-labelledby="muscle-heading">
    <div class="flex items-center justify-between gap-2">
      <h3 id="muscle-heading" class="section-heading">Muscle focus</h3>
      <div class="text-muted-foreground flex gap-3 text-[10px] font-medium">
        <span class="flex items-center gap-1.5"
          ><i class="size-1.5 rounded-full bg-coral" />Primary</span
        >
        <span class="flex items-center gap-1.5"
          ><i class="size-1.5 rounded-full bg-primary" />Supporting</span
        >
      </div>
    </div>
    <div class="mt-4 grid grid-cols-[minmax(0,130px)_1fr] items-center gap-4">
      <BodyMap :primary="primary" :supporting="supporting" class="mx-auto w-full max-w-52" />
      <div class="flex flex-col gap-2">
        <ul v-if="primary.length" class="flex flex-wrap gap-1.5">
          <li
            v-for="muscle in primary"
            :key="muscle"
            class="bg-coral-soft text-coral rounded-full px-2.5 py-1 text-[11px] font-semibold"
          >
            {{ muscle }}
          </li>
          <li
            v-for="muscle in supporting"
            :key="muscle"
            class="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-[11px] font-medium"
          >
            {{ muscle }}
          </li>
        </ul>
        <p v-else class="text-xs leading-6">
          Rest from lifting. Daily supplement tracking is still available.
        </p>
      </div>
    </div>
  </section>
</template>
