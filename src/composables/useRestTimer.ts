import { computed, type Ref } from 'vue';
import { useEventListener, useIntervalFn, useTimestamp } from '@vueuse/core';
import type { AppState } from '../domain/state';

export function useRestTimer(state: Ref<AppState>) {
  const now = useTimestamp({ scheduler: (tick) => useIntervalFn(tick, 250) });
  // Background tabs throttle intervals, so catch up the moment the app is visible again.
  useEventListener(document, 'visibilitychange', () => (now.value = Date.now()));
  const seconds = computed(() =>
    Math.max(0, Math.ceil(((state.value.timer?.endsAt ?? 0) - now.value) / 1000)),
  );
  const display = computed(
    () => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`,
  );
  return { seconds, display };
}
