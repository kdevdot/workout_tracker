import type { Ref } from 'vue';
import { formatDate, localDate, validDate } from '../domain/dates';
import type { AppState } from '../domain/state';

interface Deps {
  state: Ref<AppState>;
  today: Ref<string>;
  update: (change: (current: AppState) => AppState) => Promise<boolean>;
  notify: (text: string) => void;
}

/** Push-up tracker actions. Each saves through the app store and confirms with a toast. */
export function usePushups({ state, today, update, notify }: Deps) {
  function save(change: (pushups: AppState['pushups']) => AppState['pushups']) {
    return update((current) => ({ ...current, pushups: change(current.pushups) }));
  }
  async function startPushups(dailyTarget: number) {
    if (await save(() => ({ startDate: today.value, dailyTarget, entries: [] })))
      notify('Tracking started. Day 1 is today.');
  }
  async function addPushups(day: string, reps: number) {
    const startDate = state.value.pushups.startDate;
    if (!startDate || !validDate(day) || day < startDate || day > localDate()) return;
    const entry = {
      id: crypto.randomUUID(),
      date: day,
      reps,
      recordedAt: new Date().toISOString(),
    };
    if (await save((pushups) => ({ ...pushups, entries: [...pushups.entries, entry] })))
      notify(
        `+${reps} push-ups saved for ${formatDate(day, { day: 'numeric', month: 'short', year: 'numeric' })}.`,
      );
  }
  async function undoPushups(day: string) {
    const last = state.value.pushups.entries.findLastIndex((entry) => entry.date === day);
    if (last === -1) return;
    if (
      await save((pushups) => ({
        ...pushups,
        entries: pushups.entries.filter((_, index) => index !== last),
      }))
    )
      notify('Last push-up entry removed.');
  }
  async function setPushupTarget(dailyTarget: number) {
    if (await save((pushups) => ({ ...pushups, dailyTarget })))
      notify(`Daily target set to ${dailyTarget}.`);
  }
  async function resetPushups() {
    if (await save((pushups) => ({ ...pushups, startDate: today.value, entries: [] })))
      notify('Push-up history cleared. Day 1 is today.');
  }
  return { startPushups, addPushups, undoPushups, setPushupTarget, resetPushups };
}
