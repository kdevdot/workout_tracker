import type { Exercise, Phase, Workout, WorkoutId } from './programme-types';

type Movement = Omit<Exercise, 'sets' | 'min' | 'max'>;

const rackSafety =
  'Set the half-rack safety arms just below your lowest point and test them with the empty bar. Training alone: safeties every set, and end the set before a grinding rep.';
const smithSafety =
  'Learn the hooks and test the stops with a light load. Never assume the unloaded Smith bar weighs 20 kg or convert it to free-bar load.';
const lastSetCue = 'After the intro phase, take the last set to 0–1 RIR.';
const unilateralCue =
  'Complete both sides for one set. Start with the weaker side and match clean reps; allow 20–30 seconds to switch sides, then take the listed rest.';

const barbellBench: Movement = {
  id: 'barbell-bench-press',
  name: 'Barbell bench press',
  unit: 'reps',
  perSide: false,
  restSeconds: 240,
  restLabel: '3–4 min',
  targetRir: '1–2',
  loadKind: 'barbell',
  equipment: 'Olympic half rack, Olympic bar, plates, flat bench, safety arms',
  primary: ['Chest'],
  supporting: ['Triceps', 'Front delts'],
  cues: [
    'Eyes under the bar, shoulder blades set, feet planted; unrack with straight arms.',
    'Lower to mid/lower chest with forearms near vertical; touch, then press without bouncing.',
    rackSafety,
    'Stop for shoulder pain or losing bar control.',
  ],
  alternative: {
    name: 'Smith flat bench press',
    prescription: '5–8 reps',
    note: `Same sets, RIR and rest. ${smithSafety}`,
  },
};

const pullUp: Movement = {
  id: 'fixed-handle-pull-up',
  name: 'Fixed-handle pull-up or chin-up',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '2',
  loadKind: 'bodyweight',
  equipment: "Smith station's fixed overhead handles",
  primary: ['Lats'],
  supporting: ['Biceps', 'Upper back'],
  cues: [
    'Use fixed overhead grips, never a moving cable arm. Choose a comfortable grip supported by the handles; do not force an underhand wrist position.',
    'Brace from a comfortable overhead position, pull elbows toward ribs and lower under control.',
    'Stop before kipping, craning the neck or losing controlled lowering. No weight belt or uncontrolled jumping negatives.',
  ],
  alternative: {
    name: 'UNICA lat pulldown',
    prescription: '8–12 reps',
    note: 'Use if five clean pull-ups are unavailable; same sets, RIR and rest. Lat bar on the high hook, thighs braced under the pads; pull to the upper chest without leaning back.',
  },
};

const shoulderPress: Movement = {
  id: 'seated-db-shoulder-press',
  name: 'Seated DB shoulder press',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '2 min',
  targetRir: '2',
  loadKind: 'dumbbell',
  equipment: 'DB pair, locked nearly upright bench',
  primary: ['Front delts'],
  supporting: ['Triceps', 'Side delts'],
  cues: [
    'Lock backrest nearly upright, plant feet and keep ribs controlled.',
    'Press from a comfortable shoulder-level start along a natural arc; a neutral/semi-neutral grip is acceptable.',
    'Stop for excessive back arch, pain or inability to return DBs safely.',
  ],
  alternative: {
    name: 'One-arm standing cable press on an upward path',
    prescription: '10–15 reps/side',
    note: 'Same sets, RIR and rest. Set D-handle below shoulder level, face away in a staggered stance and press upward/forward without twisting. Reduce load if unstable or the cable contacts you.',
  },
};

const lateralRaise: Movement = {
  id: 'db-lateral-raise',
  name: 'DB lateral raise',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '75–90 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'Light DB pair',
  primary: ['Side delts'],
  supporting: [],
  cues: [
    'Stand tall with soft elbows; raise slightly forward of your sides toward shoulder height, then lower slowly.',
    'Allow comfortable individual shoulder motion; stop before shrugging, swinging or heaving takes over.',
    lastSetCue,
  ],
  alternative: {
    name: 'One-arm low-cable lateral raise',
    prescription: '12–20 reps/side',
    note: 'Same sets, RIR and rest. Low pulley, D-handle in outside hand, standing side-on; use a comfortable arc without leaning for momentum. Stop if the cable path is awkward.',
  },
};

