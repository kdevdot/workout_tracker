import { describe, expect, it } from 'vitest';
import type { Exercise, WorkoutId } from './programme-types';
import { getExercises, workoutForDate, workouts } from './programme';

const workoutIds: WorkoutId[] = ['upperA', 'lowerA', 'upperB', 'lowerB'];

const expectedTables = {
  upperA: [
    ['barbell-bench-press', 4, 4, 6, 'reps', false, 240, '1–2', 'barbell'],
    ['fixed-handle-pull-up', 3, 5, 8, 'reps', false, 180, '2', 'bodyweight'],
    ['landmine-t-bar-row', 3, 6, 10, 'reps', false, 180, '1–2', 'barbell'],
    ['seated-db-shoulder-press', 2, 6, 10, 'reps', false, 120, '2', 'dumbbell'],
    ['db-lateral-raise', 3, 12, 20, 'reps', false, 90, '1–2', 'dumbbell'],
    ['unica-arm-curl', 2, 10, 15, 'reps', false, 90, '1–2', 'machine'],
    ['one-arm-cable-overhead-triceps-extension', 2, 10, 15, 'reps', true, 90, '1–2', 'cable'],
  ],
  lowerA: [
    ['barbell-back-squat', 4, 4, 6, 'reps', false, 240, '1–2', 'barbell'],
    ['db-romanian-deadlift', 3, 6, 10, 'reps', false, 180, '2', 'dumbbell'],
    ['seated-leg-curl', 3, 10, 15, 'reps', false, 90, '1–2', 'machine'],
    ['selection-leg-extension', 2, 12, 15, 'reps', false, 90, '1–2', 'machine'],
    ['supported-single-leg-standing-db-calf-raise', 3, 10, 15, 'reps', true, 90, '1–2', 'dumbbell'],
    ['hanging-knee-raise', 2, 8, 15, 'reps', false, 75, '2', 'bodyweight'],
  ],
  upperB: [
    ['paused-barbell-bench-press', 3, 6, 8, 'reps', false, 180, '2', 'barbell'],
    ['unica-lat-pulldown', 3, 8, 12, 'reps', false, 120, '1–2', 'machine'],
    ['unica-seated-row', 3, 10, 12, 'reps', false, 120, '1–2', 'machine'],
    ['dips', 2, 6, 12, 'reps', false, 180, '1–2', 'bodyweight'],
    ['machine-pec-fly', 2, 12, 15, 'reps', false, 90, '1–2', 'machine'],
    ['machine-reverse-fly', 2, 12, 20, 'reps', false, 90, '1–2', 'machine'],
    ['db-lateral-raise', 2, 12, 20, 'reps', false, 90, '1–2', 'dumbbell'],
    ['standing-db-curl', 2, 10, 15, 'reps', false, 90, '1–2', 'dumbbell'],
    ['one-db-two-hand-overhead-triceps-extension', 2, 10, 15, 'reps', false, 90, '1–2', 'dumbbell'],
  ],
  lowerB: [
    ['barbell-deadlift', 3, 3, 5, 'reps', false, 240, '1–2', 'barbell'],
    ['paused-barbell-squat', 3, 5, 6, 'reps', false, 180, '2', 'barbell'],
    ['seated-leg-curl', 3, 10, 15, 'reps', false, 90, '1–2', 'machine'],
    ['db-stationary-split-squat', 2, 8, 12, 'reps', true, 180, '2', 'dumbbell'],
    ['seated-db-calf-raise', 3, 12, 20, 'reps', false, 90, '1–2', 'dumbbell'],
    ['cable-anti-rotation-press', 2, 10, 15, 'reps', true, 75, '2', 'cable'],
  ],
};

function tableRow(exercise: Exercise) {
  return [
    exercise.id,
    exercise.sets,
    exercise.min,
    exercise.max,
    exercise.unit,
    exercise.perSide,
    exercise.restSeconds,
    exercise.targetRir,
    exercise.loadKind,
  ];
}

