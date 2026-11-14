import type { Exercise, Phase, Workout, WorkoutId } from './programme-types';

import { formatPrescription } from './prescriptions';
import type { MovementPrescription } from './programme-types';

type Movement = Omit<Exercise, 'sets' | 'min' | 'max' | 'alternative'> & {
  alternative: { name: string; note: string; movement: MovementPrescription };
};

const barbellBench: Movement = {
  id: 'barbell-bench-press',
  name: 'Barbell bench press',
  unit: 'reps',
  perSide: false,
  restSeconds: 240,
  restLabel: '3–4 min',
  targetRir: '2',
  loadKind: 'barbell',
  equipment: 'Olympic half rack, Olympic bar, plates, flat bench, safety arms',
  primary: ['Chest'],
  supporting: ['Triceps', 'Front delts'],
  cues: [
    'Plant feet and set shoulder blades. Lower to a repeatable mid/lower-chest touch point with forearms near vertical.',
    'Press without bouncing; maintain a comfortable, repeatable range.',
    'Set and test safety arms just below your lowest controlled position. End the set before a grinding rep or loss of bar control.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Smith flat bench press',
    movement: {
      id: 'smith-flat-bench-press',
      min: 5,
      max: 8,
      unit: 'reps',
      perSide: false,
      loadKind: 'smith',
    },
    note: 'Same sets, RIR and rest. Learn the hooks and test the stops with a light load. Never assume the unloaded Smith bar weighs 20 kg or convert it to free-bar load.',
  },
};

const latPulldown: Movement = {
  id: 'unica-lat-pulldown',
  name: 'UNICA lat pulldown',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '2',
  loadKind: 'machine',
  equipment: 'UNICA, lat bar on the high hook',
  primary: ['Lats'],
  supporting: ['Biceps', 'Upper back'],
  cues: [
    'Use a comfortable grip, brace the thighs and begin from a controlled overhead reach.',
    'Pull the upper arms toward the sides and the bar toward the upper chest; keep the torso angle consistent.',
    'End the set before leaning back or yanking replaces the pull.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Fixed-handle pull-up',
    movement: {
      id: 'fixed-handle-pull-up',
      min: 5,
      max: 8,
      unit: 'reps',
      perSide: false,
      loadKind: 'bodyweight',
    },
    note: 'Same sets, RIR and rest. Use only if 5–8 clean reps leave the displayed reserve. Use fixed handles, a comfortable grip and controlled lowering; no kipping.',
  },
};

const seatedRow: Movement = {
  id: 'unica-seated-row',
  name: 'UNICA supported seated row',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '2 min',
  targetRir: '2',
  loadKind: 'machine',
  equipment: 'UNICA seated-row long bars',
  primary: ['Mid-back', 'Lats'],
  supporting: ['Rear delts', 'Biceps'],
  cues: [
    'Keep the torso against the support and row the long bars toward the stomach/lower ribs.',
    'Allow controlled shoulder-blade reach on the return; keep the torso and range repeatable.',
    'End the set before rocking or jerking the torso moves the load.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Bench-supported one-arm DB row',
    movement: {
      id: 'bench-supported-one-arm-db-row',
      min: 8,
      max: 12,
      unit: 'reps',
      perSide: true,
      loadKind: 'dumbbell',
    },
    note: 'Same sets, RIR and rest. One hand and knee on the bench; row toward the hip.',
  },
};

const pecFly: Movement = {
  id: 'machine-pec-fly',
  name: 'Machine pec fly',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Pectoral/reverse-fly machine in pec mode',
  primary: ['Chest'],
  supporting: [],
  cues: [
    'Adjust the seat so the handles fit your chest/shoulder position and keep the back supported.',
    'Move the upper arms through a comfortable arc with softly bent elbows; do not turn the fly into a press.',
    'Control the return and stop before shoulder discomfort or torso rocking.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'One-arm standing cable fly',
    movement: {
      id: 'one-arm-standing-cable-fly',
      min: 10,
      max: 15,
      unit: 'reps',
      perSide: true,
      loadKind: 'cable',
    },
    note: 'Same sets, RIR and rest. Chest-height D-handle, staggered stance, slight elbow bend; sweep across chest and return without rotation. Stop if elbow angle or rotation control is lost.',
  },
};