const dbCurl: Movement = {
  id: 'standing-db-curl',
  name: 'Standing DB curl',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'DB pair',
  primary: ['Biceps', 'Brachialis'],
  supporting: [],
  cues: [
    'Keep upper arms relatively still; curl without hip drive and lower to comfortable elbow extension.',
    'Both arms together or alternating is fine; log consistently.',
    'Stop when swinging, shoulder movement or wrist pain replaces clean elbow flexion.',
    lastSetCue,
  ],
  alternative: {
    name: 'One-arm low-cable curl',
    prescription: '10–15 reps/side',
    note: 'Same sets, RIR and rest. Face a low pulley with D-handle, elbow beside torso; curl without leaning backward. Stop when torso movement is needed.',
  },
};

const cableOverheadExtension: Movement = {
  id: 'one-arm-cable-overhead-triceps-extension',
  name: 'One-arm cable overhead triceps extension',
  unit: 'reps',
  perSide: true,
  restSeconds: 90,
  restLabel: '60–90 s',
  targetRir: '1–2',
  loadKind: 'cable',
  equipment: 'Cable column, D-handle, low or middle pulley',
  primary: ['Triceps'],
  supporting: [],
  cues: [
    'Face away from the pulley in a staggered stance, D-handle behind your head, elbow pointing up.',
    'Let the elbow bend fully for the stretch, then extend without the upper arm drifting.',
    'Superset with the arm curl: one set of each, then rest.',
    unilateralCue,
    lastSetCue,
  ],
  alternative: {
    name: 'One-DB two-hand overhead extension',
    prescription: '10–15 reps',
    note: 'Same sets, RIR and rest. Hold one DB securely in both hands overhead and extend from a deep, comfortable elbow bend.',
  },
};

const armCurl: Movement = {
  id: 'unica-arm-curl',
  name: 'UNICA arm curl',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '60–90 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'UNICA arm-curl bar and pad',
  primary: ['Biceps'],
  supporting: ['Brachialis'],
  cues: [
    'Set the handles, sit close with legs wrapped under the frame and elbows on the pad.',
    'Lower until the arms are fully straight, then curl without lifting the elbows.',
    'Superset with the triceps extension: one set of each, then rest.',
    lastSetCue,
  ],
  alternative: {
    name: 'Standing DB curl',
    prescription: '10–15 reps',
    note: 'Same sets, RIR and rest. Upper arms still, no hip drive.',
  },
};

const backSquat: Movement = {
  id: 'barbell-back-squat',
  name: 'Barbell back squat',
  unit: 'reps',
  perSide: false,
  restSeconds: 240,
  restLabel: '3–4 min',
  targetRir: '1–2',
  loadKind: 'barbell',
  equipment: 'Olympic half rack, Olympic bar, plates, safety arms',
  primary: ['Quads', 'Glutes'],
  supporting: ['Trunk and spinal bracing'],
  cues: [
    'Bar on the upper back, not the neck; walk out two or three steps and brace.',
    'Whole feet planted, knees track over toes; descend to a depth you control, then drive up.',
    rackSafety,
    'Stop for pain, heels lifting or losing the bottom position.',
  ],
  alternative: {
    name: 'Smith squat',
    prescription: '5–8 reps',
    note: `Same sets, RIR and rest. Adjust feet to the fixed path. ${smithSafety}`,
  },
};

const pausedSquat: Movement = {
  id: 'paused-barbell-squat',
  name: 'Paused barbell squat (2 s)',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '3 min',
  targetRir: '2',
  loadKind: 'barbell',
  equipment: 'Olympic half rack, Olympic bar, plates, safety arms',
  primary: ['Quads', 'Glutes'],
  supporting: ['Trunk and spinal bracing'],
  cues: [
    'Lighter than your heavy squat day. Descend under control and hold the bottom for 2 seconds, still braced.',
    'Drive up from a dead stop; no bounce.',
    rackSafety,
  ],
  alternative: {
    name: 'Paused Smith squat',
    prescription: '5–6 reps',
    note: `Same sets, RIR, rest and 2 s pause. ${smithSafety}`,
  },
};

const hingeCues = [
  'Start standing, load close to thighs and knees softly bent; push hips backward with a controlled spine.',
  'Stop when hamstrings limit hip movement before the back rounds. Stand by extending hips, not leaning backward; floor contact is not a goal.',
  'Stop if grip/back position fails or the movement becomes a squat; lighten the load.',
];

