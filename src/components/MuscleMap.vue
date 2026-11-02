<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BodyMap from './BodyMap.vue';
defineProps<{ primary: string[]; supporting: string[] }>();
</script>

<template>
  <Card class="gap-4 py-5" role="region" aria-labelledby="muscle-heading">
    <CardHeader class="flex items-center justify-between px-5">
      <CardTitle id="muscle-heading">Muscle focus</CardTitle>
      <div class="text-muted-foreground flex gap-3 text-xs font-medium">
        <span class="flex items-center gap-1.5"
          ><i class="bg-coral size-2 rounded-full" />Primary</span
        >
        <span class="flex items-center gap-1.5"
          ><i class="size-2 rounded-full bg-[#6f9a82]" />Supporting</span
        >
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-3 px-5">
      <BodyMap :primary="primary" :supporting="supporting" class="mx-auto w-full max-w-xs" />
      <p v-if="!primary.length" class="text-sm">
        Rest from lifting. Daily supplement tracking is still available.
      </p>
      <p class="text-muted-foreground text-xs leading-5">
        Target regions, not measured activation or recovery. Shoulder heads are drawn as one region.
      </p>
    </CardContent>
  </Card>
</template>
