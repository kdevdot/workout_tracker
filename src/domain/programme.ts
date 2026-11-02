import type { Exercise, Phase, Workout, WorkoutId } from './programme-types';

type Movement = Omit<Exercise, 'sets' | 'min' | 'max'>;

const smithSafety =
  'Learn the hooks and test the stops with a light load. Use the DB substitute if safe travel is unavailable. Never assume the unloaded Smith bar weighs 20 kg or convert it to free-bar load.';
const unilateralCue =
  'Complete both sides for one set. Start with the weaker side and match clean reps; allow 20–30 seconds to switch sides, then take the listed rest.';

const smithBench: Movement = {
  id: 'smith-flat-bench-press',
  name: 'Smith flat bench press',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '3 min',
  targetRir: '2',
  loadKind: 'smith',
  equipment: 'Smith, plates, locked flat bench, safeties',
  primary: ['Chest'],
  supporting: ['Triceps', 'Front delts'],
  cues: [
    'Centre and lock the bench; lower toward mid/lower chest with forearms near vertical, not toward the neck.',
    'Plant feet, support shoulder blades and lower under control without bouncing.',
    'Set stops to permit your normal range while preventing torso entrapment if control or your arch is lost.',
    smithSafety,
    'Stop for shoulder pain, loss of bar control or needing a spotter to finish.',
  ],
  alternative: {
    name: 'Flat DB press',
    prescription: '6–10 reps',
    note: 'Use the same sets, RIR and rest. Lock the bench and bring manageable DBs into position from thighs; no uncontrolled dropping or Smith-bar-resistance conversion.',
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
    name: 'Half-kneeling one-arm high-cable pulldown',
    prescription: '8–12 reps/side',
    note: 'Use if five clean pull-ups are unavailable; same sets, RIR and rest. High pulley and D-handle; brace and pull elbow toward ribs without twisting. Use a load that cannot drag you; stand staggered if kneeling is uncomfortable.',
  },
};

const dbRow: Movement = {
  id: 'bench-supported-one-arm-db-row',
  name: 'Bench-supported one-arm DB row',
  unit: 'reps',
  perSide: true,
  restSeconds: 120,
  restLabel: '2 min',
  targetRir: '2',
  loadKind: 'dumbbell',
  equipment: 'DB, bench',
  primary: ['Lats', 'Mid-back'],
  supporting: [],
  cues: [
    'Support one hand and, if comfortable, one knee on the bench; otherwise keep both feet down.',
    'Keep hips square; row toward hip/lower ribs and lower into a controlled shoulder reach.',
    'Stop when torso rotation, jerking or lower-back fatigue takes over.',
    unilateralCue,
  ],
  alternative: {
    name: 'Split-stance one-arm cable row',
    prescription: '8–12 reps/side',
    note: 'Same sets, RIR and rest. D-handle at lower-chest/waist height; brace, pull elbow back and allow natural shoulder-blade reach without low-back rounding or rocking backward.',
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
  ],
  alternative: {
    name: 'One-arm low-cable curl',
    prescription: '10–15 reps/side',
    note: 'Same sets, RIR and rest. Face a low pulley with D-handle, elbow beside torso; curl without leaning backward. Stop when torso movement is needed.',
  },
};

const pushdown: Movement = {
  id: 'one-arm-cable-pushdown',
  name: 'One-arm cable pushdown',
  unit: 'reps',
  perSide: true,
  restSeconds: 90,
  restLabel: '75–90 s',
  targetRir: '1–2',
  loadKind: 'cable',
  equipment: 'High cable, D-handle',
  primary: ['Triceps'],
  supporting: [],
  cues: [
    'Use a comfortable D-handle grip; keep upper arm beside torso and extend elbow without forcing the shoulder down or rocking.',
    'Return under control; stop when upper-arm/body movement takes over.',
    unilateralCue,
  ],
  alternative: {
    name: 'One-DB two-hand overhead extension',
    prescription: '10–15 reps',
    note: 'Same sets, RIR and rest. Secure one manageable DB in both hands, brace and extend from a comfortable elbow bend; do not force elbows tightly together. Avoid unsafe grip, joint pain or marked back arch.',
  },
};

