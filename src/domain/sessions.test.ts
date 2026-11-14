import { describe, expect, it } from 'vitest';
import { getExercises, workouts } from './programme';
import legacySessions from './__fixtures__/legacy-programme-sessions.json';
import type { WorkoutId } from './programme-types';
import { MAX_BACKUP_BYTES, emptyState, encodeBackup, parseBackup, sessionSchema } from './state';
import {
  bestSet,
  alternativeOf,
  finishSession,
  nextTarget,
  previousPerformance,
  recordSet,
  restFor,
  sessionProgress,
  shortSet,
  startSession,
  swapExercise,
} from './sessions';

function set(index = 1) {
  return { index, load: 20, reps: 7, effort: 3, loggedAt: new Date().toISOString() };
}

function legacySession(workoutId: 'upperA' | 'lowerB') {
  const saved = legacySessions.find((session) => session.workoutId === workoutId)!;
  return sessionSchema.parse({
    ...saved,
    date: workoutId === 'upperA' ? '2026-11-02' : '2026-11-06',
    status: 'active',
    completedAt: null,
    exercises: saved.exercises.map((entry) => ({ ...entry, logs: [] })),
  });
}

describe('session lifecycle', () => {
  it('snapshots prescriptions and preserves the actual calendar date', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    expect(session.date).toBe('2026-11-02');
    expect(sessionProgress(session)).toEqual({ done: 0, total: 8 });
    expect(startSession('upperA', '2026-11-02', 'baseline').exercises[0]!.exercise.sets).toBe(3);
    expect(session.exercises[0]!.exercise.sets).toBe(2);
  });
  it('records and corrects a set without duplicates or mutations', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    const exerciseId = session.exercises[0]!.exercise.id;
    const recorded = recordSet(session, exerciseId, set());
    const corrected = recordSet(recorded, exerciseId, { ...set(), reps: 8 });
    expect(corrected.exercises[0]!.logs).toHaveLength(1);
    expect(corrected.exercises[0]!.logs[0]!.reps).toBe(8);
    // An exercise counts once, and only when all its sets are logged.
    expect(sessionProgress(corrected).done).toBe(0);
    expect(sessionProgress(recordSet(corrected, exerciseId, set(2))).done).toBe(1);
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
    expect(sessionProgress(completed)).toEqual({ done: 0, total: 8 });
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
    expect(previousPerformance(state.sessions, current, exerciseId)?.date).toBe('2026-11-02');
  });
  it('does not conflate Smith and dumbbell movements', () => {
    const previous = startSession('upperA', '2026-11-02', 'intro');
    const completed = finishSession(recordSet(previous, previous.exercises[0]!.exercise.id, set()));
    const current = startSession('upperB', '2026-11-05', 'intro');
    expect(previousPerformance([completed], current, current.exercises[0]!.exercise.id)).toBeNull();
  });
  it('still records timed holds kept in older saved sessions', () => {
    const lower = legacySession('lowerB');
    const last = lower.exercises.at(-1)!;
    const older = {
      ...lower,
      exercises: [
        ...lower.exercises.slice(0, -1),
        { ...last, exercise: { ...last.exercise, unit: 'seconds' as const } },
      ],
    };
    const recorded = recordSet(older, last.exercise.id, {
      ...set(),
      load: 0,
      reps: 30,
      effort: 7,
      sides: { left: 30, right: 31 },
    });
    expect(recorded.exercises.at(-1)!.logs[0]!.reps).toBe(30);
  });
});

