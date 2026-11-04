import { shiftDate } from './dates';
import type { AppState } from './state';

export const CHALLENGE_DAYS = 100;

type Challenge = AppState['pushups'];
export type DayState = 'done' | 'partial' | 'missed' | 'today' | 'upcoming';

export interface ChallengeDay {
  date: string;
  number: number;
  reps: number;
  state: DayState;
}

/** Totals per date, so several logged sets on one day add up. */
export function repsByDate(entries: Challenge['entries']): Map<string, number> {
  const totals = new Map<string, number>();
  for (const entry of entries) totals.set(entry.date, (totals.get(entry.date) ?? 0) + entry.reps);
  return totals;
}

export function challengeDays(challenge: Challenge, today: string): ChallengeDay[] {
  if (!challenge.startDate) return [];
  const totals = repsByDate(challenge.entries);
  return Array.from({ length: CHALLENGE_DAYS }, (_, index) => {
    const date = shiftDate(challenge.startDate!, index);
    const reps = totals.get(date) ?? 0;
    const state: DayState =
      reps >= challenge.dailyTarget
        ? 'done'
        : date > today
          ? 'upcoming'
          : date === today
            ? 'today'
            : reps > 0
              ? 'partial'
              : 'missed';
    return { date, number: index + 1, reps, state };
  });
}

export function challengeStats(days: ChallengeDay[], today: string) {
  let best = 0;
  let run = 0;
  for (const day of days) {
    if (day.state === 'done') best = Math.max(best, ++run);
    else if (day.date < today) run = 0;
  }
  // Current streak: consecutive done days ending today, or yesterday while today is still open.
  let streak = 0;
  for (const day of days.filter((item) => item.date <= today).reverse()) {
    if (day.state === 'done') streak++;
    else if (day.date !== today) break;
  }
  const current = days.findIndex((day) => day.date === today);
  return {
    dayNumber: current === -1 ? (days[0] && today < days[0].date ? 0 : days.length) : current + 1,
    completed: days.filter((day) => day.state === 'done').length,
    total: days.reduce((sum, day) => sum + day.reps, 0),
    streak,
    best,
    finished: days.length > 0 && today > days[days.length - 1]!.date,
  };
}
