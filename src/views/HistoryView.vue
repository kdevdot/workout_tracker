<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown, Dumbbell } from '@lucide/vue';
import type { Session } from '@/domain/state';
import { formatDate } from '@/domain/dates';
import { bestSet, formatSet, sessionProgress, shortSet } from '@/domain/sessions';
import { workouts } from '@/domain/programme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ExerciseIcon from '@/components/ExerciseIcon.vue';

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
      const tops = session.exercises.flatMap((item) => {
        const top = bestSet(item.logs);
        return top ? [{ name: item.exercise.name, set: shortSet(top) }] : [];
      });
      return { session, progress, status, tops };
    }),
);
</script>

<template>
  <header class="page-header screen-enter">
    <h1 class="page-heading">Training history</h1>
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
    v-for="({ session, progress, status, tops }, index) in entries"
    :key="session.id"
    class="group bg-card screen-enter rounded-[20px] shadow-(--panel-shadow)"
    :style="{ animationDelay: `${Math.min(index, 8) * 45 + 60}ms` }"
  >
    <summary class="flex flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col">
          <strong class="font-display condensed text-2xl font-bold uppercase">{{
            workouts[session.workoutId].name
          }}</strong>
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
        <div class="segments flex-1" aria-hidden="true">
          <span v-for="item in session.exercises" :key="item.exercise.id"
            ><i
              :style="{
                transform: `scaleX(${item.logs.length >= item.exercise.sets ? 1 : 0})`,
              }"
          /></span>
        </div>
        <span class="text-muted-foreground text-xs font-semibold whitespace-nowrap tabular-nums"
          >{{ progress.done }}/{{ progress.total }} exercises</span
        >
      </div>
      <ul
        v-if="tops.length"
        class="flex flex-col gap-1 text-xs group-open:hidden"
        aria-label="Top set per exercise"
      >
        <li v-for="top in tops" :key="top.name" class="flex justify-between gap-3">
          <span class="text-muted-foreground truncate">{{ top.name }}</span>
          <strong class="shrink-0 font-semibold tabular-nums">{{ top.set }}</strong>
        </li>
      </ul>
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