describe('next-session target', () => {
  // Approved bench prescription in Introduction: 2 sets of 5–8 at 3 RIR.
  function done(date: string, logs: Array<[load: number, reps: number, rir?: number]>) {
    let session = startSession('upperA', date, 'intro');
    const id = session.exercises[0]!.exercise.id;
    for (const [index, [load, reps, rir = 3]] of logs.entries()) {
      session = recordSet(session, id, { ...set(index + 1), load, reps, effort: rir });
    }
    return finishSession(session);
  }
  const target = (history: ReturnType<typeof done>[]) => {
    const current = startSession('upperA', '2026-12-01', 'intro');
    return nextTarget(history, current, current.exercises[0]!.exercise);
  };

  it('suggests the smallest available increase without guessing plate increments', () => {
    expect(
      target([
        done('2026-11-02', [
          [40, 8],
          [40, 8],
        ]),
      ]),
    ).toMatchObject({
      ready: true,
      load: null,
      stalled: false,
    });
  });
  it('keeps the load when a set is short, grinding or missing', () => {
    for (const logs of [
      [
        [40, 8],
        [40, 5],
      ],
      [
        [40, 8, 3],
        [40, 8, 0],
      ],
      [[40, 8]],
    ] as Array<Array<[number, number, number?]>>) {
      const result = target([done('2026-11-02', logs)]);
      expect(result).toMatchObject({ ready: false, load: null });
      expect(result!.text).not.toContain('Try the smallest');
    }
  });
  it('flags a stall when two sessions fail to beat the one before', () => {
    const flat = [
      done('2026-11-02', [
        [40, 5],
        [40, 5],
      ]),
      done('2026-11-09', [
        [40, 5],
        [40, 4],
      ]),
      done('2026-11-16', [
        [40, 5],
        [40, 5],
      ]),
    ];
    expect(target(flat)!.stalled).toBe(true);
    const rising = [
      done('2026-11-02', [
        [40, 5],
        [40, 4],
      ]),
      done('2026-11-09', [
        [40, 5],
        [40, 4],
      ]),
      done('2026-11-16', [
        [40, 5],
        [40, 5],
      ]),
    ];
    expect(target(rising)!.stalled).toBe(false);
  });
  it('uses the displayed upper bound for raises and overhead extensions with no hidden extra reps', () => {
    for (const id of ['db-lateral-raise', 'one-arm-cable-overhead-triceps-extension']) {
      let prior = startSession('upperA', '2026-11-02', 'intro');
      const exercise = prior.exercises.find((entry) => entry.exercise.id === id)!.exercise;
      for (const index of [1, 2]) {
        prior = recordSet(prior, id, { ...set(index), load: 2, reps: exercise.max });
      }
      const completed = finishSession(prior);
      const current = startSession('upperA', '2026-12-01', 'intro');
      const result = nextTarget([completed], current, exercise);
      expect(result.ready).toBe(true);
      expect(result.text).toContain('Every set reached ' + exercise.max);
      expect(result.text).not.toContain(String(exercise.max + 3));
    }
  });

  it('gives capacity-based first-session guidance instead of forcing the lightest load', () => {
    const result = target([]);
    expect(result).toMatchObject({ ready: false, load: null, stalled: false });
    expect(result.text).toContain('5–8 reps');
    expect(result.text).toContain('3 RIR');
    expect(result.text).not.toContain('even if it feels easy');
  });

  it('adds the current working sets before suggesting more load after a phase change', () => {
    const prior = done('2026-11-02', [
      [40, 8],
      [40, 8],
    ]);
    const current = startSession('upperA', '2026-12-01', 'baseline');
    const result = nextTarget([prior], current, current.exercises[0]!.exercise);
    expect(result.ready).toBe(false);
    expect(result.text).toContain('all 3 working sets');
  });

  it('requires the displayed compound reserve even when all baseline reps are achieved', () => {
    let prior = startSession('upperA', '2026-11-02', 'baseline');
    const exercise = prior.exercises[0]!.exercise;
    for (const index of [1, 2, 3]) {
      prior = recordSet(prior, exercise.id, { ...set(index), load: 40, reps: 8, effort: 1 });
    }
    const current = startSession('upperA', '2026-12-01', 'baseline');
    const result = nextTarget([finishSession(prior)], current, current.exercises[0]!.exercise);
    expect(result.ready).toBe(false);
    expect(result.text).toContain('Prioritise 2 RIR');
  });

  it('does not increase the top load when later sets used a lighter load', () => {
    const result = target([
      done('2026-11-02', [
        [40, 8],
        [20, 8],
      ]),
    ]);
    expect(result).toMatchObject({ ready: false, load: null });
    expect(result!.text).toContain('mixed loads');
  });
});