const lateralRaise: Movement = {
  id: 'db-lateral-raise',
  name: 'DB lateral raise',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'Light DB pair',
  primary: ['Side delts'],
  supporting: [],
  cues: [
    'Raise slightly forward of directly sideways with soft elbows, to about shoulder height.',
    'Allow normal shoulder-blade movement; control the lowering without hip drive or heaving.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'One-arm low-cable lateral raise',
    movement: {
      id: 'one-arm-low-cable-lateral-raise',
      min: 12,
      max: 20,
      unit: 'reps',
      perSide: true,
      loadKind: 'cable',
    },
    note: 'Same sets, RIR and rest. Low pulley, D-handle in outside hand, standing side-on; use a comfortable arc without leaning for momentum. Stop if the cable path is awkward.',
  },
};

const reverseFly: Movement = {
  id: 'machine-reverse-fly',
  name: 'Machine reverse fly',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Pectoral/reverse-fly machine in marked reverse mode',
  primary: ['Rear delts'],
  supporting: ['Upper back'],
  cues: [
    'Keep the chest supported and set the handles around shoulder height.',
    'Move the upper arms outward/back with softly bent elbows and a controlled return.',
    'Stop before heaving the torso off the pad or jerking replaces the arm movement.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Bent-over DB reverse fly',
    movement: {
      id: 'bent-over-db-reverse-fly',
      min: 12,
      max: 20,
      unit: 'reps',
      perSide: false,
      loadKind: 'dumbbell',
    },
    note: 'Same sets, RIR and rest. Hinge with light DBs and a braced trunk; move elbows outward with slight bend and lower under control. Prioritise the machine if lower back is limiting.',
  },
};

const armCurl: Movement = {
  id: 'unica-arm-curl',
  name: 'UNICA supported arm curl',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'UNICA arm-curl bar and pad',
  primary: ['Biceps', 'Brachialis'],
  supporting: [],
  cues: [
    'Set the seat and pad so the upper arms remain supported throughout the curl.',
    'Lower to a comfortable near-straight elbow without dropping or forcing hyperextension.',
    'Curl without lifting the arms from the pad or driving the torso.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Standing DB curl',
    movement: {
      id: 'standing-db-curl',
      min: 10,
      max: 15,
      unit: 'reps',
      perSide: false,
      loadKind: 'dumbbell',
    },
    note: 'Same sets, RIR and rest. Upper arms still, no hip drive.',
  },
};

const cableOverheadExtension: Movement = {
  id: 'one-arm-cable-overhead-triceps-extension',
  name: 'One-arm cable overhead triceps extension',
  unit: 'reps',
  perSide: true,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'cable',
  equipment: 'Cable column, D-handle, low or middle pulley',
  primary: ['Triceps'],
  supporting: [],
  cues: [
    'Face away from the pulley in a stable staggered stance with the upper arm mostly overhead.',
    'Bend and straighten the elbow through a comfortable range without excessive torso arching.',
    'Keep upper-arm position repeatable rather than forcing the elbow into an extreme position.',
    'Complete both sides for one set. Start with the weaker side and match clean reps. Allow time to switch sides, then take the listed rest; extend it if needed.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'One-DB two-hand overhead extension',
    movement: {
      id: 'one-db-two-hand-overhead-triceps-extension',
      min: 10,
      max: 15,
      unit: 'reps',
      perSide: false,
      loadKind: 'dumbbell',
    },
    note: 'Same sets, RIR and rest. Hold one DB securely in both hands overhead and extend from a deep, comfortable elbow bend.',
  },
};

const backSquat: Movement = {
  id: 'barbell-back-squat',
  name: 'Barbell back squat',
  unit: 'reps',
  perSide: false,
  restSeconds: 240,
  restLabel: '3–4 min',
  targetRir: '2',
  loadKind: 'barbell',
  equipment: 'Olympic half rack, Olympic bar, plates, safety arms',
  primary: ['Quads', 'Glutes'],
  supporting: ['Trunk and spinal bracing'],
  cues: [
    'Bar on the upper back, feet planted, trunk braced; let the knees follow a comfortable toe direction.',
    'Use the deepest comfortable position you can control and reproduce without changing it to finish reps.',
    'Set and test safety arms just below your lowest controlled position. End the set before a grinding rep or loss of bar control.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Smith squat',
    movement: {
      id: 'smith-squat',
      min: 5,
      max: 8,
      unit: 'reps',
      perSide: false,
      loadKind: 'smith',
    },
    note: 'Same sets, RIR and rest. Adjust feet to the fixed path. Learn the hooks and test the stops with a light load. Never assume the unloaded Smith bar weighs 20 kg or convert it to free-bar load.',
  },
};

