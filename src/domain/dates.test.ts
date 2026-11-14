import { describe, expect, it } from 'vitest';
import { localDate, shiftDate, shiftMonth, validDate, weekFor } from './dates';

describe('local calendar dates', () => {
  it('uses local components rather than UTC', () => {
    expect(localDate(new Date(2026, 10, 2, 0, 1))).toBe('2026-11-02');
  });
  it('validates calendar dates, including leap years', () => {
    expect(validDate('2024-02-29')).toBe(true);
    for (const value of ['2026-02-29', '2026-13-01', '2026-11-31', '', '2026-1-2']) {
      expect(validDate(value)).toBe(false);
    }
  });
  it('creates Monday-first weeks across year boundaries', () => {
    expect(weekFor('2027-01-01')).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
  });
  it('shifts across daylight saving changes without losing a calendar day', () => {
    expect(shiftDate('2026-10-25', 1)).toBe('2026-10-26');
  });
  it('navigates months across years without carrying the day into a later month', () => {
    expect(shiftMonth('2026-01-31', 1)).toBe('2026-02-01');
    expect(shiftMonth('2026-01-01', -1)).toBe('2025-12-01');
    expect(shiftMonth('2026-12-31', 1)).toBe('2027-01-01');
  });
});
