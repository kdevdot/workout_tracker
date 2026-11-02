import type { z } from 'zod';
import type { exerciseSchema, phaseSchema, workoutIdSchema } from './state';

// Types derive from the persisted schemas so stored data and the programme cannot drift apart.
export type WorkoutId = z.infer<typeof workoutIdSchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type LoadKind = Exercise['loadKind'];
export type RepUnit = Exercise['unit'];

export interface Workout {
  id: WorkoutId;
  name: string;
  primary: string[];
  supporting: string[];
  warmup: string;
  exercises: Exercise[];
}
