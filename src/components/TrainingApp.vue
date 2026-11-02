<script setup lang="ts">
import { computed } from 'vue';
import { CalendarDays, CircleAlert, CloudOff, History, Pill, Settings2 } from '@lucide/vue';
import { useTrainingApp, type View } from '@/composables/useTrainingApp';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HistoryView from './HistoryView.vue';
import SessionView from './SessionView.vue';
import SettingsView from './SettingsView.vue';
import SupplementsView from './SupplementsView.vue';
import WorkoutPlan from './WorkoutPlan.vue';

const app = useTrainingApp();
const { state, ready, busy, error, view, date, timer } = app;

const nav = [
  { view: 'plan', label: 'Plan', icon: CalendarDays },
  { view: 'history', label: 'History', icon: History },
  { view: 'supplements', label: 'Supplements', icon: Pill },
  { view: 'settings', label: 'Settings', icon: Settings2 },
] as const;
const activeTab = computed<View>(() => (view.value === 'session' ? 'plan' : view.value));
const saveStatus = computed(() => {
  if (busy.value) return 'Saving…';
  const savedAt = state.value.savedAt;
  if (!savedAt) return 'On-device storage ready';
  const time = new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `Saved on this device · ${time}`;
});
</script>

<template>
  <div class="mx-auto flex min-h-dvh max-w-md flex-col">
    <header
      class="bg-background/85 sticky top-0 z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 backdrop-blur"
    >
      <span class="text-xl font-extrabold tracking-tight"
        >steady<span class="text-coral">.</span></span
      >
      <span
        v-if="ready"
        class="text-muted-foreground flex items-center gap-1.5 text-xs font-medium"
        role="status"
      >
        <span
          :class="cn('size-1.5 rounded-full', busy ? 'animate-pulse bg-amber-500' : 'bg-primary')"
        />
        {{ saveStatus }}
      </span>
    </header>

    <main class="flex flex-1 flex-col gap-5 px-5 pt-2 pb-32">
      <section v-if="!ready" class="flex flex-col items-start gap-3 py-16">
        <h1 class="text-2xl font-bold tracking-tight">
          {{ error ? 'Storage needs attention' : 'Opening your training log…' }}
        </h1>
        <p v-if="!error" class="text-muted-foreground">
          Reading your saved records on this device.
        </p>
        <Button v-if="error" variant="outline" @click="app.load">Retry opening storage</Button>
      </section>

      <template v-else>
        <WorkoutPlan
          v-if="view === 'plan'"
          :date="date"
          :workout-id="app.workoutId.value"
          :phase="state.settings.phase"
          :session="app.draft.value"
          :busy="busy"
          @date="app.changeDate"
          @workout="app.chooseWorkout"
          @start="app.begin"
          @supplements="view = 'supplements'"
        />
        <SessionView
          v-else-if="view === 'session' && app.currentSession.value"
          :key="app.currentSession.value.id"
          :session="app.currentSession.value"
          :history="state.sessions"
          :busy="busy"
          :timer-display="timer.display.value"
          :timer-done="timer.seconds.value === 0"
          :timer-visible="state.timer?.sessionId === app.currentSession.value.id"
          @back="view = 'plan'"
          @record="app.saveSet"
          @finish="app.finish"
          @stop-timer="app.stopTimer"
        />
        <HistoryView v-else-if="view === 'history'" :sessions="state.sessions" @resume="app.open" />
        <SupplementsView
          v-else-if="view === 'supplements'"
          :date="date"
          :intakes="state.intakes"
          :busy="busy"
          :has-label="app.hasLabel.value"
          @date="app.changeDate"
          @add="app.addIntake"
          @remove="app.removeIntake"
          @settings="view = 'settings'"
        />
        <SettingsView
          v-else-if="view === 'settings'"
          :state="state"
          :busy="busy"
          @settings="app.saveSettings"
          @restore="app.restore"
        />
      </template>

      <Alert v-if="error" variant="destructive" role="alert">
        <CircleAlert />
        <AlertTitle>Not saved / storage unavailable</AlertTitle>
        <AlertDescription>
          <p>{{ error }}</p>
          <Button v-if="ready" variant="link" class="h-auto p-0" @click="app.load"
            >Reload saved records</Button
          >
        </AlertDescription>
      </Alert>
      <p
        v-if="app.message.value"
        class="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm font-medium"
        role="status"
      >
        {{ app.message.value }}
      </p>

      <footer class="text-muted-foreground mt-auto flex items-start gap-2 pt-6 text-xs leading-5">
        <CloudOff class="mt-0.5 size-3.5 shrink-0" />
        Personal training companion. Records stay in this browser; no cloud service is connected.
        Export regularly.
      </footer>
    </main>

    <nav
      v-if="ready"
      class="bg-card/95 fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur"
      aria-label="Main navigation"
    >
      <div class="mx-auto grid max-w-md grid-cols-4">
        <button
          v-for="item in nav"
          :key="item.view"
          :aria-current="activeTab === item.view ? 'page' : undefined"
          :disabled="busy"
          :class="
            cn(
              'text-muted-foreground flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors disabled:opacity-50',
              'focus-visible:ring-ring/60 outline-none focus-visible:ring-2 focus-visible:ring-inset',
              activeTab === item.view && 'text-primary',
            )
          "
          @click="view = item.view"
        >
          <span
            :class="
              cn(
                'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                activeTab === item.view && 'bg-secondary',
              )
            "
          >
            <component :is="item.icon" class="size-5" :stroke-width="1.8" /> </span
          >{{ item.label }}
        </button>
      </div>
    </nav>
  </div>
</template>
