<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown, Dumbbell } from '@lucide/vue';
import type { Session } from '@/domain/state';
import { formatDate } from '@/domain/dates';
import { formatSet, sessionProgress } from '@/domain/sessions';
import { workouts } from '@/domain/programme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const props = defineProps<{ sessions: Session[] }>();
const emit = defineEmits<{ resume: [id: string] }>();

const entries = computed(() =>
  [...props.sessions]
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) || second.startedAt.localeCompare(first.startedAt),
    )
    .map((session) => {
      const progress = sessionProgress(session);
      const status =
        session.status === 'active'
          ? 'In progress'
          : progress.done < progress.total
            ? 'Completed · partial'
            : 'Completed';
      return { session, progress, status };
    }),
);
</script>

<template>
  <header class="flex flex-col gap-1">
    <h1 class="text-[2.1rem] leading-tight font-extrabold tracking-tight">Training history</h1>
    <p class="text-muted-foreground text-sm">
      Your real sessions. Partial workouts stay partial; drafts can be resumed.
    </p>
  </header>

  <div
    v-if="!entries.length"
    class="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-12 text-center"
  >
    <Dumbbell class="text-muted-foreground size-8" :stroke-width="1.5" />
    <h2 class="font-bold">Your first session starts here.</h2>
    <p class="text-muted-foreground text-sm">
      Record a set from the plan. It will appear here immediately after saving.
    </p>
  </div>

  <details
    v-for="{ session, progress, status } in entries"
    :key="session.id"
    class="group bg-card rounded-2xl border"
  >
    <summary class="flex flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col">
          <strong class="text-lg font-bold">{{ workouts[session.workoutId].name }}</strong>
          <small class="text-muted-foreground text-xs">{{
            formatDate(session.date, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          }}</small>
        </div>
        <div class="flex items-center gap-2">
          <Badge :variant="session.status === 'active' ? 'default' : 'secondary'">{{
            status
          }}</Badge>
          <ChevronDown class="size-4 transition-transform group-open:rotate-180" />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Progress :model-value="(progress.done / progress.total) * 100" class="h-1.5" />
        <span class="text-muted-foreground text-xs font-semibold whitespace-nowrap tabular-nums"
          >{{ progress.done }}/{{ progress.total }} sets</span
        >
      </div>
    </summary>
    <div class="flex flex-col gap-3 border-t p-4">
      <p class="text-muted-foreground text-xs">
        {{ session.phase === 'intro' ? 'Introduction' : 'Baseline' }} · recorded prescriptions
        retained
      </p>
      <div v-for="item in session.exercises" :key="item.exercise.id" class="text-sm">
        <strong class="font-semibold">{{ item.exercise.name }}</strong>
        <p v-if="!item.logs.length" class="text-muted-foreground">No sets recorded</p>
        <ol v-else class="text-muted-foreground tabular-nums">
          <li v-for="log in item.logs" :key="log.index">
            Set {{ log.index }} · {{ formatSet(log, item.exercise) }}
          </li>
        </ol>
      </div>
      <Button v-if="session.status === 'active'" @click="emit('resume', session.id)"
        >Resume this workout</Button
      >
    </div>
  </details>
</template>