const dbRdl: Movement = {
  id: 'db-romanian-deadlift',
  name: 'DB Romanian deadlift',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '2',
  loadKind: 'dumbbell',
  equipment: 'DB pair',
  primary: ['Hamstrings', 'Glutes'],
  supporting: [],
  cues: hingeCues,
  alternative: {
    name: 'Barbell RDL',
    prescription: '6–10 reps',
    note: 'Same sets, RIR and rest. Same controlled hinge with the Olympic bar from the rack; keep the bar against the thighs. Do not convert DB and barbell loads.',
  },
};

const legExtension: Movement = {
  id: 'selection-leg-extension',
  name: 'Leg extension',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '60–90 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Technogym Selection 700 Dual Leg Curl/Extension, extension mode',
  primary: ['Quads'],
  supporting: [],
  cues: [
    'Line the knee up with the machine pivot; pad on the lower shin above the ankle.',
    'Extend without kicking or slamming the stack; lower slowly to the full bend.',
    'Stop for knee pain or hips lifting off the seat.',
    lastSetCue,
  ],
  alternative: {
    name: 'UNICA leg extension',
    prescription: '12–15 reps',
    note: 'Same sets, RIR and rest. Same setup on the UNICA leg lever; loads are not comparable between machines.',
  },
};

const seatedLegCurl: Movement = {
  id: 'seated-leg-curl',
  name: 'Seated leg curl',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '60–90 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Technogym Selection 700 Dual Leg Curl/Extension, curl mode',
  primary: ['Hamstrings'],
  supporting: [],
  cues: [
    'Knee lined up with the pivot, thigh pad snug, lean slightly forward to stretch the hamstrings.',
    'Curl as far as you can, then return slowly to straight legs.',
    'Stop for cramping or hips lifting.',
    lastSetCue,
  ],
  alternative: {
    name: 'Standing one-leg cable curl',
    prescription: '10–15 reps/side',
    note: 'Same sets, RIR and rest. Ankle strap on the low pulley, face the column holding the frame; curl the heel up without the hip moving.',
  },
};

const standingCalf: Movement = {
  id: 'supported-single-leg-standing-db-calf-raise',
  name: 'Supported single-leg standing DB calf raise',
  unit: 'reps',
  perSide: true,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'One DB, fixed Smith upright for balance, floor',
  primary: ['Calves (gastrocnemius emphasis)'],
  supporting: [],
  cues: [
    'Hold a fixed upright lightly and a DB in the other hand. Keep knee mostly straight; rise through forefoot, pause and lower heel to floor.',
    'Stop before bouncing or bending the knee to lift. Do not invent a platform from loose plates.',
    unilateralCue,
    lastSetCue,
  ],
  alternative: {
    name: 'Supported bodyweight single-leg calf raise',
    prescription: '15–25 reps/leg',
    note: 'Same sets, RIR and rest. Use the fixed upright lightly for balance and the floor, with controlled straight-knee movement; no added platform.',
  },
};

const kneeRaise: Movement = {
  id: 'hanging-knee-raise',
  name: 'Hanging knee raise',
  unit: 'reps',
  perSide: false,
  restSeconds: 75,
  restLabel: '60–75 s',
  targetRir: '2',
  loadKind: 'bodyweight',
  equipment: "Smith station's fixed overhead handles",
  primary: ['Abdominal bracing/control'],
  supporting: [],
  cues: [
    'Hang from the fixed handles with shoulders set, not loose.',
    'Curl the pelvis up as the knees rise toward the chest; lower slowly without swinging.',
    'Stop when swinging takes over or grip fails before the abs do.',
  ],
  alternative: {
    name: 'Standing high-cable crunch',
    prescription: '10–15 reps',
    note: 'Same sets, RIR and rest. High pulley, both hands on the D-handle beside your head; stand facing away and crunch ribs toward hips without pulling with the arms.',
  },
};

