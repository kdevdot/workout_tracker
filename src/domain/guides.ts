export interface Video {
  id: string;
  title: string;
  author: string;
  variant?: string;
}

interface Comparison {
  topic: string;
  reel: string;
  /** Creator's order, best first. Attribution, not endorsement. */
  ranking: string;
  verdict: string;
  forYou: string;
}

export interface Guide {
  /** Drawing file in public/exercises, without the .svg extension. */
  illustration: string;
  video?: Video;
  checks: string[];
  stop: string[];
  comparison?: Comparison;
}

const reels = {
  shoulders: 'https://www.instagram.com/joshuaktl_/reel/DfMaQpzh19U/',
  back: 'https://www.instagram.com/joshuaktl_/reel/DfO9uySyKFF/',
};

const rackStop = 'Safety arms just below your lowest point, every set.';

export const guides: Record<string, Guide> = {
  'barbell-bench-press': {
    illustration: 'bench-press',
    video: {
      id: 'A0NBCkpYatQ',
      title: 'Bench Press for Maximum Muscle Growth',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Bar to mid/lower chest, forearms vertical',
      'Feet planted, shoulder blades set',
      'Touch, then press; no bounce',
    ],
    stop: [rackStop, 'Stop for shoulder pain or losing bar control.'],
  },
  'paused-barbell-bench-press': {
    illustration: 'bench-press',
    video: {
      id: 'K4BIkKGKy9k',
      title: 'Paused Bench Press: Gym Shorts (How To)',
      author: 'Barbell Logic',
    },
    checks: ['Lighter than heavy day', 'Bar still on chest 1–2 s', 'Stay tight, then press'],
    stop: [rackStop],
  },
  'landmine-t-bar-row': {
    illustration: 't-bar-row',
    video: {
      id: 'EyA_ym9Ksaw',
      title: 'Landmine T-Bar Row (How To & Coaching Points)',
      author: 'Horton Barbell',
    },
    checks: ['Bar end anchored, cannot slide', 'Flat back, chest up', 'Row to lower chest'],
    stop: ['Stop when the torso jerks up to move the weight.'],
    comparison: {
      topic: 'Mid-back',
      reel: reels.back,
      ranking: 'Chest-supported Smith row > barbell row > two-DB bent-over row',
      verdict:
        'Support reduces how much the trunk limits the set; no study shows the Smith row grows more back.',
      forYou:
        'The landmine row keeps the bar path fixed; the UNICA seated row on Upper B gives you full chest support.',
    },
  },
  'unica-lat-pulldown': {
    illustration: 'lat-pulldown',
    video: {
      id: 'EUIri47Epcg',
      title: 'Normal Grip Pulldown',
      author: 'Renaissance Periodization',
      variant: 'Dedicated machine shown; the UNICA lat bar works the same way.',
    },
    checks: ['Thighs locked under pads', 'Pull to upper chest', 'Arms fully straight at top'],
    stop: ['Stop when you lean back or yank the bar.'],
  },
  'unica-seated-row': {
    illustration: 'machine-row',
    video: {
      id: '_FrrYQxA6kc',
      title: 'Machine Chest Supported Row',
      author: 'Renaissance Periodization',
      variant: 'Another machine shown; use the UNICA long bars.',
    },
    checks: ['Chest on pad', 'Row to stomach, squeeze', 'Release slowly, shoulders reach'],
    stop: ['Stop when the torso rocks back.'],
  },
  dips: {
    illustration: 'chest-dip',
    video: {
      id: '4LA1kF7yCGo',
      title: 'Dip',
      author: 'Renaissance Periodization',
    },
    checks: ['Lean forward for chest', 'Shoulders just below elbows', 'Press up under control'],
    stop: ['Stop for shoulder pain at the bottom.'],
  },
  'unica-arm-curl': {
    illustration: 'preacher-curl',
    video: {
      id: 'Ja6ZlIDONac',
      title: 'Machine Preacher Curl',
      author: 'Renaissance Periodization',
      variant: 'Another machine shown; use the UNICA arm-curl pad.',
    },
    checks: ['Elbows stay on the pad', 'Arms fully straight at bottom', 'Superset with triceps'],
    stop: ['Stop when the elbows lift off the pad.'],
  },
  'one-arm-cable-overhead-triceps-extension': {
    illustration: 'overhead-tricep-extension',
    video: {
      id: 'w3iAESGWK6M',
      title: 'Single Arm Cable Overhead Tricep Extension',
      author: 'Travis Tarrant',
    },
    checks: ['Face away, elbow points up', 'Full stretch behind the head', 'Upper arm stays still'],
    stop: ['Stop for elbow or shoulder pain.'],
  },
  'barbell-back-squat': {
    illustration: 'squat',
    video: {
      id: 'i7J5h7BJ07g',
      title: 'High Bar Squat',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Bar on upper back, not neck',
      'Whole foot planted, knees over toes',
      'Same depth every rep',
    ],
    stop: [rackStop, 'Stop if heels lift or the bottom feels unstable.'],
  },
  'paused-barbell-squat': {
    illustration: 'squat',
    video: {
      id: 'nknf16JJTZo',
      title: 'The Paused Squat: Gym Shorts (How To)',
      author: 'Barbell Logic',
    },
    checks: ['Lighter than heavy day', 'Hold the bottom 2 s, braced', 'Drive up, no bounce'],
    stop: [rackStop],
  },
  'selection-leg-extension': {
    illustration: 'leg-extension',
    video: {
      id: 'm0FOpMEgero',
      title: 'Leg Extension',
      author: 'Renaissance Periodization',
    },
    checks: ['Knee lined up with the pivot', 'Pad on lower shin', 'Extend without kicking'],
    stop: ['Stop for knee pain or hips lifting.'],
  },
  'seated-leg-curl': {
    illustration: 'seated-leg-curl',
    video: {
      id: 'Orxowest56U',
      title: 'Seated Leg Curl',
      author: 'Renaissance Periodization',
    },
    checks: ['Thigh pad snug, lean forward', 'Curl fully', 'Slow back to straight legs'],
    stop: ['Stop for cramping or hips lifting.'],
  },
  'barbell-deadlift': {
    illustration: 'deadlift',
    video: {
      id: 'GxsLrTzyGUU',
      title: 'How to Do A Conventional Deadlift Correctly',
      author: 'PureGym',
    },
    checks: ['Bar over mid-foot', 'Brace, slack out, push the floor', 'Bar drags up the legs'],
    stop: ['Stop if the lower back rounds or the bar drifts forward.'],
  },

  'fixed-handle-pull-up': {
    illustration: 'pull-up',
    video: {
      id: 'iWpoegdfgtc',
      title: 'Normal Grip Pullup',
      author: 'Renaissance Periodization',
      variant: 'Bar pull-up shown; your fixed handles work the same way.',
    },
    checks: [
      'Fixed handles, comfortable grip',
      'Pull elbows toward ribs',
      'Lower slowly to full hang',
    ],
    stop: ['Stop before kipping or craning the neck.'],
    comparison: {
      topic: 'Lats',
      reel: reels.back,
      ranking: 'Seated pulldown > straight-arm cable pullover > pull-up',
      verdict:
        'Studies show these pulls differ in movement and muscle activity, not that pull-ups grow less.',
      forYou:
        'Keep pull-ups while you hit the reps at target RIR; otherwise use the UNICA lat pulldown.',
    },
  },

  'seated-db-shoulder-press': {
    illustration: 'seated-dumbbell-press',
    video: {
      id: 'HzIiNhHhhtA',
      title: 'Seated Dumbbell Shoulder Press',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Backrest near upright, ribs down',
      'Press along a natural arc',
      'Neutral grip is fine',
    ],
    stop: ['Stop for a big back arch or if you cannot return the DBs safely.'],
    comparison: {
      topic: 'Shoulder press',
      reel: reels.shoulders,
      ranking: 'Shoulder press machine > seated DB press > standing barbell press',
      verdict:
        'Body position and implement change activation and strength, but no growth ranking of the three exists.',
      forYou:
        'Keep seated DBs. Your gym has no dedicated press machine; the pec/reverse-fly machine is not one.',
    },
  },
  'db-lateral-raise': {
    illustration: 'lateral-raise',
    video: {
      id: 'OuG1smZTsQQ',
      title: 'Lateral Raise',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Soft elbows, raise slightly forward of the sides',
      'Up to about shoulder height',
      'Lower slowly',
    ],
    stop: ['Stop when shrugging or swinging takes over.'],
    comparison: {
      topic: 'Side delts',
      reel: reels.shoulders,
      ranking: 'Upright one-arm cable > dumbbells > leaning-away cable',
      verdict:
        'An 8-week trial found similar side-delt growth with cable and dumbbell raises over a matched range.',
      forYou:
        'DBs or the one-arm cable alternative both work. Pick whichever you can progress smoothly; keep the weekly sets as planned.',
    },
  },
  'standing-db-curl': {
    illustration: 'bicep-curl',
    video: {
      id: 'iixND1P2lik',
      title: 'Alternating Dumbbell Curl',
      author: 'Renaissance Periodization',
      variant: 'Alternating arms shown; both-arm curls are fine too.',
    },
    checks: ['Upper arms stay still', 'No hip drive', 'Lower to a comfortable straight elbow'],
    stop: ['Stop when swinging replaces clean elbow bending.'],
  },

  'db-romanian-deadlift': {
    illustration: 'dumbbell-romanian-deadlift',
    video: {
      id: 'cYKYGwcg0U8',
      title: 'Dumbbell Stiff Legged Deadlift',
      author: 'Renaissance Periodization',
      variant: 'Same hip hinge as the RDL; keep knees soft.',
    },
    checks: [
      'DBs close to thighs, knees soft',
      'Push hips back, spine neutral',
      'Stand by driving hips forward',
    ],
    stop: ['Stop the descent before your back rounds. Touching the floor is not the goal.'],
    comparison: {
      topic: 'Lower back',
      reel: reels.back,
      ranking: 'Underhand pulldown > underhand row > back extension',
      verdict:
        'Rejected: pulldowns and rows train the lats, not the lower-back extensors. The three are different jobs.',
      forYou: 'Keep braced RDLs for the posterior chain. Do not swap hinges for pulldowns.',
    },
  },

  'supported-single-leg-standing-db-calf-raise': {
    illustration: 'single-leg-calf-raise',
    video: {
      id: '_gEx2ijsmNM',
      title: 'Single Leg Stair Calves',
      author: 'Renaissance Periodization',
      variant: 'On a stair shown; floor range is smaller without a step.',
    },
    checks: [
      'Light hand on a fixed upright',
      'Knee mostly straight',
      'Pause at the top, heel to floor',
    ],
    stop: ['Stop before bouncing or bending the knee to lift.'],
  },
  'hanging-knee-raise': {
    illustration: 'hanging-knee-raise',
    video: {
      id: 'O7iDA3ory-w',
      title: 'How To Do Hanging Knee Raises',
      author: 'PureGym',
      variant: 'Bar shown; your fixed handles work the same way.',
    },
    checks: ['Shoulders set, no swing', 'Curl pelvis up, knees to chest', 'Lower slowly'],
    stop: ['Stop when swinging or grip takes over.'],
  },

  'machine-pec-fly': {
    illustration: 'pec-deck',
    video: {
      id: 'FDay9wFe5uE',
      title: 'Machine Flye',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Handles at chest height, back on the pad',
      'Soft elbows',
      'Return only as far as shoulders allow',
    ],
    stop: ['Stop for shoulder discomfort or torso rocking.'],
  },
  'machine-reverse-fly': {
    illustration: 'reverse-pec-deck',
    video: {
      id: '5YK4bgzXDp0',
      title: 'Machine Reverse Flye',
      author: 'Renaissance Periodization',
    },
    checks: ['Chest on the pad', 'Handles near shoulder height', 'Arms out wide, elbows soft'],
    stop: ['Stop when shrugging or jerking takes over.'],
    comparison: {
      topic: 'Rear delts',
      reel: reels.shoulders,
      ranking: 'One-arm cross-body cable fly > supported DB fly > rope face pull',
      verdict:
        'These are different movements, not a proven best-to-worst order. A stretched start is plausible, not proven.',
      forYou:
        'Keep the reverse-fly machine (or its DB alternative). No need to add another rear-delt exercise.',
    },
  },
  'one-db-two-hand-overhead-triceps-extension': {
    illustration: 'dumbbell-overhead-tricep-extension',
    video: {
      id: 'MPmeelJOmN8',
      title: 'Dumbbell Two Hand Overhead Tricep Extension',
      author: 'Bodhi Bodies',
    },
    checks: [
      'One DB held securely in both hands',
      'Brace, bend elbows to a comfortable depth',
      'Elbows needn’t touch',
    ],
    stop: ['Switch to pushdowns if your back arches or elbows hurt.'],
  },

  'db-stationary-split-squat': {
    illustration: 'split-squat',
    video: {
      id: 'jNihW0WDIL4',
      title: 'Split Squat',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Both feet planted, hip-width stagger',
      'Drop straight down',
      'Drive through the front foot',
    ],
    stop: ['Stop if balance goes or the back leg does the work.'],
  },
  'seated-db-calf-raise': {
    illustration: 'seated-calf-raise',
    video: {
      id: 'UnBXxegoaCI',
      title: 'Dumbbell Seated Calf Raise',
      author: 'Josh Evans',
    },
    checks: [
      'Knees about 90°',
      'DBs on thighs above the knee, never on kneecaps',
      'Pause at the top',
    ],
    stop: ['Stop if the load slides or you start bouncing.'],
  },
  'cable-anti-rotation-press': {
    illustration: 'pallof-press',
    video: {
      id: 'xeFp4MXad98',
      title: 'Cable Pallof Press',
      author: 'FIT.nl',
    },
    checks: ['Side-on, handle at sternum', 'Press out, torso stays square', 'Both sides = one set'],
    stop: ['Stop if the cable turns your torso.'],
  },
};

const muscleIds: Record<string, number[]> = {
  Chest: [4],
  Lats: [12],
  'Mid-back': [9],
  'Upper back': [9],
  // wger draws only the front deltoid, so all shoulder heads light the same region.
  Delts: [2],
  'Front delts': [2],
  'Side delts': [2],
  'Rear delts': [2],
  Biceps: [1],
  Brachialis: [13],
  Triceps: [5],
  Quads: [10],
  Glutes: [8],
  Hamstrings: [11],
  Calves: [7, 15],
  'Calves (gastrocnemius emphasis)': [7],
  'Calves (bent-knee/soleus emphasis)': [15],
  Abdominals: [6],
  'Abdominal bracing/control': [6],
  'Trunk and spinal bracing': [6, 14],
  Obliques: [14],
  'Lateral trunk': [14],
};

/** Front-view wger muscles; the rest are drawn on the back view. */
export const FRONT_MUSCLES = new Set([1, 2, 3, 4, 6, 10, 13, 14]);

export function musclesFor(labels: readonly string[]): number[] {
  return [...new Set(labels.flatMap((label) => muscleIds[label] ?? []))];
}

export function hasMuscleMapping(label: string): boolean {
  return label in muscleIds;
}