const smithSquat: Movement = {
  id: 'smith-squat',
  name: 'Smith squat',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '3 min',
  targetRir: '2',
  loadKind: 'smith',
  equipment: 'Smith, plates, safeties',
  primary: ['Quads', 'Glutes'],
  supporting: [],
  cues: [
    'Place bar on upper-back musculature, not neck; adjust feet to the fixed path.',
    'Keep whole feet planted, brace and let knees track comfortably over toes. Descend to repeatable depth with trunk control.',
    'Set stops just below your controlled bottom position.',
    smithSafety,
    'Stop for pain, substantial heel lifting or losing bottom-position control.',
  ],
  alternative: {
    name: 'DB stationary split squat',
    prescription: '8–12 reps/leg',
    note: 'Same sets, RIR and rest. Keep both feet on the floor in a stable staggered stance; lower straight down and drive through the front foot. Avoid a tightrope stance or rear-leg pushing.',
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
    name: 'Smith RDL',
    prescription: '8–12 reps',
    note: 'Same sets, RIR and rest. Keep the same controlled hinge; learn hooks and test stops below your intended bottom position. Use only if safe travel/setup is available; do not convert DB and Smith loads.',
  },
};

const legExtension: Movement = {
  id: 'unica-leg-extension',
  name: 'UNICA leg extension, confirmed setup only',
  unit: 'reps',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '1–2',
  loadKind: 'machine',
  equipment: 'Staff-confirmed UNICA knee-extension lever and intended cable/lever connection',
  primary: ['Quads'],
  supporting: [],
  cues: [
    'Staff-confirmed setup required. If unconfirmed, substitute immediately rather than improvising attachments.',
    'Align knee with lever pivot; place roller on lower shin above ankle and use the intended connection.',
    'Extend without kicking or slamming the stack; return under control. Never move a pin/adjustment while the stack is suspended.',
    'Stop for unclear setup, joint pain or hips lifting.',
  ],
  alternative: {
    name: 'DB stationary split squat',
    prescription: '10–15 reps/leg',
    note: 'Same sets, RIR and rest. If already using split squats for exercise 1, replace this with DB goblet squat, 12–20 reps, same sets: hold DB at chest, feet planted and trunk controlled; stop if arms/setup fail or squat range shortens.',
  },
};

const heelWalkout: Movement = {
  id: 'supine-heel-walkout',
  name: 'Supine heel walkout',
  unit: 'cycles',
  perSide: false,
  restSeconds: 120,
  restLabel: '90–120 s',
  targetRir: '~2 clean cycles',
  loadKind: 'bodyweight',
  equipment: 'Body weight, clear non-slip floor',
  primary: ['Hamstrings'],
  supporting: ['Glutes'],
  cues: [
    'Start supine with bent knees and planted heels; lift hips on a clean, non-slip floor.',
    'Take 2–3 small alternating heel steps outward, then 2–3 back: the complete out-and-back is one cycle, not each footstep.',
    'Keep hips elevated and pelvis controlled; start with shorter steps. Stop if hips sag, hamstrings cramp or you cannot return without dropping.',
    'Use tolerable floor contact; a clean towel may provide comfort, not a sliding device. No mat is assumed.',
  ],
  alternative: {
    name: 'Long-lever heel-dig bridge',
    prescription: '10–20 reps',
    note: 'Same sets and rest; about 2 RIR at baseline. Less dynamic knee-flexion demand, not equivalent to a leg curl. Heels farther from hips, knees slightly bent: dig heels down, raise hips without back overextension, pause and lower. Shorten lever if hamstrings cramp.',
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
  ],
  alternative: {
    name: 'Supported bodyweight single-leg calf raise',
    prescription: '15–25 reps/leg',
    note: 'Same sets, RIR and rest. Use the fixed upright lightly for balance and the floor, with controlled straight-knee movement; no added platform.',
  },
};

