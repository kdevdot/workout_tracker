import { computed, watch } from 'vue';
import { useEventListener, useIntervalFn, useTimestamp } from '@vueuse/core';
import { restFor } from '@/domain/sessions';
import type { TrainingActions } from './training-types';

export function useRestTimer({ state, update }: Pick<TrainingActions, 'state' | 'update'>) {
  const now = useTimestamp({ scheduler: (tick) => useIntervalFn(tick, 250) });
  // Background tabs throttle intervals, so catch up the moment the app is visible again.
  useEventListener(document, 'visibilitychange', () => (now.value = Date.now()));
  // The tick can be up to 250 ms stale; refresh on a new or adjusted timer so it starts at 4:00, not 4:01.
  watch(
    () => state.value.timer?.endsAt,
    () => (now.value = Date.now()),
  );
  const seconds = computed(() =>
    Math.max(0, Math.ceil(((state.value.timer?.endsAt ?? 0) - now.value) / 1000)),
  );
  const display = computed(
    () => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`,
  );
  // A buzz when rest ends, where the phone supports it (Android; iOS Safari ignores it).
  watch(seconds, (left, before) => {
    if (left === 0 && before > 0 && state.value.timer) navigator.vibrate?.([200, 100, 200]);
  });
  const fraction = computed(() => {
    const running = state.value.timer;
    const exercise = state.value.sessions
      .find((session) => session.id === running?.sessionId)
      ?.exercises.find((entry) => entry.exercise.id === running?.exerciseId)?.exercise;
    return exercise
      ? Math.min(1, seconds.value / restFor(exercise, state.value.settings.restMinutes).seconds)
      : 0;
  });
  function adjust(amount: number) {
    return update((current) =>
      current.timer
        ? {
            ...current,
            timer: {
              ...current.timer,
              endsAt: Math.max(Date.now(), current.timer.endsAt + amount * 1000),
            },
          }
        : current,
    );
  }
  function stop() {
    return update((current) => ({ ...current, timer: null }));
  }
  return { seconds, display, fraction, adjust, stop };
}
