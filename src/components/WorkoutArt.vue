<script setup lang="ts">
defineProps<{ rest: boolean }>();
</script>

<template>
  <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false">
    <circle cx="48" cy="48" r="44" fill="#f0f6fa" />
    <circle cx="48" cy="48" r="43" stroke="#c5dfed" stroke-dasharray="2 6" />
    <g v-if="!rest" stroke="#09638b" stroke-width="2">
      <circle cx="48" cy="48" r="30" fill="#e2eff6" />
      <circle cx="48" cy="48" r="24" stroke="#9fc9de" />
      <circle cx="48" cy="48" r="6" fill="white" />
      <path d="M48 25v7m0 32v7M25 48h7m32 0h7" stroke-linecap="round" />
      <path d="m31 31 4 4m26 26 4 4m-34 0 4-4m26-26 4-4" stroke="#9fc9de" stroke-linecap="round" />
    </g>
    <g v-else stroke="#09638b" stroke-width="2" stroke-linejoin="round">
      <path d="M58 25a25 25 0 1 0 13 37A29 29 0 0 1 58 25Z" fill="#e2eff6" />
      <path d="M68 26v10m-5-5h10M75 46v6m-3-3h6" stroke-linecap="round" />
    </g>
    <path
      d="M11 73h9m-4-4v8M76 15h9m-4-4v8"
      stroke="#91bbd0"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>
