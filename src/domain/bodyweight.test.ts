import { describe, expect, it } from 'vitest';
import { shiftDate } from './dates';
import { weekAverage, weightTrend } from './bodyweight';

const today = '2026-12-01';
const log = (daysAgo: number, kg: number) => ({
  date: shiftDate(today, -daysAgo),
  kg,
  recordedAt: '2026-12-01T07:00:00.000Z',
});

describe('body-weight trend', () => {
  it('needs 3 weigh-ins in the week for an average', () => {
    expect(weekAverage([log(0, 63), log(1, 63)], today)).toBeNull();
    expect(weekAverage([log(0, 63), log(1, 64), log(7, 90), log(2, 65)], today)).toBe(64);
  });
  it('compares averages three weeks apart against 0.1–0.25% a week', () => {
    const earlier = [log(21, 63), log(22, 63), log(23, 63)];
    const at = (kg: number) => weightTrend([...earlier, log(0, kg), log(1, kg), log(2, kg)], today);
    expect(at(63).advice).toMatch(/add 100–150 kcal/);
    expect(at(63.3).advice).toMatch(/On track/);
    expect(at(64).advice).toMatch(/cut 100–150 kcal/);
    expect(at(63.3).weekly).toBeCloseTo(0.1);
    expect(weightTrend([log(0, 63), log(1, 63), log(2, 63)], today).advice).toBeNull();
  });
});
