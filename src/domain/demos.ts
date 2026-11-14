import vimeoSources from './vimeo-sources.json';
import type { MotionKind } from './exercise-motion';

interface DemoMedia {
  durationSeconds: number;
  credit: string;
  creditUrl: string;
}

type VideoMedia = DemoMedia &
  (
    | {
        kind: 'file';
        poster: string;
        src: string;
        licence: 'Your Move free collection' | 'CC BY-SA 4.0';
        licenceUrl: string;
      }
    | { kind: 'vimeo'; videoId: string; poster: string }
    | { kind: 'animation'; motion: MotionKind }
  );

export type ExerciseDemo = VideoMedia &
  ({ match: 'movement' } | { match: 'related'; difference: string });

/** Owner-published oEmbed metadata keeps the video and its poster paired. */
function vimeo(videoId: keyof typeof vimeoSources): VideoMedia {
  const source = vimeoSources[videoId];
  return {
    kind: 'vimeo',
    videoId,
    poster: source.poster,
    durationSeconds: source.durationSeconds,
    credit: `${source.author} · ${source.title}`,
    creditUrl: source.sourceUrl,
  };
}

/** Original, labelled movement diagrams share exactly the same model for preview and playback. */
function animation(motion: MotionKind): VideoMedia {
  return {
    kind: 'animation',
    motion,
    durationSeconds: 5,
    credit: 'Movement diagram · Steady',
    creditUrl: 'https://github.com/kdevdot/workout_tracker',
  };
}

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

type FileSource = Pick<
  Extract<VideoMedia, { kind: 'file' }>,
  'credit' | 'creditUrl' | 'licence' | 'licenceUrl'
>;
function file(slug: string, durationSeconds: number, source: FileSource): VideoMedia {
  return {
    ...source,
    kind: 'file',
    src: `demos/${slug}.mp4`,
    poster: `demos/${slug}.jpg`,
    durationSeconds,
  };
}

// Licensed local footage. Historical movement IDs keep their original meaning.
const fileDemos: Readonly<Record<string, ExerciseDemo>> = {
  'barbell-bench-press': {
    ...file('barbell-bench-press', 14.84, yourMove),
    match: 'movement',
  },
  'paused-barbell-bench-press': {
    ...file('barbell-bench-press', 14.84, yourMove),
    match: 'related',
    difference: 'Pause not shown. Hold the bar still on your chest for 1–2 seconds each rep.',
  },
  'barbell-back-squat': {
    ...file('barbell-back-squat', 14, yourMove),
    match: 'movement',
  },
  'paused-barbell-squat': {
    ...file('barbell-back-squat', 14, yourMove),
    match: 'related',
    difference: 'Pause not shown. Stay braced and hold the bottom for 2 seconds each rep.',
  },
  'barbell-deadlift': {
    ...file('barbell-deadlift', 20, yourMove),
    match: 'related',
    difference: 'Continuous reps shown. Reset on the floor and brace before each of your reps.',
  },
  'db-lateral-raise': {
    ...file('dumbbell-lateral-raise', 20, yourMove),
    match: 'movement',
  },
  dips: {
    ...file('dips', 12.75, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/194/d039ec90-474d-47a9-a3ad-bf0b00828c82.MP4',
    }),
    match: 'movement',
  },
  'seated-db-shoulder-press': {
    ...file('seated-dumbbell-press', 11, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/567/64f33c19-1d96-4b7c-af17-6c6a4941c614.MOV',
    }),
    match: 'related',
    difference: 'A reclined backrest is shown. Set your bench nearly upright as prescribed.',
  },
  'standing-db-curl': {
    ...file('standing-dumbbell-curl', 10.94, {
      ...wger,
      creditUrl: 'https://wger.de/media/exercise-video/92/8bfb917c-3d0d-49b9-8073-5d7e01c1b894.MOV',
    }),
    match: 'movement',
  },
  'seated-leg-curl': {
    ...file('seated-leg-curl', 12, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/366/43df4b79-d4c3-4fbf-bcb5-e0d825b84120.MOV',
    }),
    match: 'related',
    difference: 'Another seated leg-curl machine is shown. Use your machine’s pad and pivot setup.',
  },
  'fixed-handle-pull-up': {
    ...file('pull-up', 18.77, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV',
    }),
    match: 'related',
    difference: 'Overhand bar pull-ups shown from behind; your fixed handles and grip may differ.',
  },
  'one-arm-cable-overhead-triceps-extension': {
    ...file('one-arm-cable-overhead-extension', 9.3, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/803/99e0001f-217a-4b11-823c-014d24a5415e.MOV',
    }),
    match: 'movement',
  },
  'db-romanian-deadlift': {
    ...file('dumbbell-romanian-deadlift', 12, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/507/6b6054b5-9236-4a63-8392-6ea7a9010ca6.MOV',
    }),
    match: 'movement',
  },
  'db-stationary-split-squat': {
    ...file('split-squat', 9, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/205/4cd5dc48-897f-4e0c-8c5a-639a4098ceb1.MOV',
    }),
    match: 'movement',
  },
  'unica-arm-curl': {
    ...file('machine-preacher-curl', 12, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/465/5d2339a4-815f-46ba-aa19-8a763cfdeba0.MOV',
    }),
    match: 'related',
    difference:
      'Another preacher-curl machine is shown. Set the UNICA pad and bar as in your cues.',
  },
  'one-db-two-hand-overhead-triceps-extension': {
    ...file('overhead-dumbbell-extension', 12, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/211/85f6eb25-a76c-409e-9af9-497794ac0dfb.MOV',
    }),
    match: 'movement',
  },
  'low-incline-db-bench-press': {
    ...file('incline-dumbbell-press', 15, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/537/b9c937e9-daeb-42a9-be8e-7a77e368478c.MOV',
    }),
    match: 'movement',
  },
  'bent-over-db-reverse-fly': {
    ...file('seated-rear-delt-raise', 6.97, {
      ...wger,
      creditUrl: 'https://wger.de/media/exercise-video/82/ebf1e6d2-df48-44b8-a791-97f77e801bf3.MOV',
    }),
    match: 'movement',
  },
  'smith-squat': {
    ...file('smith-squat', 11.97, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/341/0cbfeace-dda9-4166-8424-f51358e88a4f.MOV',
    }),
    match: 'movement',
  },
  'one-arm-low-cable-lateral-raise': {
    ...file('one-arm-cable-lateral-raise', 13.23, {
      ...wger,
      creditUrl:
        'https://wger.de/media/exercise-video/349/9896d82e-d8b6-48af-bdd5-b8545dc523e9.MOV',
    }),
    match: 'movement',
  },
};

