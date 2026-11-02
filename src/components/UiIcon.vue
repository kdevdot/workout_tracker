<script setup lang="ts">
defineProps<{
  name: 'calendar' | 'history' | 'bottle' | 'settings' | 'arrow' | 'check' | 'back' | 'weights';
}>();
const paths = {
  calendar:
    'M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2',
  history: 'M4 12a8 8 0 1 0 2-5M4 3v5h5m3 0v5l3 2',
  bottle: 'M8 3h8v4l3 4v10H5V11l3-4zM5 14h14M8 7h8',
  settings: 'M4 6h16M4 12h16M4 18h16M9 3v6m6 0v6m-7 0v6',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  weights: 'M3 9v6m4-10v14m0-7h10m0-7v14m4-10v6',
};
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name]" />
  </svg>
</template>