const pausedBench: Movement = {
  id: 'paused-barbell-bench-press',
  name: 'Paused barbell bench press (1–2 s)',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '3 min',
  targetRir: '2',
  loadKind: 'barbell',
  equipment: 'Olympic half rack, Olympic bar, plates, flat bench, safety arms',
  primary: ['Chest'],
  supporting: ['Triceps', 'Front delts'],
  cues: [
    'Lighter than your heavy bench day. Lower under control and hold the bar still on the chest for 1–2 seconds.',
    'Stay tight during the pause, then press; no sinking or bouncing.',
    rackSafety,
  ],
  alternative: {
    name: 'Low-incline DB bench press',
    prescription: '8–12 reps',
    note: 'Same sets, RIR and rest. 15–30° locked incline; bring DBs up from the thighs.',
  },
};

const tBarRow: Movement = {
  id: 'landmine-t-bar-row',
  name: 'T-bar row (landmine)',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '1–2',
  loadKind: 'barbell',
  equipment:
    'Olympic bar with one end anchored, plates on the free end, V-grip or hands on the bar',
  primary: ['Mid-back', 'Lats'],
  supporting: ['Rear delts', 'Biceps'],
  cues: [
    'Anchor the bar end so it cannot slide; straddle the bar and hold it close to the plates.',
    'Hinge to a flat back, chest up; row to the lower chest and lower under control.',
    'Stop when the torso starts jerking up to move the weight.',
  ],
  alternative: {
    name: 'UNICA seated row',
    prescription: '8–12 reps',
    note: 'Same sets, RIR and rest. Chest against the pad, row the long bars to the stomach.',
  },
};

const latPulldown: Movement = {
  id: 'unica-lat-pulldown',
  name: 'UNICA lat pulldown',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '2 min',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'UNICA, lat bar on the high hook',
  primary: ['Lats'],
  supporting: ['Biceps', 'Upper back'],
  cues: [
    'Seat set so the bar is at full reach; thighs locked under the pads.',
    'Pull to the upper chest, elbows down and back; let the arms straighten fully at the top.',
    'Stop when you lean back or yank to move the weight.',
  ],
  alternative: {
    name: 'Fixed-handle pull-up',
    prescription: '5–8 reps',
    note: 'Same sets and rest. Use if the UNICA is busy; controlled lowering, no kipping.',
  },
};

const seatedRow: Movement = {
  id: 'unica-seated-row',
  name: 'UNICA seated row',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '2 min',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'UNICA seated-row long bars',
  primary: ['Mid-back', 'Lats'],
  supporting: ['Rear delts', 'Biceps'],
  cues: [
    'Chest against the pad, arms straight and shoulders reaching forward.',
    'Row toward the stomach, squeeze, then release slowly.',
    'Stop when the torso rocks back to finish a rep.',
  ],
  alternative: {
    name: 'Bench-supported one-arm DB row',
    prescription: '8–12 reps/side',
    note: 'Same sets, RIR and rest. One hand and knee on the bench; row toward the hip.',
  },
};

const dips: Movement = {
  id: 'dips',
  name: 'Dips',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '1–2',
  loadKind: 'bodyweight',
  equipment: 'Dip handles on the Olympic half rack',
  primary: ['Chest', 'Triceps'],
  supporting: ['Front delts'],
  cues: [
    'Lean slightly forward for chest; stay upright for triceps.',
    'Lower until the shoulders are just below the elbows, as far as is comfortable, then press up.',
    'Stop for shoulder pain at the bottom.',
  ],
  alternative: {
    name: 'UNICA chest press',
    prescription: '8–12 reps',
    note: 'Same sets, RIR and rest. Handles in line with mid-chest; press without locking out hard.',
  },
};

const pecFly: Movement = {
  id: 'machine-pec-fly',
  name: 'Machine pec fly',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Pectoral/reverse-fly machine in pec mode',
  primary: ['Chest'],
  supporting: [],
  cues: [
    'Set seat for chest-level handles, support your back and keep elbows soft.',
    'Bring arms together and return only as far as shoulders tolerate; adjust start position rather than forcing a stretch.',
    'Stop for shoulder discomfort or torso rocking.',
    lastSetCue,
  ],
  alternative: {
    name: 'One-arm standing cable fly',
    prescription: '10–15 reps/side',
    note: 'Same sets, RIR and rest. Chest-height D-handle, staggered stance, slight elbow bend; sweep across chest and return without rotation. Stop if elbow angle or rotation control is lost.',
  },
};