const deadBug: Movement = {
  id: 'dead-bug',
  name: 'Dead bug',
  unit: 'reps',
  perSide: true,
  restSeconds: 75,
  restLabel: '60–75 s',
  targetRir: '~2 technically clean reps',
  loadKind: 'bodyweight',
  equipment: 'Body weight, floor',
  primary: ['Abdominal bracing/control'],
  supporting: [],
  cues: [
    'Lie supine with hips/knees bent and arms up. Exhale and control ribs/pelvis.',
    'Slowly extend opposite arm and leg only as far as you can prevent low-back arching; return and switch.',
    'Stop before the next repetition would lose trunk position. Use tolerable floor contact; a clean towel is optional for comfort.',
    unilateralCue,
  ],
  alternative: {
    name: 'Front plank',
    prescription: '20–45 s',
    note: 'Same sets and rest; keep 5–10 s of good form remaining, including during intro. Elbows below shoulders, glutes lightly engaged, ribs controlled; breathe without sagging or elevating hips. Stop before body position must change.',
  },
};

const inclinePress: Movement = {
  id: 'low-incline-db-bench-press',
  name: 'Low-incline DB bench press',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '2–3 min',
  targetRir: '2',
  loadKind: 'dumbbell',
  equipment: 'DB pair, securely locked adjustable bench',
  primary: ['Chest'],
  supporting: ['Front delts', 'Triceps'],
  cues: [
    'Use approximately 15–30° incline if supported and securely locked; otherwise use flat DB pressing.',
    'Bring manageable DBs into position from thighs. Keep wrists over elbows, use a comfortable elbow angle and repeatable chest range.',
    'Avoid a steep shoulder-press angle. Stop if setup or finishing is unsafe; no uncontrolled dropping in the small gym.',
  ],
  alternative: {
    name: 'Low-incline Smith press',
    prescription: '8–12 reps',
    note: 'Same sets, RIR and rest, with safeties. Test the fixed bar path lightly and use DBs if it forces shoulder discomfort. Use flat DB press if incline cannot lock; never assume a Smith-bar resistance conversion.',
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
  ],
  alternative: {
    name: 'One-arm high-cable pushdown',
    prescription: '10–15 reps/side',
    note: 'Same sets, RIR and rest. High pulley, D-handle and upper arm beside torso; extend without rocking or forcing shoulder down. Return under control; stop when upper-arm/body movement takes over.',
  },
};

const smithRdl: Movement = {
  id: 'smith-romanian-deadlift',
  name: 'Smith Romanian deadlift',
  unit: 'reps',
  perSide: false,
  restSeconds: 180,
  restLabel: '3 min',
  targetRir: '2',
  loadKind: 'smith',
  equipment: 'Smith, plates, stops',
  primary: ['Hamstrings', 'Glutes'],
  supporting: [],
  cues: [
    ...hingeCues,
    'Set stops below your intended hinge bottom while preserving a safe way to stop.',
    smithSafety,
  ],
  alternative: {
    name: 'DB RDL',
    prescription: '8–12 reps',
    note: 'Same sets, RIR and rest. If bilateral DB loading is exhausted, use kickstand DB RDL, 10–15 reps/side, same sets: rear toes support balance, front leg does most work, hips square and less load than bilateral. Stop if rotation/balance limits rather than front hamstring.',
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
  ],
  alternative: {
    name: 'Supported single-leg standing DB calf raise',
    prescription: '10–20 reps/leg',
    note: 'Same sets, RIR and rest; not identical knee-angle emphasis. One DB, fixed upright for balance, floor; mostly straight knee, controlled rise and lowering without bouncing or a loose-plate platform.',
  },
};

