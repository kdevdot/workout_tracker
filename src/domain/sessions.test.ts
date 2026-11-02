import { describe, expect, it } from 'vitest';
import { MAX_BACKUP_BYTES, emptyState, encodeBackup, parseBackup, sessionSchema } from './state';
import {
  finishSession,
  previousPerformance,
  recordSet,
  sessionProgress,
  startSession,
} from './sessions';

function set(index = 1) {
  return { index, load: 20, reps: 7, effort: 3, loggedAt: new Date().toISOString() };
}

describe('session lifecycle', () => {
  it('snapshots prescriptions and preserves the actual calendar date', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    expect(session.date).toBe('2026-11-02');
    expect(sessionProgress(session)).toEqual({ done: 0, total: 14 });
    expect(startSession('upperA', '2026-11-02', 'baseline').exercises[0]!.exercise.sets).toBe(4);
    expect(session.exercises[0]!.exercise.sets).toBe(2);
  });
  it('records and corrects a set without duplicates or mutations', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    const exerciseId = session.exercises[0]!.exercise.id;
    const recorded = recordSet(session, exerciseId, set());
    const corrected = recordSet(recorded, exerciseId, { ...set(), reps: 8 });
    expect(sessionProgress(session).done).toBe(0);
    expect(sessionProgress(corrected).done).toBe(1);
    expect(corrected.exercises[0]!.logs[0]!.reps).toBe(8);
  });
  it('rejects invalid set indexes, blank loaded movements and invalid effort', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    const exerciseId = session.exercises[0]!.exercise.id;
    for (const bad of [
      { ...set(), index: 3 },
      { ...set(), load: null },
      { ...set(), reps: 0 },
      { ...set(), effort: 11 },
    ]) {
      expect(() => recordSet(session, exerciseId, bad)).toThrow();
    }
    expect(() => recordSet(session, 'not-this-exercise', set())).toThrow();
  });
  it('allows a partial finish but never an empty finish or editing completed sessions', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    expect(() => finishSession(session)).toThrow();
    const completed = finishSession(recordSet(session, session.exercises[0]!.exercise.id, set()));
    expect(completed.status).toBe('completed');
    expect(sessionProgress(completed)).toEqual({ done: 1, total: 14 });
    expect(() => recordSet(completed, completed.exercises[0]!.exercise.id, set())).toThrow();
  });
  it('finds previous completed performances, not future dates or drafts', () => {
    const earlier = startSession('upperA', '2026-11-02', 'intro');
    const exerciseId = earlier.exercises[0]!.exercise.id;
    const completed = finishSession(recordSet(earlier, exerciseId, set()));
    const current = startSession('upperA', '2026-11-09', 'intro');
    const future = finishSession(
      recordSet(startSession('upperA', '2026-11-16', 'intro'), exerciseId, set()),
    );
    const state = { ...emptyState(), sessions: [completed, current, future] };
    expect(previousPerformance(state, current, exerciseId)?.date).toBe('2026-11-02');
  });
  it('does not conflate Smith and dumbbell movements', () => {
    const previous = startSession('upperA', '2026-11-02', 'intro');
    const completed = finishSession(recordSet(previous, previous.exercises[0]!.exercise.id, set()));
    const current = startSession('upperB', '2026-11-05', 'intro');
    expect(
      previousPerformance(
        { ...emptyState(), sessions: [completed] },
        current,
        current.exercises[0]!.exercise.id,
      ),
    ).toBeNull();
  });
  it('preserves distinct timed holds, full cycles, and per-side prescriptions', () => {
    const lower = startSession('lowerB', '2026-11-07', 'intro');
    const plank = lower.exercises.find((entry) => entry.exercise.unit === 'seconds')!;
    const recorded = recordSet(lower, plank.exercise.id, {
      ...set(),
      load: null,
      reps: 30,
      effort: 7,
    });
    expect(
      recorded.exercises.find((entry) => entry.exercise.unit === 'seconds')!.logs[0]!.reps,
    ).toBe(30);
    expect(lower.exercises.find((entry) => entry.exercise.unit === 'cycles')).toBeDefined();
  });
});

describe('backup validation', () => {
  it('round-trips real records and prescription snapshots', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    const state = {
      ...emptyState(),
      sessions: [recordSet(session, session.exercises[0]!.exercise.id, set())],
    };
    expect(parseBackup(encodeBackup(state)).data).toEqual(state);
  });
  it('rejects unsupported versions, invalid dates, duplicate logs and oversized files', () => {
    expect(() => parseBackup('{')).toThrow();
    const backup = JSON.parse(encodeBackup(emptyState()));
    backup.data.schemaVersion = 2;
    expect(() => parseBackup(JSON.stringify(backup))).toThrow();
    expect(() => parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1))).toThrow();
    const session = startSession('upperA', '2026-11-02', 'intro');
    expect(() => sessionSchema.parse({ ...session, date: '2026-02-30' })).toThrow();
    session.exercises[0]!.logs = [set(), set()];
    expect(() => sessionSchema.parse(session)).toThrow();
  });
  it('round-trips a multi-year history larger than the former 5 MB limit', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    const completed = finishSession(recordSet(session, session.exercises[0]!.exercise.id, set()));
    const sessions = Array.from({ length: 500 }, () => ({ ...completed, id: crypto.randomUUID() }));
    const contents = encodeBackup({ ...emptyState(), sessions });
    expect(new TextEncoder().encode(contents).length).toBeGreaterThan(5_000_000);
    expect(parseBackup(contents).data.sessions).toHaveLength(500);
  });
});
