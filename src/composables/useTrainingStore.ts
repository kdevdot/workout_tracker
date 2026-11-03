import { onUnmounted, shallowRef } from 'vue';
import { emptyState, type AppState } from '../domain/state';
import { WorkoutDatabase } from '../storage/database';

export function useTrainingStore() {
  const state = shallowRef<AppState>(emptyState());
  const ready = shallowRef(false);
  const busy = shallowRef(false);
  const error = shallowRef('');
  let database: WorkoutDatabase | undefined;
  onUnmounted(() => {
    void database?.close().catch(() => undefined);
  });

  async function load() {
    ready.value = false;
    error.value = '';
    try {
      database ??= new WorkoutDatabase();
      state.value = await database.load();
      ready.value = true;
      // Ask the browser not to clear this data when space runs low; it may silently decline.
      void navigator.storage?.persist?.().catch(() => undefined);
    } catch {
      void database?.close().catch(() => undefined);
      database = undefined;
      error.value =
        'Your saved data could not be opened. Nothing was reset. Retry or export your existing data from another working tab. Do not clear browser data.';
    }
  }

  async function update(change: (current: AppState) => AppState): Promise<boolean> {
    if (!ready.value || busy.value || !database) return false;
    busy.value = true;
    error.value = '';
    try {
      state.value = await database.save(change(structuredClone(state.value)), state.value.revision);
      return true;
    } catch (reason) {
      error.value =
        reason instanceof Error ? reason.message : 'Saving failed. This change was not saved.';
      return false;
    } finally {
      busy.value = false;
    }
  }

  return { state, ready, busy, error, load, update };
}
