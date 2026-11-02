import { computed, onMounted, onUnmounted, shallowRef, type Ref } from 'vue';
import type { AppState } from '../domain/state';

export function useRestTimer(state: Ref<AppState>) {
  const now = shallowRef(Date.now());
  let interval: ReturnType<typeof setInterval>;
  const refresh = () => {
    now.value = Date.now();
  };
  onMounted(() => {
    refresh();
    interval = setInterval(refresh, 250);
    document.addEventListener('visibilitychange', refresh);
  });
  onUnmounted(() => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', refresh);
  });
  const seconds = computed(() =>
    Math.max(0, Math.ceil(((state.value.timer?.endsAt ?? 0) - now.value) / 1000)),
  );
  const display = computed(
    () => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`,
  );
  return { seconds, display };
}
