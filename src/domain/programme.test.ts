import { describe, expect, it } from 'vitest';
import type { Exercise, WorkoutId } from './programme-types';
import { getExercises, workoutForDate, workouts } from './programme';

const workoutIds: WorkoutId[] = ['upperA', 'lowerA', 'upperB', 'lowerB'];

const expectedTables = {
  upperA: [
    ['smith-flat-bench-press', 4, 5, 8, 'reps', false, 180, '2', 'smith'],
    ['fixed-handle-pull-up', 3, 5, 8, 'reps', false, 180, '2', 'bodyweight'],
    ['bench-supported-one-arm-db-row', 2, 8, 12, 'reps', true, 120, '2', 'dumbbell'],
    ['seated-db-shoulder-press', 2, 6, 10, 'reps', false, 120, '2', 'dumbbell'],
    ['db-lateral-raise', 2, 12, 20, 'reps', false, 90, '1–2', 'dumbbell'],
    ['standing-db-curl', 2, 8, 12, 'reps', false, 90, '1–2', 'dumbbell'],
    ['one-arm-cable-pushdown', 2, 10, 15, 'reps', true, 90, '1–2', 'cable'],
  ],
  lowerA: [
    ['smith-squat', 3, 5, 8, 'reps', false, 180, '2', 'smith'],
    ['db-romanian-deadlift', 3, 8, 12, 'reps', false, 180, '2', 'dumbbell'],
    ['unica-leg-extension', 2, 10, 15, 'reps', false, 120, '1–2', 'machine'],
    ['supine-heel-walkout', 2, 4, 8, 'cycles', false, 120, '~2 clean cycles', 'bodyweight'],
    ['supported-single-leg-standing-db-calf-raise', 3, 8, 15, 'reps', true, 90, '1–2', 'dumbbell'],
    ['dead-bug', 2, 6, 10, 'reps', true, 75, '~2 technically clean reps', 'bodyweight'],
  ],
  upperB: [
    ['low-incline-db-bench-press', 4, 8, 12, 'reps', false, 180, '2', 'dumbbell'],
    ['bench-supported-one-arm-db-row', 3, 8, 12, 'reps', true, 120, '2', 'dumbbell'],
    ['fixed-handle-pull-up', 2, 5, 8, 'reps', false, 180, '2', 'bodyweight'],
    ['machine-pec-fly', 2, 10, 15, 'reps', false, 90, '1–2', 'machine'],
    ['machine-reverse-fly', 2, 12, 20, 'reps', false, 90, '1–2', 'machine'],
    ['db-lateral-raise', 2, 12, 20, 'reps', false, 90, '1–2', 'dumbbell'],
    ['standing-db-curl', 2, 10, 15, 'reps', false, 90, '1–2', 'dumbbell'],
    ['one-db-two-hand-overhead-triceps-extension', 2, 10, 15, 'reps', false, 90, '1–2', 'dumbbell'],
  ],
  lowerB: [
    ['smith-romanian-deadlift', 3, 6, 8, 'reps', false, 180, '2', 'smith'],
    ['db-stationary-split-squat', 3, 8, 12, 'reps', true, 180, '2', 'dumbbell'],
    ['unica-leg-extension', 2, 10, 15, 'reps', false, 120, '1–2', 'machine'],
    ['supine-heel-walkout', 2, 4, 8, 'cycles', false, 120, '~2 clean cycles', 'bodyweight'],
    ['seated-db-calf-raise', 3, 12, 20, 'reps', false, 90, '1–2', 'dumbbell'],
    ['side-plank', 2, 20, 45, 'seconds', true, 75, '5–10 s form reserve', 'bodyweight'],
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
    ).toEqual([17, 15, 19, 15]);
    expect(
      workoutIds.map((workoutId) =>
        getExercises(workoutId, 'intro').reduce((total, exercise) => total + exercise.sets, 0),
      ),
    ).toEqual([14, 12, 16, 12]);
  });

  it.each(workoutIds)(
    '%s converts intro effort without changing movement or ranges',
    (workoutId) => {
      const baseline = getExercises(workoutId, 'baseline');
      const intro = getExercises(workoutId, 'intro');
      intro.forEach((exercise, index) => {
        expect(exercise.sets).toBe(2);
        expect(exercise.targetRir).toBe(
          exercise.unit === 'seconds'
            ? '5–10 s form reserve'
            : exercise.unit === 'cycles'
              ? '~3 clean cycles'
              : '3',
        );
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
        expect(exercise.alternative.note).not.toMatch(/2 (?:technical )?RIR at baseline/);
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
          expect(['smith', 'dumbbell', 'cable', 'machine', 'bodyweight']).toContain(
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

  it('preserves bodyweight, timed and out-and-back cycle conventions', () => {
    const walkout = workouts.lowerA.exercises.find(
      (exercise) => exercise.id === 'supine-heel-walkout',
    )!;
    expect(walkout).toMatchObject({
      loadKind: 'bodyweight',
      unit: 'cycles',
      min: 4,
      max: 8,
      perSide: false,
    });
    expect(walkout.cues.join(' ')).toContain('one cycle, not each footstep');
    const plank = workouts.lowerB.exercises.find((exercise) => exercise.id === 'side-plank')!;
    expect(plank).toMatchObject({
      loadKind: 'bodyweight',
      unit: 'seconds',
      min: 20,
      max: 45,
      perSide: true,
    });
    expect(
      getExercises('lowerB', 'intro').find((exercise) => exercise.id === plank.id)?.targetRir,
    ).toBe('5–10 s form reserve');
    expect(workouts.lowerA.exercises.find((exercise) => exercise.id === 'dead-bug')).toMatchObject({
      loadKind: 'bodyweight',
      unit: 'reps',
      perSide: true,
    });
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

  it('keeps UNICA confirmation warnings and day-specific conditional substitutions', () => {
    for (const workoutId of ['lowerA', 'lowerB'] as const) {
      const extension = workouts[workoutId].exercises[2];
      expect(extension.name).toContain('confirmed setup only');
      expect(extension.cues.join(' ')).toContain('Staff-confirmed setup required');
      expect(extension.cues.join(' ')).toContain('substitute immediately');
      expect(extension.alternative.note).toContain('DB goblet squat, 12–20 reps');
    }
    expect(workouts.lowerA.exercises[2].alternative.name).toBe('DB stationary split squat');
    expect(workouts.lowerB.exercises[2].alternative.name).toBe('Smith squat');
  });
});

describe('workoutForDate', () => {
  it.each([
    ['2026-11-02', 'upperA'],
    ['2026-11-03', 'lowerA'],
    ['2026-11-04', null],
    ['2026-11-05', 'upperB'],
    ['2026-11-06', null],
    ['2026-11-07', 'lowerB'],
    ['2026-11-08', null],
    ['2026-11-09', 'upperA'],
    ['2026-12-31', 'upperB'],
    ['2027-01-01', null],
    ['2028-02-29', 'lowerA'],
    ['2026-03-29', null],
    ['2026-10-25', null],
  ] as const)('schedules local calendar date %s as %s', (date, expected) => {
    expect(workoutForDate(date)).toBe(expected);
  });
});
