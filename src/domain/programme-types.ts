export type WorkoutId = 'upperA' | 'lowerA' | 'upperB' | 'lowerB';
export type Phase = 'intro' | 'baseline';
export type LoadKind = 'smith' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
export type RepUnit = 'reps' | 'cycles' | 'seconds';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  min: number;
  max: number;
  unit: RepUnit;
  perSide: boolean;
  restSeconds: number;
  restLabel: string;
  targetRir: string;
  loadKind: LoadKind;
  equipment: string;
  primary: string[];
  supporting: string[];
  cues: string[];
  alternative: { name: string; prescription: string; note: string };
}

export interface Workout {
  id: WorkoutId;
  name: string;
  primary: string[];
  supporting: string[];
  warmup: string;
  exercises: Exercise[];
}