describe('programme tables', () => {
  it.each(workoutIds)('%s matches the ordered baseline table', (workoutId) => {
    expect(getExercises(workoutId, 'baseline').map(tableRow)).toEqual(expectedTables[workoutId]);
    expect(workouts[workoutId].id).toBe(workoutId);
  });

  it('retains baseline totals and reduces intro to two sets per exercise', () => {
    expect(
      workoutIds.map((workoutId) =>
        getExercises(workoutId, 'baseline').reduce((total, exercise) => total + exercise.sets, 0),
      ),
    ).toEqual([19, 17, 21, 16]);
    expect(
      workoutIds.map((workoutId) =>
        getExercises(workoutId, 'intro').reduce((total, exercise) => total + exercise.sets, 0),
      ),
    ).toEqual([14, 12, 18, 12]);
  });

  it.each(workoutIds)(
    '%s converts intro effort without changing movement or ranges',
    (workoutId) => {
      const baseline = getExercises(workoutId, 'baseline');
      const intro = getExercises(workoutId, 'intro');
      intro.forEach((exercise, index) => {
        expect(exercise.sets).toBe(2);
        expect(exercise.targetRir).toBe('3');
        expect(exercise).toMatchObject({
          id: baseline[index].id,
          min: baseline[index].min,
          max: baseline[index].max,
          unit: baseline[index].unit,
          perSide: baseline[index].perSide,
          restSeconds: baseline[index].restSeconds,
          loadKind: baseline[index].loadKind,
        });
        expect(exercise.alternative.prescription).toMatch(/^2 × /);
      });
    },
  );

  it.each(workoutIds)(
    '%s phase conversion and returned data do not mutate the source',
    (workoutId) => {
      const original = JSON.parse(JSON.stringify(workouts[workoutId]));
      for (const phase of ['baseline', 'intro'] as const) {
        const converted = getExercises(workoutId, phase);
        expect(workouts[workoutId]).toEqual(original);
        converted[0].sets = 99;
        converted[0].name = 'changed';
        converted[0].primary.push('changed');
        converted[0].supporting.push('changed');
        converted[0].cues.push('changed');
        converted[0].alternative.name = 'changed';
        expect(workouts[workoutId]).toEqual(original);
        expect(getExercises(workoutId, 'baseline')).toEqual(original.exercises);
      }
    },
  );

  it.each(workoutIds)(
    '%s has valid prescriptions and complete exercise details in both phases',
    (workoutId) => {
      for (const phase of ['baseline', 'intro'] as const) {
        for (const exercise of getExercises(workoutId, phase)) {
          for (const value of [exercise.min, exercise.max, exercise.sets, exercise.restSeconds]) {
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThan(0);
          }
          expect(exercise.max).toBeGreaterThanOrEqual(exercise.min);
          expect(exercise.sets).toBeLessThanOrEqual(4);
          expect(['reps', 'cycles', 'seconds']).toContain(exercise.unit);
          expect(['barbell', 'smith', 'dumbbell', 'cable', 'machine', 'bodyweight']).toContain(
            exercise.loadKind,
          );
          expect(typeof exercise.perSide).toBe('boolean');
          for (const text of [
            exercise.id,
            exercise.name,
            exercise.equipment,
            exercise.restLabel,
            exercise.targetRir,
            exercise.alternative.name,
            exercise.alternative.prescription,
            exercise.alternative.note,
            ...exercise.primary,
            ...exercise.cues,
          ]) {
            expect(text.trim().length).toBeGreaterThan(0);
          }
          expect(exercise.primary.length).toBeGreaterThan(0);
          expect(exercise.cues.length).toBeGreaterThan(0);
        }
      }
    },
  );

  it('uses the upper end of the rest interval for every default timer', () => {
    for (const workout of Object.values(workouts)) {
      for (const exercise of workout.exercises) {
        const upperEnd = Number(exercise.restLabel.match(/\d+/g)!.at(-1));
        expect(exercise.restSeconds).toBe(upperEnd * (exercise.restLabel.includes('min') ? 60 : 1));
      }
    }
  });

  it('only uses gym equipment, never floor work', () => {
    for (const exercise of Object.values(workouts).flatMap((workout) => workout.exercises)) {
      expect(exercise.equipment).not.toMatch(/^Body weight|mat/i);
      expect(exercise.unit).toBe('reps');
    }
    expect(
      workouts.upperA.exercises.find((exercise) => exercise.id === 'fixed-handle-pull-up'),
    ).toMatchObject({ loadKind: 'bodyweight', unit: 'reps', perSide: false });
  });

  it.each(workoutIds)('%s has no duplicate IDs', (workoutId) => {
    const ids = workouts[workoutId].exercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses shared IDs only for consistent movement definitions', () => {
    const definitions = new Map<string, object>();
    for (const workout of Object.values(workouts)) {
      for (const exercise of workout.exercises) {
        const movement = {
          name: exercise.name,
          unit: exercise.unit,
          perSide: exercise.perSide,
          loadKind: exercise.loadKind,
          equipment: exercise.equipment,
          primary: exercise.primary,
          supporting: exercise.supporting,
          cues: exercise.cues,
          restSeconds: exercise.restSeconds,
          restLabel: exercise.restLabel,
          targetRir: exercise.targetRir,
        };
        if (definitions.has(exercise.id)) expect(movement).toEqual(definitions.get(exercise.id));
        else definitions.set(exercise.id, movement);
      }
    }
    expect(workouts.lowerA.exercises[1].id).not.toBe(workouts.lowerB.exercises[0].id);
    expect(workouts.upperA.exercises[0].id).not.toBe(workouts.upperB.exercises[0].id);
    expect(workouts.lowerA.exercises[4].id).not.toBe(workouts.lowerB.exercises[4].id);
  });

  it('uses the real leg curl on both lower days instead of a workaround', () => {
    for (const workoutId of ['lowerA', 'lowerB'] as const) {
      const curl = workouts[workoutId].exercises.find(
        (exercise) => exercise.id === 'seated-leg-curl',
      );
      expect(curl?.equipment).toContain('Selection 700');
    }
    expect(workouts.lowerA.exercises.some((exercise) => exercise.loadKind === 'smith')).toBe(false);
  });
});

describe('workoutForDate', () => {
  it.each([
    ['2026-11-02', 'upperA'],
    ['2026-11-03', 'lowerA'],
    ['2026-11-04', null],
    ['2026-11-05', 'upperB'],
    ['2026-11-06', 'lowerB'],
    ['2026-11-07', null],
    ['2026-11-08', null],
    ['2026-11-09', 'upperA'],
    ['2026-12-31', 'upperB'],
    ['2027-01-01', 'lowerB'],
    ['2028-02-29', 'lowerA'],
    ['2026-03-29', null],
    ['2026-10-25', null],
  ] as const)('schedules local calendar date %s as %s', (date, expected) => {
    expect(workoutForDate(date)).toBe(expected);
  });
});