describe('swapping to the alternative', () => {
  it('restores the saved original prescription after a backup round-trip', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    const original = session.exercises[0]!.exercise;
    original.sets = 3;
    original.targetRir = '4';
    original.cues = ['A previously saved setup cue.'];
    const swapped = swapExercise(session, original.id);
    const restored = parseBackup(encodeBackup({ ...emptyState(), sessions: [swapped] }));
    const back = swapExercise(restored.data.sessions[0]!, swapped.exercises[0]!.exercise.id);
    expect(back.exercises[0]!.exercise).toEqual(original);
  });

  it('shares history for the same movement used as a swap and in the regular plan', () => {
    let previous = swapExercise(legacySession('upperA'), 'fixed-handle-pull-up');
    const id = previous.exercises[1]!.exercise.id;
    previous = finishSession(recordSet(previous, id, set()));
    const current = startSession('upperB', '2026-11-05', 'intro');
    expect(previousPerformance([previous], current, 'unica-lat-pulldown')?.date).toBe('2026-11-02');
  });

  it('turns every listed alternative into a loggable exercise', () => {
    for (const id of Object.keys(workouts) as WorkoutId[]) {
      for (const phase of ['intro', 'baseline'] as const) {
        for (const exercise of getExercises(id, phase)) {
          const alt = alternativeOf(exercise);
          expect(alt.sets).toBe(exercise.sets);
          expect(alt.min).toBeLessThanOrEqual(alt.max);
        }
      }
    }
    const [bench, pulldown] = getExercises('upperA', 'baseline');
    expect(alternativeOf(bench!)).toMatchObject({
      name: 'Smith flat bench press',
      loadKind: 'smith',
      min: 5,
      max: 8,
    });
    expect(alternativeOf(pulldown!)).toMatchObject({ loadKind: 'bodyweight' });
  });
  it('swaps an untouched exercise and back, but never one with sets logged', () => {
    const session = startSession('upperA', '2026-11-02', 'intro');
    const id = session.exercises[0]!.exercise.id;
    const swapped = swapExercise(session, id);
    expect(swapped.exercises[0]!.exercise.name).toBe('Smith flat bench press');
    const back = swapExercise(swapped, swapped.exercises[0]!.exercise.id);
    expect(back.exercises[0]!.exercise).toEqual(session.exercises[0]!.exercise);
    expect(() => swapExercise(recordSet(session, id, set()), id)).toThrow();
  });

  it('reads legacy swap IDs without rewriting history or replacing saved reverse targets', () => {
    const session = swapExercise(legacySession('upperA'), 'fixed-handle-pull-up');
    const entry = session.exercises[1]!;
    entry.exercise.id = 'fixed-handle-pull-up~alt';
    delete entry.originalExercise;
    delete entry.exercise.alternative.movement;
    entry.exercise.alternative.prescription = '3 × 5–9 reps';
    entry.exercise.targetRir = '4';
    const saved = parseBackup(encodeBackup({ ...emptyState(), sessions: [session] })).data
      .sessions[0]!;
    const completed = finishSession(recordSet(saved, entry.exercise.id, set()));
    const current = startSession('upperB', '2026-11-05', 'intro');
    expect(previousPerformance([completed], current, 'unica-lat-pulldown')?.date).toBe(
      '2026-11-02',
    );
    const back = swapExercise(saved, entry.exercise.id).exercises[1]!.exercise;
    expect(back).toMatchObject({
      id: 'fixed-handle-pull-up',
      sets: 3,
      min: 5,
      max: 9,
      targetRir: '4',
    });
    expect(saved.exercises[1]!.exercise.id).toBe('fixed-handle-pull-up~alt');
  });

  it('restores both-side logging for an old unilateral exercise with no /side in its reverse text', () => {
    const id = 'db-stationary-split-squat';
    const session = swapExercise(legacySession('lowerB'), id);
    const entry = session.exercises.find((item) => item.originalExercise?.id === id)!;
    delete entry.originalExercise;
    delete entry.exercise.alternative.movement;
    entry.exercise.id = `${id}~alt`;
    entry.exercise.alternative.prescription = '2 × 8–12 reps';
    const restored = swapExercise(session, entry.exercise.id);
    expect(restored.exercises.find((item) => item.exercise.id === id)!.exercise.perSide).toBe(true);
  });
});

describe('rest between sets', () => {
  it('uses the programme rest unless the user picked minutes', () => {
    const exercise = startSession('upperA', '2026-11-02', 'intro').exercises[0]!.exercise;
    expect(restFor(exercise, null)).toEqual({ seconds: 240, label: '3–4 min' });
    expect(restFor(exercise, 1.5)).toEqual({ seconds: 90, label: '1.5 min' });
  });
});

