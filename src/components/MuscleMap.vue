<script setup lang="ts">
import BodyMap from './BodyMap.vue';
defineProps<{ primary: string[]; supporting: string[] }>();
</script>

<template>
  <section
    class="muscle-panel bg-card rounded-xl p-5"
    role="region"
    aria-labelledby="muscle-heading"
  >
    <div class="flex items-center justify-between gap-2">
      <h3 id="muscle-heading" class="section-heading text-2xl">Muscle focus</h3>
      <div class="text-muted-foreground flex gap-3 text-[10px] font-medium">
        <span class="flex items-center gap-1.5"
          ><i class="size-1.5 rounded-full bg-[#a94f36]" />Primary</span
        >
        <span class="flex items-center gap-1.5"
          ><i class="size-1.5 rounded-full bg-[#6f9a82]" />Supporting</span
        >
      </div>
    </div>
    <div class="mt-4 grid grid-cols-[minmax(0,130px)_1fr] items-center gap-4">
      <BodyMap :primary="primary" :supporting="supporting" class="mx-auto w-full max-w-52" />
      <div class="flex flex-col gap-2">
        <p v-if="primary.length" class="text-xs leading-6 font-medium">{{ primary.join(' · ') }}</p>
        <p v-else class="text-xs leading-6">
          Rest from lifting. Daily supplement tracking is still available.
        </p>
      </div>
    </div>
  </section>
</template>
