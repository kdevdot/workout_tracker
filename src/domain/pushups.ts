import { shiftDate, weekFor } from './dates';
import type { AppState } from './state';

type Challenge = AppState['pushups'];
type DayState = 'done' | 'partial' | 'missed' | 'today' | 'upcoming' | 'before';

export interface ChallengeDay {
  date: string;
  reps: number;
  state: DayState;
}

/** Totals per date, so several logged sets on one day add up. */
function repsByDate(entries: Challenge['entries']): Map<string, number> {
  const totals = new Map<string, number>();
  for (const entry of entries) totals.set(entry.date, (totals.get(entry.date) ?? 0) + entry.reps);
  return totals;
}

function dayFor(challenge: Challenge, totals: Map<string, number>, date: string, today: string) {
  const reps = totals.get(date) ?? 0;
  const state: DayState =
    !challenge.startDate || date < challenge.startDate
      ? 'before'
      : reps >= challenge.dailyTarget
        ? 'done'
        : date > today
          ? 'upcoming'
          : date === today
            ? 'today'
            : reps > 0
              ? 'partial'
              : 'missed';
  return { date, reps, state };
}

/** Every day from the start date up to today. No end date: the habit is open-ended. */
export function challengeDays(challenge: Challenge, today: string): ChallengeDay[] {
  if (!challenge.startDate || challenge.startDate > today) return [];
  const totals = repsByDate(challenge.entries);
  const days: ChallengeDay[] = [];
  for (let date = challenge.startDate; date <= today; date = shiftDate(date, 1))
    days.push(dayFor(challenge, totals, date, today));
  return days;
}

/** The last `count` Monday-first weeks ending with this week, for the calendar view. */
export function calendarWeeks(challenge: Challenge, today: string, count = 12): ChallengeDay[][] {
  const totals = repsByDate(challenge.entries);
  const monday = weekFor(today)[0]!;
  return Array.from({ length: count }, (_, week) =>
    weekFor(shiftDate(monday, (week - count + 1) * 7)).map((date) =>
      dayFor(challenge, totals, date, today),
    ),
  );
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
  for (const day of [...days].reverse()) {
    if (day.state === 'done') streak++;
    else if (day.date !== today) break;
  }
  return {
    dayNumber: days.length,
    completed: days.filter((day) => day.state === 'done').length,
    total: days.reduce((sum, day) => sum + day.reps, 0),
    streak,
    best,
  };
}
