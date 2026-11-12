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
  'unica-lat-pulldown': {
    ...yourMove,
    src: 'https://ymove.app/api/free/5971eaa2-5264-49cc-99c2-1310305c5342',
    durationSeconds: 18.3,
    match: 'related',
    difference:
      'A cable station with a close handle is shown. Use the UNICA lat bar on the high hook.',
  },
  'unica-seated-row': {
    ...yourMove,
    src: 'https://ymove.app/api/free/77976f52-b13a-4fd0-addf-f4404e3a8e95',
    durationSeconds: 8.24,
    match: 'related',
    difference:
      'A cable row with a V-handle is shown. Use the UNICA long bars; the pull is the same.',
  },
  'machine-pec-fly': {
    ...yourMove,
    src: 'https://ymove.app/api/free/e2b1d801-055a-4dc5-ad6e-486e3dbfcfb7',
    durationSeconds: 20,
    match: 'related',
    difference: 'Standing cable fly shown. The machine guides the same arm path while you sit.',
  },
  'one-arm-cable-overhead-triceps-extension': {
    ...wger,
    src: 'demos/one-arm-cable-overhead-extension.mp4',
    poster: 'demos/one-arm-cable-overhead-extension.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/803/99e0001f-217a-4b11-823c-014d24a5415e.MOV',
    durationSeconds: 9.3,
    match: 'movement',
  },
  'db-romanian-deadlift': {
    ...wger,
    src: 'demos/dumbbell-romanian-deadlift.mp4',
    poster: 'demos/dumbbell-romanian-deadlift.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/507/6b6054b5-9236-4a63-8392-6ea7a9010ca6.MOV',
    durationSeconds: 12,
    match: 'movement',
  },
  'db-stationary-split-squat': {
    ...wger,
    src: 'demos/split-squat.mp4',
    poster: 'demos/split-squat.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/205/4cd5dc48-897f-4e0c-8c5a-639a4098ceb1.MOV',
    durationSeconds: 9,
    match: 'movement',
  },
  'unica-arm-curl': {
    ...wger,
    src: 'demos/machine-preacher-curl.mp4',
    poster: 'demos/machine-preacher-curl.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/465/5d2339a4-815f-46ba-aa19-8a763cfdeba0.MOV',
    durationSeconds: 12,
    match: 'related',
    difference:
      'Another preacher-curl machine is shown. Set the UNICA pad and bar as in your cues.',
  },
  'machine-reverse-fly': {
    ...wger,
    src: 'demos/seated-rear-delt-raise.mp4',
    poster: 'demos/seated-rear-delt-raise.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/82/ebf1e6d2-df48-44b8-a791-97f77e801bf3.MOV',
    durationSeconds: 6.97,
    match: 'related',
    difference:
      'Bent-over dumbbell version shown. The machine makes the same arm sweep, chest on the pad.',
  },
  'supported-single-leg-standing-db-calf-raise': {
    ...wger,
    src: 'demos/standing-calf-raise.mp4',
    poster: 'demos/standing-calf-raise.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/622/461171e5-2b16-407d-bf27-27aeef43f105.MOV',
    durationSeconds: 12,
    match: 'related',
    difference:
      'Shown on a step without a dumbbell. Do one leg on the floor, DB in hand, holding the upright.',
  },
  'seated-db-calf-raise': {
    ...wger,
    src: 'demos/seated-calf-raise.mp4',
    poster: 'demos/seated-calf-raise.jpg',
    creditUrl: 'https://wger.de/media/exercise-video/590/a325ae2e-686b-4a1f-aff2-ba37fa3fa157.MOV',
    durationSeconds: 12,
    match: 'related',
    difference:
      'A seated calf machine is shown. Rest dumbbells on your thighs instead, never on the kneecaps.',
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
