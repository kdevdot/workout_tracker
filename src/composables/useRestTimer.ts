import { computed, watch, type Ref } from 'vue';
import { useEventListener, useIntervalFn, useTimestamp } from '@vueuse/core';
import type { AppState } from '../domain/state';

export function useRestTimer(state: Ref<AppState>) {
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
  return { seconds, display };
}
