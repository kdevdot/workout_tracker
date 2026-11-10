interface DemoMedia {
  src: string;
  poster?: string;
  durationSeconds: number;
  credit: string;
  creditUrl: string;
  licence: 'Your Move free collection' | 'CC BY-SA 4.0';
  licenceUrl: string;
}

export type ExerciseDemo = DemoMedia &
  ({ match: 'movement' } | { match: 'related'; difference: string });

const yourMove = {
  credit: 'Exercise video by Your Move',
  creditUrl: 'https://ymove.app',
  licence: 'Your Move free collection',
  licenceUrl: 'https://ymove.app/free-exercise-videos',
} as const;

const wger = {
  credit: 'Goulart / wger · adapted',
  licence: 'CC BY-SA 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
} as const;

const bench: ExerciseDemo = {
  ...yourMove,
  src: 'https://ymove.app/api/free/dd7e706c-2086-4f4b-867f-d7fece2f720d',
  durationSeconds: 14.84,
  match: 'movement',
};

const squat: ExerciseDemo = {
  ...yourMove,
  src: 'https://ymove.app/api/free/fd0eaa34-d14b-4421-b41c-1669f93253b3',
  durationSeconds: 14,
  match: 'movement',
};

export const demos: Readonly<Partial<Record<string, ExerciseDemo>>> = {
  'barbell-bench-press': bench,
  'paused-barbell-bench-press': {
    ...bench,
    match: 'related',
    difference: 'Pause not shown. Hold the bar still on your chest for 1–2 seconds each rep.',
  },
  'barbell-back-squat': squat,
  'paused-barbell-squat': {
    ...squat,
    match: 'related',
    difference: 'Pause not shown. Stay braced and hold the bottom for 2 seconds each rep.',
  },
  'barbell-deadlift': {
    ...yourMove,
    src: 'https://ymove.app/api/free/b59952ca-1551-4c07-835d-ab78bfe9953c',
    durationSeconds: 20,
    match: 'related',
    difference: 'Continuous reps shown. Reset on the floor and brace before each of your reps.',
  },
  'db-lateral-raise': {
    ...yourMove,
    src: 'https://ymove.app/api/free/a16f0235-20eb-4306-b9cc-c01ae51b3b9b',
    durationSeconds: 23,
    match: 'movement',
  },
  'selection-leg-extension': {
    ...yourMove,
    src: 'https://ymove.app/api/free/af0c3d19-5ee2-4a19-8688-f8504bb33e3c',
    durationSeconds: 18.52,
    match: 'related',
    difference: 'Plate-loaded machine shown, not your Selection machine. Follow your setup cues.',
  },
  dips: {
    ...wger,
    src: 'demos/dips.mp4',
    poster: 'demos/dips.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/194/d039ec90-474d-47a9-a3ad-bf0b00828c82.MP4',
    durationSeconds: 12.75,
    match: 'movement',
  },
  'seated-db-shoulder-press': {
    ...wger,
    src: 'demos/seated-dumbbell-press.mp4',
    poster: 'demos/seated-dumbbell-press.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/567/64f33c19-1d96-4b7c-af17-6c6a4941c614.MOV',
    durationSeconds: 11,
    match: 'related',
    difference: 'A reclined backrest is shown. Set your bench nearly upright as prescribed.',
  },
  'standing-db-curl': {
    ...wger,
    src: 'demos/standing-dumbbell-curl.mp4',
    poster: 'demos/standing-dumbbell-curl.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/92/8bfb917c-3d0d-49b9-8073-5d7e01c1b894.MOV',
    durationSeconds: 10.94,
    match: 'movement',
  },
  'seated-leg-curl': {
    ...wger,
    src: 'demos/seated-leg-curl.mp4',
    poster: 'demos/seated-leg-curl.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/366/43df4b79-d4c3-4fbf-bcb5-e0d825b84120.MOV',
    durationSeconds: 12,
    match: 'related',
    difference: 'Another seated leg-curl machine is shown. Use your machine’s pad and pivot setup.',
  },
  'fixed-handle-pull-up': {
    ...wger,
    src: 'demos/pull-up.mp4',
    poster: 'demos/pull-up.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV',
    durationSeconds: 18.77,
    match: 'related',
    difference: 'Overhand bar pull-ups shown from behind; your fixed handles and grip may differ.',
  },
  'one-db-two-hand-overhead-triceps-extension': {
    ...wger,
    src: 'demos/overhead-dumbbell-extension.mp4',
    poster: 'demos/overhead-dumbbell-extension.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/211/85f6eb25-a76c-409e-9af9-497794ac0dfb.MOV',
    durationSeconds: 12,
    match: 'movement',
  },
};