const reverseFly: Movement = {
  id: 'machine-reverse-fly',
  name: 'Machine reverse fly',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Pectoral/reverse-fly machine in marked reverse mode',
  primary: ['Rear delts', 'Upper back'],
  supporting: [],
  cues: [
    'Select marked reverse-fly configuration and face the pad as instructed; set handles near shoulder height.',
    'Keep chest supported and move arms outward with soft elbows.',
    'Stop when shrugging, arching or jerking replaces rear-shoulder movement.',
    lastSetCue,
  ],
  alternative: {
    name: 'Bent-over DB reverse fly',
    prescription: '12–20 reps',
    note: 'Same sets, RIR and rest. Hinge with light DBs and a braced trunk; move elbows outward with slight bend and lower under control. Prioritise the machine if lower back is limiting.',
  },
};

const overheadExtension: Movement = {
  id: 'one-db-two-hand-overhead-triceps-extension',
  name: 'One-DB two-hand overhead triceps extension',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'One manageable DB; seated or standing',
  primary: ['Triceps'],
  supporting: [],
  cues: [
    'Hold one manageable DB securely in both hands overhead; brace and bend elbows to a comfortable depth, then extend.',
    'Keep elbows comfortable rather than forcing them tightly together.',
    'Substitute pushdowns for unsafe grip/setup, shoulder/elbow pain or marked back arch.',
    lastSetCue,
  ],
  alternative: {
    name: 'One-arm high-cable pushdown',
    prescription: '10–15 reps/side',
    note: 'Same sets, RIR and rest. High pulley, D-handle and upper arm beside torso; extend without rocking or forcing shoulder down. Return under control; stop when upper-arm/body movement takes over.',
  },
};

const deadlift: Movement = {
  id: 'barbell-deadlift',
  name: 'Barbell deadlift',
  unit: 'reps',
  perSide: false,
  restSeconds: 240,
  restLabel: '3–4 min',
  targetRir: '1–2',
  loadKind: 'barbell',
  equipment: 'Olympic bar, urethane plates, floor or rack pins',
  primary: ['Hamstrings', 'Glutes'],
  supporting: ['Upper back', 'Trunk and spinal bracing'],
  cues: [
    'Bar over mid-foot, shins near the bar; grip just outside the legs.',
    'Brace, pull the slack out, then push the floor away with the bar dragging up the legs.',
    'Reset each rep; stop if the lower back rounds or the bar drifts forward.',
  ],
  alternative: {
    name: 'Smith Romanian deadlift',
    prescription: '6–8 reps',
    note: `Same sets, RIR and rest. Controlled hinge, stops below the bottom position. ${smithSafety}`,
  },
};

const splitSquat: Movement = {
  id: 'db-stationary-split-squat',
  name: 'DB stationary split squat, rear foot on floor',
  unit: 'reps',
  perSide: true,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '2',
  loadKind: 'dumbbell',
  equipment: 'DB pair, floor',
  primary: ['Quads', 'Glutes'],
  supporting: [],
  cues: [
    'Keep both feet on the floor in a stable staggered stance; no rear-foot platform is needed.',
    'Lower straight down through comfortable front-knee/hip range and drive through front foot. Knee travel over toes is normal; avoid tightrope stance.',
    'Stop for balance loss or rear-leg pushing dominating.',
    unilateralCue,
  ],
  alternative: {
    name: 'Smith squat',
    prescription: '8–12 reps',
    note: 'Same sets, RIR and rest. Use plates and safeties, test hooks/stops and adjust feet to the fixed path; keep whole feet planted and trunk controlled. No rear-foot platform is needed.',
  },
};

const seatedCalf: Movement = {
  id: 'seated-db-calf-raise',
  name: 'Seated DB calf raise',
  unit: 'reps',
  perSide: false,
  restSeconds: 90,
  restLabel: '90 s',
  targetRir: '1–2',
  loadKind: 'dumbbell',
  equipment: 'Locked bench, DBs on thighs, floor',
  primary: ['Calves (bent-knee/soleus emphasis)'],
  supporting: [],
  cues: [
    'Sit on locked bench with knees about 90°. Place manageable DBs securely on distal thighs above knees, never on kneecaps.',
    'Raise heels through forefeet, pause and lower to floor; remove DBs safely after the set.',
    'Stop if load slides, setup hurts or bouncing replaces control.',
    lastSetCue,
  ],
  alternative: {
    name: 'Supported single-leg standing DB calf raise',
    prescription: '10–20 reps/leg',
    note: 'Same sets, RIR and rest; not identical knee-angle emphasis. One DB, fixed upright for balance, floor; mostly straight knee, controlled rise and lowering without bouncing or a loose-plate platform.',
  },
};

