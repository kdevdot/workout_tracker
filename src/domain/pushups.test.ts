import { describe, expect, it } from 'vitest';
import { calendarMonth, calendarWeeks, challengeDays, challengeStats } from './pushups';
import { emptyState, encodeBackup, parseBackup } from './state';

const entry = (date: string, reps: number) => ({
  id: crypto.randomUUID(),
  date,
  reps,
  recordedAt: new Date().toISOString(),
});
const challenge = (entries: ReturnType<typeof entry>[]) => ({
  startDate: '2026-11-01',
  dailyTarget: 100,
  entries,
});

describe('daily push-ups', () => {
  it('tracks every day from the start with no end, adding up sets on one day', () => {
    const days = challengeDays(
      challenge([entry('2026-11-01', 60), entry('2026-11-01', 40)]),
      '2026-11-03',
    );
    expect(days.map((day) => day.state)).toEqual(['done', 'missed', 'today']);
    expect(days[0]!.reps).toBe(100);
    expect(challengeDays(challenge([]), '2027-11-01')).toHaveLength(366);
  });

  it('keeps the streak alive while today is still open, and resets it after a missed day', () => {
    const entries = [
      entry('2026-11-01', 100),
      entry('2026-11-03', 100),
      entry('2026-11-04', 120),
      entry('2026-11-05', 30),
    ];
    const stats = challengeStats(challengeDays(challenge(entries), '2026-11-05'), '2026-11-05');
    expect(stats).toMatchObject({ dayNumber: 5, completed: 3, total: 350, streak: 2, best: 2 });
  });

  it('lays out Monday-first calendar weeks ending this week', () => {
    const weeks = calendarWeeks(challenge([entry('2026-11-02', 100)]), '2026-11-04');
    expect(weeks).toHaveLength(12);
    expect(weeks.at(-1)!.map((day) => day.state)).toEqual([
      'done',
      'missed',
      'today',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
    expect(weeks.at(-2)!.at(-1)).toMatchObject({ date: '2026-11-01', state: 'missed' });
    expect(weeks[0]![0]!.state).toBe('before');
  });

  it('loads older backups that have no tracker yet', () => {
    const { pushups: _, ...old } = emptyState();
    const backup = JSON.parse(encodeBackup(emptyState()));
    backup.data = old;
    expect(parseBackup(JSON.stringify(backup)).data.pushups).toEqual({
      startDate: null,
      dailyTarget: 100,
      entries: [],
    });
  });

  it('lays out full months including adjacent days and preserves each day’s totals and limits', () => {
    const days = calendarMonth(challenge([entry('2026-11-02', 100)]), '2026-11-04', '2026-11-01');
    expect(days).toHaveLength(42);
    expect(days[0]).toMatchObject({ date: '2026-10-26', state: 'before' });
    expect(days.at(-1)).toMatchObject({ date: '2026-12-06', state: 'upcoming' });
    expect(days.find((day) => day.date === '2026-11-02')).toMatchObject({
      reps: 100,
      state: 'done',
    });
    expect(days.find((day) => day.date === '2026-11-03')?.state).toBe('missed');
    expect(days.find((day) => day.date === '2026-11-04')?.state).toBe('today');
  });
});