const barbellRdl: Movement = {
  id: 'barbell-romanian-deadlift',
  name: 'Barbell Romanian deadlift',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '2',
  loadKind: 'barbell',
  equipment: 'Olympic bar, plates, rack for controlled pickup',
  primary: ['Hamstrings', 'Glutes'],
  supporting: ['Trunk and spinal bracing'],
  cues: [
    'Begin standing with a modest knee bend; move the hips back and keep the bar close to the legs.',
    'Lower only as far as the controlled hinge allows. The bottom is not determined by touching the floor.',
    'Stand by bringing the hips forward without leaning backward. Log if grip or torso control ends the set first.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'DB Romanian deadlift',
    movement: {
      id: 'db-romanian-deadlift',
      min: 6,
      max: 10,
      unit: 'reps',
      perSide: false,
      loadKind: 'dumbbell',
    },
    note: 'Same sets, RIR and rest. Use the same controlled hinge with DBs close to the legs. Log kilograms per DB; do not convert the barbell load.',
  },
};

const seatedLegCurl: Movement = {
  id: 'seated-leg-curl',
  name: 'Seated leg curl',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Technogym Selection 700 Dual Leg Curl/Extension, curl mode',
  primary: ['Hamstrings'],
  supporting: [],
  cues: [
    'Align the knee with the pivot, secure the thigh pad and keep the pelvis supported and stable.',
    'Use the available controlled knee-extension and curl range without lifting the hips or slamming the stack.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Supine heel walkout',
    movement: {
      id: 'supine-heel-walkout',
      min: 4,
      max: 8,
      unit: 'cycles',
      perSide: false,
      loadKind: 'bodyweight',
    },
    note: 'Same sets, RIR and rest. On a clear non-slip floor, bridge with heels planted, walk the feet out and back under control. One full out-and-back is one cycle. This is a knee-flexion workaround, not a claim of equivalence to machine curls.',
  },
};

const legExtension: Movement = {
  id: 'selection-leg-extension',
  name: 'Leg extension',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Technogym Selection 700 Dual Leg Curl/Extension, extension mode',
  primary: ['Quads'],
  supporting: [],
  cues: [
    'Keep the hips against the seat, align the knee with the pivot and place the roller above the ankle.',
    'Extend and lower under control without kicking, lifting the hips or slamming the stack.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'UNICA leg extension',
    movement: {
      id: 'unica-leg-extension',
      min: 10,
      max: 15,
      unit: 'reps',
      perSide: false,
      loadKind: 'machine',
    },
    note: 'Same sets, RIR and rest. Use the intended UNICA leg-extension setup after staff confirmation. Keep the hips supported; the two machine loads are not interchangeable.',
  },
};

const standingCalf: Movement = {
  id: 'supported-single-leg-standing-db-calf-raise',
  name: 'Supported single-leg standing DB calf raise',
  unit: 'reps',
  perSide: true,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'One DB, fixed rack upright for balance, floor',
  primary: ['Calves'],
  supporting: [],
  cues: [
    'Use a fixed upright lightly for balance, hold one DB and keep the working knee relatively straight.',
    'Rise through the forefoot and lower under control through the available floor range without bouncing.',
    'Do not assume a calf step or make a platform from loose plates.',
    'Complete both sides for one set. Start with the weaker side and match clean reps. Allow time to switch sides, then take the listed rest; extend it if needed.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Supported bodyweight single-leg calf raise',
    movement: {
      id: 'supported-bodyweight-single-leg-calf-raise',
      min: 15,
      max: 25,
      unit: 'reps',
      perSide: true,
      loadKind: 'bodyweight',
    },
    note: 'Same sets, RIR and rest. Use the fixed upright lightly for balance and the floor, with controlled straight-knee movement; no added platform.',
  },
};

const kneeRaise: Movement = {
  id: 'hanging-knee-raise',
  name: 'Hanging knee raise with pelvic curl',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '2',
  loadKind: 'bodyweight',
  equipment: "Smith station's fixed overhead handles",
  primary: ['Abdominals'],
  supporting: [],
  cues: [
    'Hang from fixed handles with shoulders controlled and begin without swinging.',
    'Curl the pelvis toward the ribs as the knees rise; lifting only the thighs is not the intended movement.',
    'Lower under control. Use the floor reverse crunch if grip prevents controlled abdominal work.',
  ],
  alternative: {
    name: 'Floor reverse crunch',
    movement: {
      id: 'floor-reverse-crunch',
      min: 10,
      max: 20,
      unit: 'reps',
      perSide: false,
      loadKind: 'bodyweight',
    },
    note: 'Same sets, RIR and rest. Lie on a clear floor with knees bent, curl the pelvis toward the ribs and lower slowly without swinging the legs.',
  },
};

