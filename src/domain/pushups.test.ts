import { describe, expect, it } from 'vitest';
import { challengeDays, challengeStats } from './pushups';
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

describe('push-up challenge', () => {
  it('builds 100 days and adds up several sets on one day', () => {
    const days = challengeDays(
      challenge([entry('2026-11-01', 60), entry('2026-11-01', 40)]),
      '2026-11-03',
    );
    expect(days).toHaveLength(100);
    expect(days[0]).toMatchObject({ number: 1, reps: 100, state: 'done' });
    expect(days[1]!.state).toBe('missed');
    expect(days[2]!.state).toBe('today');
    expect(days[3]!.state).toBe('upcoming');
    expect(days[99]!.date).toBe('2027-02-08');
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

  it('reports not started, then finished, around the 100 days', () => {
    const days = challengeDays(challenge([]), '2026-10-30');
    expect(challengeStats(days, '2026-10-30')).toMatchObject({ dayNumber: 0, finished: false });
    expect(challengeStats(days, '2027-02-09')).toMatchObject({ dayNumber: 100, finished: true });
  });

  it('loads older backups that have no challenge yet', () => {
    const { pushups: _, ...old } = emptyState();
    const backup = JSON.parse(encodeBackup(emptyState()));
    backup.data = old;
    expect(parseBackup(JSON.stringify(backup)).data.pushups).toEqual({
      startDate: null,
      dailyTarget: 100,
      entries: [],
    });
  });
});