export const demos: Readonly<Partial<Record<string, ExerciseDemo>>> = {
  ...fileDemos,
  'barbell-romanian-deadlift': {
    ...vimeo('1000189819'),
    match: 'movement',
  },
  'incline-db-curl': {
    ...animation('incline-curl'),
    match: 'movement',
  },
  'hanging-knee-raise': {
    ...vimeo('1130705496'),
    match: 'related',
    difference:
      'A fixed straight bar is shown. Use your fixed handles, curl the pelvis toward the ribs and avoid swinging.',
  },
  'floor-reverse-crunch': {
    ...animation('reverse-crunch'),
    match: 'movement',
  },
  'machine-pec-fly': {
    ...animation('pec-fly'),
    match: 'movement',
  },
  'machine-reverse-fly': {
    ...animation('reverse-fly'),
    match: 'movement',
  },
  'unica-seated-row': {
    ...animation('supported-row'),
    match: 'related',
    difference: 'Illustrated chest-supported row. Use the UNICA long bars and its support setup.',
  },
  'unica-lat-pulldown': {
    ...animation('pulldown'),
    match: 'related',
    difference: 'Illustrated lat-bar path. Use the UNICA high hook and its own seat/thigh setup.',
  },
  'selection-leg-extension': {
    ...animation('leg-extension'),
    match: 'related',
    difference:
      'Illustrated knee-extension path. Use your Selection machine’s knee-pivot and pad settings.',
  },
  'supported-db-stationary-split-squat': {
    ...animation('split-squat'),
    match: 'movement',
  },
  'supported-single-leg-standing-db-calf-raise': {
    ...animation('standing-calf'),
    match: 'movement',
  },
  'supported-bodyweight-single-leg-calf-raise': {
    ...animation('bodyweight-calf'),
    match: 'movement',
  },
  'smith-flat-bench-press': {
    ...vimeo('223935810'),
    match: 'movement',
  },
  'low-incline-smith-press': {
    ...animation('smith-incline'),
    match: 'movement',
  },
  'bench-supported-one-arm-db-row': {
    ...vimeo('363596447'),
    match: 'movement',
  },
  'one-arm-standing-cable-fly': {
    ...animation('cable-fly'),
    match: 'movement',
  },
  'supine-heel-walkout': {
    ...animation('heel-walkout'),
    match: 'movement',
  },
  'unica-leg-extension': {
    ...animation('leg-extension'),
    match: 'related',
    difference:
      'Illustrated knee-extension path. Use the UNICA leg-extension setup in your saved cues.',
  },
  'landmine-t-bar-row': {
    ...animation('landmine-row'),
    match: 'movement',
  },
  'cable-anti-rotation-press': {
    ...animation('pallof'),
    match: 'movement',
  },
  'seated-db-calf-raise': {
    ...animation('seated-calf'),
    match: 'movement',
  },
};