const antiRotationPress: Movement = {
  id: 'cable-anti-rotation-press',
  name: 'One-arm cable anti-rotation press',
  unit: 'reps',
  perSide: true,
  restSeconds: 75,
  restLabel: '60–75 s',
  targetRir: '2',
  loadKind: 'cable',
  equipment: 'Cable at chest height, D-handle',
  primary: ['Lateral trunk', 'Obliques'],
  supporting: [],
  cues: [
    'Stand side-on to the pulley, D-handle at the sternum, feet a little wider than hips.',
    'Press straight out and back without letting the cable turn your torso.',
    'Stop when the torso turns or the shoulder is pulled uncomfortably.',
    unilateralCue,
  ],
  alternative: {
    name: 'DB suitcase hold',
    prescription: '20–40 s/side',
    note: 'Same sets and rest. Stand tall holding one heavy DB at your side without leaning toward it.',
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
      prescription: `${sets} × ${movement.alternative.prescription}`,
    },
  };
}

export const workouts: Record<WorkoutId, Workout> = {
  upperA: {
    id: 'upperA',
    name: 'Upper A',
    primary: ['Chest', 'Lats', 'Mid-back', 'Delts', 'Biceps', 'Triceps'],
    supporting: ['Rear delts', 'Upper back'],
    warmup:
      'Heavy day. 5 minutes on the bike or rower, then empty-bar bench and 3–4 heavier ramp-up sets, plus 1–2 easy pull-up sets. Stay well away from failure.',
    exercises: [
      prescribe(barbellBench, 4, 4, 6),
      prescribe(pullUp, 3, 5, 8),
      prescribe(tBarRow, 3, 6, 10),
      prescribe(shoulderPress, 2, 6, 10),
      prescribe(lateralRaise, 3, 12, 20),
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
      'Heavy day. 5 minutes on the bike, then empty-bar squats and 3–4 heavier ramp-up sets with the safety arms set. 1–2 lighter RDL sets.',
    exercises: [
      prescribe(backSquat, 4, 4, 6),
      prescribe(dbRdl, 3, 6, 10),
      prescribe(seatedLegCurl, 3, 10, 15),
      prescribe(legExtension, 2, 12, 15),
      prescribe(standingCalf, 3, 10, 15),
      prescribe(kneeRaise, 2, 8, 15),
    ],
  },
  upperB: {
    id: 'upperB',
    name: 'Upper B',
    primary: ['Chest', 'Lats', 'Mid-back', 'Rear delts', 'Side delts', 'Biceps', 'Triceps'],
    supporting: ['Front delts'],
    warmup:
      'Moderate and paused day. Warm up 5 minutes, then 2–3 bench ramp-up sets with the pause and one easy pulldown set.',
    exercises: [
      prescribe(pausedBench, 3, 6, 8),
      prescribe(latPulldown, 3, 8, 12),
      prescribe(seatedRow, 3, 10, 12),
      prescribe(dips, 2, 6, 12),
      prescribe(pecFly, 2, 12, 15),
      prescribe(reverseFly, 2, 12, 20),
      prescribe(lateralRaise, 2, 12, 20),
      prescribe(dbCurl, 2, 10, 15),
      prescribe(overheadExtension, 2, 10, 15),
    ],
  },
  lowerB: {
    id: 'lowerB',
    name: 'Lower B',
    primary: ['Hamstrings', 'Glutes', 'Quads', 'Calves', 'Obliques'],
    supporting: ['Trunk and spinal bracing'],
    warmup:
      'Hinge and paused day. Warm up 5 minutes, then 3–4 deadlift ramp-up sets and 2 light paused squats.',
    exercises: [
      prescribe(deadlift, 3, 3, 5),
      prescribe(pausedSquat, 3, 5, 6),
      prescribe(seatedLegCurl, 3, 10, 15),
      prescribe(splitSquat, 2, 8, 12),
      prescribe(seatedCalf, 3, 12, 20),
      prescribe(antiRotationPress, 2, 10, 15),
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