const inclinePress: Movement = {
  id: 'low-incline-db-bench-press',
  name: 'Low-incline DB bench press',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '3 min',
  targetRir: '2',
  loadKind: 'dumbbell',
  equipment: 'DB pair and securely locked adjustable bench',
  primary: ['Chest'],
  supporting: ['Triceps', 'Front delts'],
  cues: [
    'Start around 30 degrees using a securely locked bench; this is a practical starting angle, not a universal optimum.',
    'Bring manageable DBs into position from the thighs. Lower through a comfortable, repeatable chest range with wrists over elbows.',
    'Press without bouncing or changing the bench angle to finish reps. Return the DBs under control.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Low-incline Smith press',
    movement: {
      id: 'low-incline-smith-press',
      min: 8,
      max: 12,
      unit: 'reps',
      perSide: false,
      loadKind: 'smith',
    },
    note: 'Same sets, RIR and rest. Lock the bench at a low incline, check the bar path with a light load and set safeties. Learn the hooks and test the stops. Do not convert Smith resistance to free-bar kilograms.',
  },
};

const inclineCurl: Movement = {
  id: 'incline-db-curl',
  name: 'Incline DB curl',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'DB pair and securely locked adjustable bench',
  primary: ['Biceps'],
  supporting: ['Brachialis'],
  cues: [
    'Use a comfortable reclined bench position, back supported, with the arms hanging naturally.',
    'Keep upper-arm position consistent while curling and lowering to comfortable elbow extension.',
    'Do not force extreme shoulder extension, lift the upper arms forward or use hip drive.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Standing DB curl',
    movement: {
      id: 'standing-db-curl',
      min: 10,
      max: 15,
      unit: 'reps',
      perSide: false,
      loadKind: 'dumbbell',
    },
    note: 'Same sets, RIR and rest. Keep upper-arm position consistent and use controlled elbow flexion without hip drive.',
  },
};

const supportedSplitSquat: Movement = {
  id: 'supported-db-stationary-split-squat',
  name: 'Supported DB stationary split squat',
  unit: 'reps',
  perSide: true,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '2',
  loadKind: 'dumbbell',
  equipment: 'One DB, fixed rack upright for balance, floor',
  primary: ['Quads', 'Glutes'],
  supporting: ['Trunk and spinal bracing'],
  cues: [
    'Keep both feet on the floor in a stable staggered stance, rear foot down. Use the upright lightly for balance and hold one DB.',
    'Lower through a controlled range and drive mainly through the front leg; do not pull yourself up with the support hand.',
    'Record the weight of the single DB. Do not compare it directly with older unsupported two-DB split squats.',
    'Complete both sides for one set. Start with the weaker side and match clean reps. Allow time to switch sides, then take the listed rest; extend it if needed.',
    'Choose a load that fits the displayed rep range and RIR. Add clean reps before resistance; keep the setup and range consistent.',
  ],
  alternative: {
    name: 'Smith squat',
    movement: {
      id: 'smith-squat',
      min: 8,
      max: 12,
      unit: 'reps',
      perSide: false,
      loadKind: 'smith',
    },
    note: 'Same sets, RIR and rest. This bilateral alternative replaces the split squat; do not double its sets. Learn the hooks and test the stops. Do not convert Smith resistance to free-bar kilograms.',
  },
};

const reverseCrunch: Movement = {
  id: 'floor-reverse-crunch',
  name: 'Floor reverse crunch',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '2',
  loadKind: 'bodyweight',
  equipment: 'Body weight and clear non-slip floor space',
  primary: ['Abdominals'],
  supporting: [],
  cues: [
    'Lie on your back with knees bent and arms beside you. Begin with a consistent knee bend.',
    'Curl the pelvis toward the ribs, then lower slowly; do not swing the legs to create a larger movement.',
    'Stop before losing pelvic control. Progress clean repetitions before making the lever more challenging.',
  ],
  alternative: {
    name: 'Hanging knee raise with pelvic curl',
    movement: {
      id: 'hanging-knee-raise',
      min: 8,
      max: 15,
      unit: 'reps',
      perSide: false,
      loadKind: 'bodyweight',
    },
    note: 'Same sets, RIR and rest. Use fixed handles only when grip allows controlled repetitions; curl the pelvis toward the ribs without swinging.',
  },
};

function prescribe(movement: Movement, sets: number, min: number, max: number): Exercise {
  return {
    ...movement,
    sets,
    min,
    max,
    primary: [...movement.primary],
    supporting: [...movement.supporting],
    cues: [...movement.cues],
    alternative: {
      ...movement.alternative,
      movement: { ...movement.alternative.movement },
      prescription: formatPrescription(sets, movement.alternative.movement),
    },
  };
}

