<script setup lang="ts">
import { RefreshCw } from '@lucide/vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { Button } from '@/components/ui/button';

defineProps<{ busy: boolean }>();
// Reload only when the user agrees, so a new version never wipes a half-typed set.
const { needRefresh, updateServiceWorker } = useRegisterSW();
</script>

<template>
  <div
    v-if="needRefresh"
    role="status"
    class="bg-card fixed inset-x-5 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 mx-auto flex max-w-md items-center gap-2.5 rounded-xl border py-1.5 pr-1.5 pl-3.5 text-sm font-medium shadow-lg"
  >
    <RefreshCw class="text-primary size-4 shrink-0" />
    <span class="flex-1">A new version is ready.</span>
    <Button size="sm" :disabled="busy" @click="updateServiceWorker()">Update</Button>
    <Button size="sm" variant="ghost" @click="needRefresh = false">Later</Button>
  </div>
</template>
