import { z } from 'zod';
import { validDate } from './dates';

const date = z.string().refine(validDate, 'Invalid local calendar date');
const timestamp = z.iso.datetime();
const text = z.string().min(1).max(1000);
const positive = z.number().finite().positive().max(10000);
const nullableNutrition = z.number().finite().nonnegative().max(10000).nullable();
export const workoutIdSchema = z.enum(['upperA', 'lowerA', 'upperB', 'lowerB']);
export const phaseSchema = z.enum(['intro', 'baseline']);

export const exerciseSchema = z
  .strictObject({
    id: text,
    name: text,
    sets: z.number().int().min(1).max(20),
    min: positive,
    max: positive,
    unit: z.enum(['reps', 'cycles', 'seconds']),
    perSide: z.boolean(),
    restSeconds: z.number().int().min(1).max(3600),
    restLabel: text,
    targetRir: text,
    loadKind: z.enum(['barbell', 'smith', 'dumbbell', 'cable', 'machine', 'bodyweight']),
    equipment: text,
    primary: z.array(text).max(30),
    supporting: z.array(text).max(30),
    cues: z.array(text).max(30),
    alternative: z.strictObject({ name: text, prescription: text, note: z.string().max(2000) }),
  })
  .refine((exercise) => exercise.min <= exercise.max, 'Invalid repetition range');

const sideReps = z.number().int().min(1).max(3600);
export const setSchema = z.strictObject({
  index: z.number().int().min(1).max(20),
  load: z.number().finite().min(0).max(1000).nullable(),
  /** For one-sided movements this is the weaker side, which sets the pace for progression. */
  reps: z.number().int().min(1).max(3600),
  sides: z.strictObject({ left: sideReps, right: sideReps }).optional(),
  effort: z.number().finite().min(0).max(120),
  loggedAt: timestamp,
});

const sessionExerciseSchema = z
  .strictObject({
    exercise: exerciseSchema,
    logs: z.array(setSchema).max(20),
  })
  .superRefine(({ exercise, logs }, context) => {
    if (new Set(logs.map((log) => log.index)).size !== logs.length) {
      context.addIssue({ code: 'custom', message: 'Duplicate set number' });
    }
    for (const log of logs) {
      if (log.index > exercise.sets || (exercise.unit !== 'seconds' && log.effort > 10)) {
        context.addIssue({ code: 'custom', message: 'Set does not match its prescription' });
      }
      if (
        log.sides &&
        (!exercise.perSide || log.reps !== Math.min(log.sides.left, log.sides.right))
      ) {
        context.addIssue({ code: 'custom', message: 'Side reps do not match the set' });
      }
      if (exercise.loadKind !== 'bodyweight' && log.load === null) {
        context.addIssue({ code: 'custom', message: 'Loaded movements need a recorded load' });
      }
    }
  });

export const sessionSchema = z
  .strictObject({
    id: z.uuid(),
    date,
    workoutId: workoutIdSchema,
    phase: phaseSchema,
    startedAt: timestamp,
    completedAt: timestamp.nullable(),
    status: z.enum(['active', 'completed']),
    exercises: z.array(sessionExerciseSchema).min(1).max(30),
  })
  .superRefine((session, context) => {
    if ((session.status === 'completed') !== (session.completedAt !== null)) {
      context.addIssue({ code: 'custom', message: 'Invalid completion state' });
    }
    if (
      new Set(session.exercises.map((entry) => entry.exercise.id)).size !== session.exercises.length
    ) {
      context.addIssue({ code: 'custom', message: 'Duplicate session exercise' });
    }
  });

export const CREATINE = 'Optimum Nutrition creatine';

export const intakeSchema = z.strictObject({
  id: z.uuid(),
  date,
  kind: z.enum(['whey', 'creatine']),
  product: text,
  amount: z.number().finite().positive().max(100),
  calories: nullableNutrition,
  protein: nullableNutrition,
  recordedAt: timestamp,
});

const pushupSchema = z.strictObject({
  id: z.uuid(),
  date,
  reps: z.number().int().min(1).max(1000),
  recordedAt: timestamp,
});

export const stateSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    revision: z.number().int().nonnegative(),
    savedAt: timestamp.nullable(),
    settings: z.strictObject({
      phase: phaseSchema,
      // null = each exercise's programme rest. Older saves have no value and get the default.
      restMinutes: z.number().min(0.5).max(10).nullable().default(null),
      whey: z.strictObject({ name: text, calories: nullableNutrition, protein: nullableNutrition }),
    }),
    sessions: z.array(sessionSchema).max(10000),
    intakes: z.array(intakeSchema).max(50000),
    // Older saves have no challenge yet and get an empty, not-started one.
    pushups: z
      .strictObject({
        startDate: date.nullable(),
        dailyTarget: z.number().int().min(1).max(1000),
        entries: z.array(pushupSchema).max(100000),
      })
      .default({ startDate: null, dailyTarget: 100, entries: [] }),
    // Morning body weight, one per date. Older saves have none.
    bodyWeights: z
      .array(
        z.strictObject({ date, kg: z.number().finite().min(20).max(400), recordedAt: timestamp }),
      )
      .max(50000)
      .default([]),
    timer: z
      .strictObject({
        sessionId: z.uuid(),
        exerciseId: text,
        endsAt: z.number().int().nonnegative(),
      })
      .nullable(),
  })
  .superRefine((state, context) => {
    for (const records of [state.sessions, state.intakes, state.pushups.entries]) {
      if (new Set(records.map((record) => record.id)).size !== records.length) {
        context.addIssue({ code: 'custom', message: 'Duplicate record ID' });
      }
    }
    const weighDates = state.bodyWeights.map((entry) => entry.date);
    if (new Set(weighDates).size !== weighDates.length) {
      context.addIssue({ code: 'custom', message: 'Duplicate body-weight date' });
    }
    const activeKeys = state.sessions
      .filter((session) => session.status === 'active')
      .map((session) => `${session.date}:${session.workoutId}`);
    if (new Set(activeKeys).size !== activeKeys.length) {
      context.addIssue({ code: 'custom', message: 'Duplicate active workout' });
    }
  });

const backupSchema = z.strictObject({
  format: z.literal('steady-backup'),
  exportedAt: timestamp,
  data: stateSchema,
});

export type AppState = z.infer<typeof stateSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SetLog = z.infer<typeof setSchema>;
export type Intake = z.infer<typeof intakeSchema>;
export type BodyWeight = AppState['bodyWeights'][number];
export type Backup = z.infer<typeof backupSchema>;

export function emptyState(): AppState {
  return {
    schemaVersion: 1,
    revision: 0,
    savedAt: null,
    settings: {
      phase: 'intro',
      restMinutes: null,
      whey: { name: 'Optimum Nutrition whey', calories: null, protein: null },
    },
    sessions: [],
    intakes: [],
    pushups: { startDate: null, dailyTarget: 100, entries: [] },
    bodyWeights: [],
    timer: null,
  };
}

export const MAX_BACKUP_BYTES = 50_000_000;

function checkBackupSize(contents: string) {
  if (new TextEncoder().encode(contents).length > MAX_BACKUP_BYTES)
    throw new Error('The supported backup capacity is 50 MB. No records were changed.');
}

export function parseBackup(contents: string): Backup {
  checkBackupSize(contents);
  return backupSchema.parse(JSON.parse(contents));
}

export function encodeBackup(state: AppState): string {
  const contents = JSON.stringify(
    backupSchema.parse({
      format: 'steady-backup',
      exportedAt: new Date().toISOString(),
      data: state,
    }),
    null,
    2,
  );
  checkBackupSize(contents);
  return contents;
}