export const workouts: Record<WorkoutId, Workout> = {
  upperA: {
    id: 'upperA',
    name: 'Upper A',
    primary: ['Chest', 'Lats', 'Mid-back', 'Side delts', 'Rear delts', 'Biceps', 'Triceps'],
    supporting: ['Front delts', 'Upper back', 'Brachialis'],
    warmup:
      'Bench-strength day. Warm up 5 minutes on the bike or rower, then perform 3–4 progressively heavier bench warm-up sets and an easy pulldown set. Keep warm-ups well away from failure.',
    exercises: [
      prescribe(barbellBench, 3, 5, 8),
      prescribe(latPulldown, 3, 8, 12),
      prescribe(seatedRow, 2, 8, 12),
      prescribe(pecFly, 2, 10, 15),
      prescribe(lateralRaise, 3, 12, 20),
      prescribe(reverseFly, 2, 12, 20),
      prescribe(armCurl, 2, 10, 15),
      prescribe(cableOverheadExtension, 2, 10, 15),
    ],
  },
  lowerA: {
    id: 'lowerA',
    name: 'Lower A',
    primary: ['Quads', 'Glutes', 'Hamstrings', 'Calves', 'Abdominals'],
    supporting: ['Trunk and spinal bracing'],
    warmup:
      'Squat-strength day. Warm up 5 minutes on the bike, then perform 3–4 squat ramp-up sets with the safety arms tested and 1–2 lighter RDL sets. Warm-ups are additional to working sets.',
    exercises: [
      prescribe(backSquat, 3, 5, 8),
      prescribe(barbellRdl, 2, 6, 10),
      prescribe(seatedLegCurl, 3, 10, 15),
      prescribe(legExtension, 2, 10, 15),
      prescribe(standingCalf, 3, 8, 15),
      prescribe(kneeRaise, 2, 8, 15),
    ],
  },
  upperB: {
    id: 'upperB',
    name: 'Upper B',
    primary: ['Chest', 'Lats', 'Mid-back', 'Side delts', 'Rear delts', 'Biceps', 'Triceps'],
    supporting: ['Front delts', 'Upper back', 'Brachialis'],
    warmup:
      'Incline-press day. Warm up 5 minutes, then perform 2–3 gradually heavier incline-press warm-up sets and one easy pulldown set. Lock the bench before picking up the DBs.',
    exercises: [
      prescribe(inclinePress, 3, 8, 12),
      prescribe(latPulldown, 3, 8, 12),
      prescribe(seatedRow, 2, 8, 12),
      prescribe(pecFly, 2, 10, 15),
      prescribe(lateralRaise, 3, 12, 20),
      prescribe(reverseFly, 2, 12, 20),
      prescribe(inclineCurl, 2, 10, 15),
      prescribe(cableOverheadExtension, 2, 10, 15),
    ],
  },
  lowerB: {
    id: 'lowerB',
    name: 'Lower B',
    primary: ['Quads', 'Glutes', 'Hamstrings', 'Calves', 'Abdominals'],
    supporting: ['Trunk and spinal bracing'],
    warmup:
      'Hinge and unilateral-leg day. Warm up 5 minutes, rehearse the hinge, then perform 2–3 RDL ramp-up sets and an easy supported split-squat set per side. Keep the rear foot on the floor.',
    exercises: [
      prescribe(barbellRdl, 2, 6, 10),
      prescribe(supportedSplitSquat, 3, 8, 12),
      prescribe(seatedLegCurl, 3, 10, 15),
      prescribe(legExtension, 2, 10, 15),
      prescribe(standingCalf, 3, 8, 15),
      prescribe(reverseCrunch, 2, 10, 20),
    ],
  },
};

export function getExercises(workoutId: WorkoutId, phase: Phase): Exercise[] {
  return workouts[workoutId].exercises.map((exercise) => ({
    ...exercise,
    sets: phase === 'intro' ? 2 : exercise.sets,
    targetRir: phase === 'baseline' ? exercise.targetRir : '3',
    primary: [...exercise.primary],
    supporting: [...exercise.supporting],
    cues: [...exercise.cues],
    alternative: {
      ...exercise.alternative,
      movement: exercise.alternative.movement ? { ...exercise.alternative.movement } : undefined,
      prescription:
        phase === 'intro'
          ? exercise.alternative.prescription.replace(/^\d+ × /, '2 × ')
          : exercise.alternative.prescription,
    },
  }));
}

export function workoutForDate(date: string): WorkoutId | null {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return (
    ({ 1: 'upperA', 2: 'lowerA', 4: 'upperB', 5: 'lowerB' } as Partial<Record<number, WorkoutId>>)[
      weekday
    ] ?? null
  );
}
