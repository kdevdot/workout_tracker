<script setup lang="ts">
import { computed } from 'vue';
import type { Session } from '../domain/state';
import { formatDate } from '../domain/dates';
import { sessionProgress } from '../domain/sessions';
import { workouts } from '../domain/programme';
const props = defineProps<{ sessions: Session[] }>();
const emit = defineEmits<{ resume: [id: string] }>();
const sorted = computed(() =>
  [...props.sessions].sort(
    (first, second) =>
      second.date.localeCompare(first.date) || second.startedAt.localeCompare(first.startedAt),
  ),
);
</script>

<template>
  <h1>Training history</h1>
  <p class="page-description">
    Your real sessions. Partial workouts stay partial; drafts can be resumed.
  </p>
  <div v-if="!sessions.length" class="empty-state">
    <h2>Your first session starts here.</h2>
    <p>Record a set from the plan. It will appear here immediately after saving.</p>
  </div>
  <details v-for="session in sorted" :key="session.id" class="history-entry">
    <summary>
      <div>
        <strong>{{ workouts[session.workoutId].name }}</strong
        ><small>{{
          formatDate(session.date, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        }}</small>
      </div>
      <span
        >{{ sessionProgress(session).done }}/{{
          sessionProgress(session).total
        }}
        sets<br /><small>{{
          session.status === 'active'
            ? 'In progress'
            : sessionProgress(session).done < sessionProgress(session).total
              ? 'Completed · partial'
              : 'Completed'
        }}</small></span
      >
    </summary>
    <p class="fine-print">
      {{ session.phase === 'intro' ? 'Introduction' : 'Baseline' }} · recorded prescriptions
      retained
    </p>
    <div v-for="entry in session.exercises" :key="entry.exercise.id" class="history-exercise">
      <strong>{{ entry.exercise.name }}</strong>
      <p>
        {{
          entry.logs.length
            ? entry.logs
                .map(
                  (log) =>
                    `${log.load === null ? 'BW' : `${log.load} kg`} × ${log.reps} ${entry.exercise.unit}, ${log.effort} ${entry.exercise.unit === 'seconds' ? 's reserve' : 'RIR'}`,
                )
                .join(' · ')
            : 'No sets recorded'
        }}
      </p>
    </div>
    <button
      v-if="session.status === 'active'"
      class="secondary-button"
      @click="emit('resume', session.id)"
    >
      Resume this workout
    </button>
  </details>
</template>
