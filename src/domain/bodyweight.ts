import { shiftDate } from './dates';
import type { BodyWeight } from './state';

/** Mean of the weigh-ins in the 7 days ending on `end`; null with fewer than 3. */
export function weekAverage(entries: readonly BodyWeight[], end: string): number | null {
  const start = shiftDate(end, -6);
  const week = entries.filter((entry) => entry.date >= start && entry.date <= end);
  return week.length < 3 ? null : week.reduce((sum, entry) => sum + entry.kg, 0) / week.length;
}

/**
 * The research plan's gain check: compare 7-day averages three weeks apart and aim for
 * 0.1–0.25% of body weight a week, adjusting food by 100–150 kcal a day.
 */
export function weightTrend(entries: readonly BodyWeight[], today: string) {
  const average = weekAverage(entries, today);
  const before = weekAverage(entries, shiftDate(today, -21));
  if (average === null || before === null) return { average, weekly: null, advice: null };
  const weekly = (average - before) / 3;
  const percent = (weekly / before) * 100;
  const advice =
    percent < 0.1
      ? 'Gaining slower than planned: add 100–150 kcal a day and check again in 2–3 weeks.'
      : percent > 0.25
        ? 'Gaining faster than planned: cut 100–150 kcal a day and check again in 2–3 weeks.'
        : 'On track (0.1–0.25% a week). Keep eating the same.';
  return { average, weekly, advice };
}
