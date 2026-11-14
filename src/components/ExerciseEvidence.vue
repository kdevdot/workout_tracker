<script setup lang="ts">
import { BookOpen, ChevronDown, ExternalLink } from '@lucide/vue';
import type { GuideEvidence } from '@/domain/research';

defineProps<{ evidence: GuideEvidence }>();
</script>

<template>
  <details class="group/evidence rounded-xl border border-border px-3">
    <summary class="flex min-h-11 items-center gap-2 text-xs font-semibold">
      <BookOpen class="size-3.5 shrink-0" />Why this exercise
      <ChevronDown
        class="ml-auto size-4 shrink-0 transition-transform group-open/evidence:rotate-180"
      />
    </summary>
    <div class="flex flex-col gap-3 pb-3 text-xs leading-5">
      <p>{{ evidence.selection }}</p>
      <p class="text-muted-foreground">{{ evidence.qualification }}</p>
      <ul class="flex flex-col gap-2">
        <li v-for="source in evidence.sources" :key="source.url">
          <a
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary inline-flex min-h-11 items-center gap-2 underline underline-offset-2"
          >
            <span>
              <strong>{{ source.authors }} · {{ source.year }}</strong>
              <span class="block">{{ source.title }}</span>
            </span>
            <ExternalLink class="size-3 shrink-0" />
          </a>
        </li>
      </ul>
    </div>
  </details>
</template>
