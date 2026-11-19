<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown, Dumbbell } from '@lucide/vue';
import type { Session } from '@/domain/state';
import { formatDate } from '@/domain/dates';
import { formatSet, sessionProgress } from '@/domain/sessions';
import { workouts } from '@/domain/programme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ExerciseProgress from '@/components/session/ExerciseProgress.vue';
import ExerciseIcon from '@/components/ExerciseIcon.vue';

const props = defineProps<{ sessions: Session[] }>();
const emit = defineEmits<{ resume: [id: string]; plan: [] }>();

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
      const recordedSets = session.exercises.reduce((sum, item) => sum + item.logs.length, 0);
      return { session, progress, status, recordedSets };
    }),
);
</script>

<template>
  <header class="page-header">
    <h1 class="page-heading">Training history</h1>
    <p class="text-muted-foreground text-sm leading-5">
      Open a session to review your sets or pick up where you left off.
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
    <Button class="mt-3" @click="emit('plan')">Go to your plan</Button>
  </div>

  <details
    v-for="{ session, progress, status, recordedSets } in entries"
    :key="session.id"
    class="group bg-card surface-edge rounded-2xl"
  >
    <summary class="flex flex-col gap-3 p-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <strong class="font-display min-w-0 text-xl font-semibold">{{
          workouts[session.workoutId].name
        }}</strong>
        <div class="flex max-w-full shrink-0 items-center gap-2">
          <Badge variant="secondary" class="min-w-0 whitespace-normal">{{ status }}</Badge>
          <ChevronDown
            class="size-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </div>
      </div>
      <div class="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <time :datetime="session.date">{{
          formatDate(session.date, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        }}</time>
        <span class="tabular-nums">{{ recordedSets }} sets recorded</span>
      </div>
      <div class="flex items-center gap-3">
        <ExerciseProgress :exercises="session.exercises" class="flex-1" />
        <span class="text-muted-foreground text-xs font-semibold whitespace-nowrap tabular-nums"
          >{{ progress.done }}/{{ progress.total }} exercises</span
        >
      </div>
    </summary>
    <div class="flex flex-col gap-3 border-t p-4">
      <p class="text-muted-foreground text-xs">
        {{ session.phase === 'intro' ? 'Introduction' : 'Baseline' }} · recorded prescriptions
        retained
      </p>
      <div
        v-for="item in session.exercises"
        :key="item.exercise.id"
        class="flex items-start gap-3 text-sm"
      >
        <ExerciseIcon :exercise-id="item.exercise.id" class="size-11 shrink-0" />
        <div class="flex min-w-0 flex-col">
          <strong class="font-semibold">{{ item.exercise.name }}</strong>
          <p v-if="!item.logs.length" class="text-muted-foreground">No sets recorded</p>
          <ol v-else class="text-muted-foreground tabular-nums">
            <li v-for="log in item.logs" :key="log.index">
              Set {{ log.index }} · {{ formatSet(log, item.exercise) }}
            </li>
          </ol>
        </div>
      </div>
      <Button v-if="session.status === 'active'" @click="emit('resume', session.id)"
        >Resume this workout</Button
      >
    </div>
  </details>
</template>