const sidePlank: Movement = {
  id: 'side-plank',
  name: 'Side plank',
  unit: 'seconds',
  perSide: true,
  restSeconds: 75,
  restLabel: '60–75 s',
  targetRir: '5–10 s form reserve',
  loadKind: 'bodyweight',
  equipment: 'Body weight, floor',
  primary: ['Lateral trunk', 'Obliques'],
  supporting: [],
  cues: [
    'Place elbow below shoulder; support on knees initially or feet when ready.',
    'Lift hips, maintain a straight side-body line and breathe. Stop with 5–10 seconds of good form remaining, before hips sag/rotate or shoulder discomfort.',
    'Use tolerable floor contact; a clean towel is optional for comfort, not a required mat.',
    unilateralCue,
  ],
  alternative: {
    name: 'One-arm cable anti-rotation press',
    prescription: '10–15 reps/side',
    note: 'Same sets and rest, 2 technical RIR at baseline. Chest-height D-handle, standing side-on with light load and stable stance; press from sternum without rotating, then return. Train both orientations; stop for torso turning or uncomfortable shoulder pull.',
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
      '5 minutes on the cycle or easy rower, then 2–4 progressively heavier press warm-up sets and 1–2 easy pull warm-ups. Stay well away from failure.',
    exercises: [
      prescribe(smithBench, 4, 5, 8),
      prescribe(pullUp, 3, 5, 8),
      prescribe(dbRow, 2, 8, 12),
      prescribe(shoulderPress, 2, 6, 10),
      prescribe(lateralRaise, 2, 12, 20),
      prescribe(dbCurl, 2, 8, 12),
      prescribe(pushdown, 2, 10, 15),
    ],
  },
  lowerA: {
    id: 'lowerA',
    name: 'Lower A',
    primary: ['Quads', 'Glutes', 'Hamstrings', 'Calves', 'Abdominals'],
    supporting: ['Trunk and spinal bracing'],
    warmup:
      '5 minutes on the cycle, then comfortable bodyweight squats and hinges. Perform 3–4 Smith squat ramp-up sets and 1–2 lighter RDL sets.',
    exercises: [
      prescribe(smithSquat, 3, 5, 8),
      prescribe(dbRdl, 3, 8, 12),
      prescribe(legExtension, 2, 10, 15),
      prescribe(heelWalkout, 2, 4, 8),
      prescribe(standingCalf, 3, 8, 15),
      prescribe(deadBug, 2, 6, 10),
    ],
  },
  upperB: {
    id: 'upperB',
    name: 'Upper B',
    primary: ['Chest', 'Lats', 'Mid-back', 'Rear delts', 'Side delts', 'Biceps', 'Triceps'],
    supporting: ['Front delts'],
    warmup:
      'Warm up 5 minutes, then 2–3 incline-press ramp-up sets and one easy row set. Use approximately 15–30° bench incline if supported; otherwise use flat DB pressing.',
    exercises: [
      prescribe(inclinePress, 4, 8, 12),
      prescribe(dbRow, 3, 8, 12),
      prescribe(pullUp, 2, 5, 8),
      prescribe(pecFly, 2, 10, 15),
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
      'Warm up 5 minutes, rehearse the hinge, then perform 3–4 Smith RDL ramp-up sets and an easy split-squat set per leg.',
    exercises: [
      prescribe(smithRdl, 3, 6, 8),
      prescribe(splitSquat, 3, 8, 12),
      prescribe(
        {
          ...legExtension,
          alternative: {
            name: 'Smith squat',
            prescription: '10–15 reps',
            note: 'Same sets, RIR and rest, with safeties. If already using Smith squat for exercise 2, use DB goblet squat, 12–20 reps, same sets instead: hold DB at chest, feet planted, trunk controlled; stop if arms/setup fail or range shortens.',
          },
        },
        2,
        10,
        15,
      ),
      prescribe(heelWalkout, 2, 4, 8),
      prescribe(seatedCalf, 3, 12, 20),
      prescribe(sidePlank, 2, 20, 45),
    ],
  },
};

export function getExercises(workoutId: WorkoutId, phase: Phase): Exercise[] {
  return workouts[workoutId].exercises.map((exercise) => ({
    ...exercise,
    sets: phase === 'intro' ? 2 : exercise.sets,
    targetRir:
      phase === 'baseline' || exercise.unit === 'seconds'
        ? exercise.targetRir
        : exercise.unit === 'cycles'
          ? '~3 clean cycles'
          : '3',
    primary: [...exercise.primary],
    supporting: [...exercise.supporting],
    cues: [...exercise.cues],
    alternative: {
      ...exercise.alternative,
      prescription:
        phase === 'intro'
          ? exercise.alternative.prescription.replace(/^\d+ × /, '2 × ')
          : exercise.alternative.prescription,
      note:
        phase === 'intro'
          ? exercise.alternative.note.replace(
              /(?:about )?2 (?:technical )?RIR at baseline/g,
              '3 technical RIR during intro',
            )
          : exercise.alternative.note,
    },
  }));
}

export function workoutForDate(date: string): WorkoutId | null {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return (
    ({ 1: 'upperA', 2: 'lowerA', 4: 'upperB', 6: 'lowerB' } as Partial<Record<number, WorkoutId>>)[
      weekday
    ] ?? null
  );
}