describe('backup validation', () => {
  it('preserves completed and in-progress pre-revision sessions exactly alongside new workouts', () => {
    const saved = legacySessions.map((session) => sessionSchema.parse(session));
    const next = startSession('lowerB', '2026-11-20', 'intro');
    const state = { ...emptyState(), sessions: [...saved, next] };
    const restored = parseBackup(encodeBackup(state)).data;
    expect(restored.schemaVersion).toBe(1);
    expect(restored.settings.phase).toBe('intro');
    expect(restored.sessions.slice(0, 2)).toEqual(saved);
    expect(restored.sessions[1]!.exercises[0]!.exercise.id).toBe('barbell-deadlift');
    expect(restored.sessions[2]!.exercises[0]!.exercise.id).toBe('barbell-romanian-deadlift');
    const resumed = recordSet(restored.sessions[1]!, 'barbell-deadlift', set(2));
    expect(resumed.exercises[0]!.exercise).toEqual(saved[1]!.exercises[0]!.exercise);
    expect(resumed.exercises[0]!.logs).toHaveLength(2);
  });

  it('does not compare the supported single-DB split squat with older two-DB sets', () => {
    const previous = legacySession('lowerB');
    const completed = finishSession(recordSet(previous, 'db-stationary-split-squat', set()));
    const current = startSession('lowerB', '2026-11-20', 'intro');
    expect(
      previousPerformance([completed], current, 'supported-db-stationary-split-squat'),
    ).toBeNull();
  });

  it('continues barbell-RDL history recorded under the old alternative alias', () => {
    const prior = startSession('lowerA', '2026-11-03', 'intro');
    prior.exercises[1]!.exercise.id = 'db-romanian-deadlift~alt';
    const completed = finishSession(recordSet(prior, 'db-romanian-deadlift~alt', set()));
    const current = startSession('lowerB', '2026-11-20', 'intro');
    expect(previousPerformance([completed], current, 'barbell-romanian-deadlift')?.date).toBe(
      '2026-11-03',
    );
  });

  it('still opens saves from the retired body-weight log', () => {
    const old = { ...emptyState(), bodyWeights: [{ date: '2026-11-10', kg: 63 }] };
    expect(parseBackup(encodeBackup(old as never)).data).not.toHaveProperty('bodyWeights');
  });
  it('loads older backups saved before the rest setting existed', () => {
    const { restMinutes: _, ...oldSettings } = emptyState().settings;
    const old = {
      format: 'steady-backup',
      exportedAt: new Date().toISOString(),
      data: { ...emptyState(), settings: oldSettings },
    };
    expect(parseBackup(JSON.stringify(old)).data.settings.restMinutes).toBeNull();
  });
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

  it('picks the top set by load, then reps', () => {
    const logs = [
      { ...set(1), load: 40, reps: 8 },
      { ...set(2), load: 42.5, reps: 6 },
      { ...set(3), load: 42.5, reps: 7 },
    ];
    expect(bestSet(logs)).toMatchObject({ index: 3 });
    expect(
      bestSet([
        { ...set(1), load: null, reps: 5 },
        { ...set(2), load: null, reps: 9 },
      ]),
    ).toMatchObject({ index: 2 });
    expect(bestSet([])).toBeNull();
  });

  it('stores both sides of a one-sided set and paces it by the weaker side', () => {
    const session = startSession('lowerA', '2026-11-03', 'intro');
    const sided = session.exercises.find((item) => item.exercise.perSide)!;
    const bilateral = session.exercises.find((item) => !item.exercise.perSide)!;
    const log = { ...set(1), reps: 9, sides: { left: 10, right: 9 } };
    const saved = recordSet(session, sided.exercise.id, log);
    expect(sessionSchema.safeParse(saved).success).toBe(true);
    expect(shortSet(log)).toBe('20 kg × L 10 / R 9');
    expect(shortSet({ ...log, load: null })).toBe('L 10 / R 9');
    expect(() => recordSet(session, sided.exercise.id, { ...log, reps: 10 })).toThrow();
    expect(() => recordSet(session, bilateral.exercise.id, log)).toThrow();
  });
});
