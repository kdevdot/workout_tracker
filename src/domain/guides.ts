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

const smithStop = 'Smith: test hooks and stops with a light load first.';

export const guides: Record<string, Guide> = {
  'smith-flat-bench-press': {
    illustration: 'bench-press',
    video: {
      id: 'O5viuEPDXKY',
      title: 'Smith Machine Bench Press',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Bar to mid/lower chest, forearms vertical',
      'Feet planted, shoulder blades set',
      'Lower under control, no bounce',
    ],
    stop: [smithStop, 'Stop for shoulder pain or losing bar control.'],
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
        'Keep pull-ups while you hit the reps at target RIR; otherwise use the one-arm cable pulldown.',
    },
  },
  'bench-supported-one-arm-db-row': {
    illustration: 'one-arm-dumbbell-row',
    video: {
      id: 'DMo3HJoawrU',
      title: 'Single Arm Supported Dumbbell Row',
      author: 'Renaissance Periodization',
    },
    checks: [
      'Hand (and knee) on bench, hips square',
      'Row toward hip / lower ribs',
      'Controlled reach at the bottom',
    ],
    stop: ['Stop when torso twists or the rep turns into a jerk.'],
    comparison: {
      topic: 'Mid-back',
      reel: reels.back,
      ranking: 'Chest-supported Smith row > barbell row > two-DB bent-over row',
      verdict:
        'Support reduces how much the trunk limits the set; no study shows the Smith row grows more back.',
      forYou:
        'Your bench-supported row already gives that support. It is not the unsupported row the reel rates worst.',
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
        'DBs or the one-arm cable alternative both work. Pick whichever you can progress smoothly; keep 4 weekly sets.',
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
  'one-arm-cable-pushdown': {
    illustration: 'tricep-pushdown',
    video: {
      id: 'Cp_bShvMY4c',
      title: 'Cable Single Arm Pushdown',
      author: 'Renaissance Periodization',
    },
    checks: ['Upper arm pinned beside torso', 'Extend fully, return under control', 'No rocking'],
    stop: ['Stop when the upper arm or body starts moving.'],
  },
  'smith-squat': {
    illustration: 'smith-machine-squat',
    video: {
      id: '-eO_VydErV0',
      title: 'Feet Forward Smith Squat',
      author: 'Renaissance Periodization',
      variant: 'Feet-forward stance shown; use the stance you set up.',
    },
    checks: [
      'Bar on upper back, not neck',
      'Whole foot planted, knees track over toes',
      'Same depth every rep',
    ],
    stop: [smithStop, 'Set stops just below your bottom position.'],
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
  'unica-leg-extension': {
    illustration: 'leg-extension',
    video: {
      id: 'm0FOpMEgero',
      title: 'Leg Extension',
      author: 'Renaissance Periodization',
      variant: 'Dedicated machine shown; use the staff-confirmed UNICA setup.',
    },
    checks: ['Knee lined up with the lever pivot', 'Pad on lower shin', 'Extend without kicking'],
    stop: ['Use only after staff confirm the setup; otherwise do split squats.'],
  },
  'supine-heel-walkout': {
    illustration: 'glute-bridge',
    video: {
      id: '6yeyt5mUo94',
      title: 'Glute Bridge into Hamstring Walkout',
      author: 'Runna',
    },
    checks: ['Hips up, heels planted', '2–3 small steps out, 2–3 back = 1 rep', 'Keep hips high'],
    stop: ['Stop if hips sag or hamstrings cramp.'],
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
  'dead-bug': {
    illustration: 'dead-bug',
    video: {
      id: 'GbSC02oU3To',
      title: 'How to Do a Dead Bug',
      author: 'Hinge Health',
    },
    checks: [
      'Exhale, ribs and low back down',
      'Reach opposite arm and leg slowly',
      'Only as far as your back stays flat',
    ],
    stop: ['Stop before your low back arches.'],
  },
  'low-incline-db-bench-press': {
    illustration: 'incline-dumbbell-press',
    video: {
      id: 'B09ZkYsnKko',
      title: 'Low Incline Dumbbell Press',
      author: 'Renaissance Periodization',
    },
    checks: ['Bench about 15–30°, locked', 'Wrists over elbows', 'Same chest depth every rep'],
    stop: ['Avoid a steep, shoulder-press angle. No dropping DBs.'],
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
  'smith-romanian-deadlift': {
    illustration: 'smith-machine-romanian-deadlift',
    video: {
      id: 'CN_7cz3P-1U',
      title: 'Stiff Legged Deadlift',
      author: 'Renaissance Periodization',
      variant: 'Free barbell shown; the hinge is the same on the Smith.',
    },
    checks: [
      'Bar close to thighs, knees soft',
      'Push hips back, spine neutral',
      'Stand by driving hips forward',
    ],
    stop: [smithStop, 'Stop the descent before your back rounds.'],
    comparison: {
      topic: 'Lower back',
      reel: reels.back,
      ranking: 'Underhand pulldown > underhand row > back extension',
      verdict:
        'Rejected: pulldowns and rows train the lats, not the lower-back extensors. The three are different jobs.',
      forYou: 'Keep braced RDLs for the posterior chain. Do not swap hinges for pulldowns.',
    },
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
  'side-plank': {
    illustration: 'side-plank',
    video: {
      id: 'iNbH7_edNI8',
      title: 'Side Plank Tutorial',
      author: 'Runna',
    },
    checks: ['Elbow under shoulder', 'Knees or feet, straight side line', 'Breathe steadily'],
    stop: ['End with 5–10 s of good form left, before hips sag.'],
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
