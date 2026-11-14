/** Original movement diagrams. Coordinates describe the exercise, not a particular machine's calibration. */
export type MotionKind =
  | 'incline-curl'
  | 'reverse-crunch'
  | 'pec-fly'
  | 'reverse-fly'
  | 'supported-row'
  | 'pulldown'
  | 'leg-extension'
  | 'split-squat'
  | 'standing-calf'
  | 'bodyweight-calf'
  | 'smith-incline'
  | 'cable-fly'
  | 'heel-walkout'
  | 'landmine-row'
  | 'pallof'
  | 'seated-calf';

export type Point = readonly [number, number];
interface Line {
  a: Point;
  b: Point;
  tone?: 'active' | 'muted';
  width?: number;
}
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Disc {
  at: Point;
  r: number;
}
export interface MotionFrame {
  view: string;
  cue: string;
  body: Line[];
  equipment: Line[];
  pads: Box[];
  weights: Disc[];
  head: Point;
  nose?: Point;
}

export const motionKinds: MotionKind[] = [
  'incline-curl',
  'reverse-crunch',
  'pec-fly',
  'reverse-fly',
  'supported-row',
  'pulldown',
  'leg-extension',
  'split-squat',
  'standing-calf',
  'bodyweight-calf',
  'smith-incline',
  'cable-fly',
  'heel-walkout',
  'landmine-row',
  'pallof',
  'seated-calf',
];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const at = (p: Point, length: number, angle: number): Point => [
  p[0] + length * Math.cos((angle * Math.PI) / 180),
  p[1] + length * Math.sin((angle * Math.PI) / 180),
];
const shift = (p: Point, x: number, y: number): Point => [p[0] + x, p[1] + y];

/** Two rigid limb segments meet at an elbow/knee; the joint does not stretch during movement. */
export function joint(a: Point, b: Point, upper: number, lower: number, side = 1): Point {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const distance = Math.max(0.001, Math.hypot(dx, dy));
  const d = Math.min(distance, upper + lower - 0.001);
  const along = (upper * upper - lower * lower + d * d) / (2 * d);
  const height = Math.sqrt(Math.max(0, upper * upper - along * along));
  return [
    a[0] + (along * dx - side * height * dy) / distance,
    a[1] + (along * dy + side * height * dx) / distance,
  ];
}

export function motionFrame(kind: MotionKind, phase: number): MotionFrame {
  const p = ((phase % 1) + 1) % 1;
  const t = (1 - Math.cos(p * Math.PI * 2)) / 2;
  const frame: MotionFrame = {
    view: 'Side view',
    cue: '',
    body: [],
    equipment: [],
    pads: [],
    weights: [],
    head: [0, 0],
  };
  const line = (a: Point, b: Point, tone?: Line['tone'], width = 8) =>
    frame.body.push({ a, b, tone, width });
  const rail = (a: Point, b: Point, width = 3) => frame.equipment.push({ a, b, width });
  const pad = (x: number, y: number, w: number, h: number) => frame.pads.push({ x, y, w, h });
  const limb = (
    a: Point,
    b: Point,
    upper: number,
    lower: number,
    side = 1,
    tone?: Line['tone'],
  ) => {
    const mid = joint(a, b, upper, lower, side);
    line(a, mid, tone);
    line(mid, b, tone);
  };
  const torso = (hip: Point, shoulder: Point, head: Point) => {
    frame.head = head;
    line(hip, shoulder, undefined, 20);
    line(shoulder, head, undefined, 7);
  };
  const leg = (hip: Point, knee: Point, ankle: Point, toe: Point, tone?: Line['tone']) => {
    line(hip, knee, tone, 10);
    line(knee, ankle, tone, 8);
    line(ankle, toe, tone, 6);
  };
  const db = (hand: Point) => {
    rail(shift(hand, -10, 0), shift(hand, 10, 0), 3);
    frame.weights.push({ at: shift(hand, -9, 0), r: 5 }, { at: shift(hand, 9, 0), r: 5 });
  };
  const seated = (hip: Point, shoulder: Point, head: Point, drawLeg = true) => {
    torso(hip, shoulder, head);
    if (drawLeg) leg(hip, [190, 137], [194, 174], [207, 177]);
    rail([135, 140], [199, 140], 7);
    rail([145, 143], [145, 178]);
    rail([193, 143], [193, 178]);
  };
  rail([42, 180], [278, 180], 1);

  if (kind === 'incline-curl') {
    frame.cue = 'Upper arms stay still; bend and straighten the elbows.';
    seated([177, 137], [150, 87], [139, 66]);
    rail([181, 147], [134, 64], 8);
    const elbow: Point = [153, 120];
    const hand = at(elbow, 29, 90 - 145 * t);
    line([150, 87], elbow, 'active');
    line(elbow, hand, 'active');
    db(hand);
  } else if (kind === 'reverse-crunch') {
    frame.cue = 'Curl the pelvis up; keep the knee bend consistent.';
    const hip: Point = [162 - 8 * t, 157 - 15 * t];
    torso(hip, [104, 157], [84, 157]);
    line([104, 157], [121, 166]);
    line([121, 166], [144, 166]);
    const knee = at(hip, 38, -80 - 35 * t);
    const ankle = at(knee, 34, 10 - 35 * t);
    leg(hip, knee, ankle, at(ankle, 10, 80 - 35 * t), 'active');
    pad(66, 176, 174, 4);
  } else if (
    kind === 'pec-fly' ||
    kind === 'reverse-fly' ||
    kind === 'cable-fly' ||
    kind === 'pallof'
  ) {
    frame.view = 'Arm path · view from above';
    frame.head = [160, 93];
    frame.nose = [160, 107];
    line([139, 111], [181, 111], undefined, 23);
    line([160, 110], [160, 127], undefined, 20);
    const left: Point = [138, 111],
      right: Point = [182, 111];
    if (kind === 'pec-fly' || kind === 'reverse-fly') {
      const reverse = kind === 'reverse-fly';
      frame.cue = reverse
        ? 'Chest on the pad; sweep the upper arms outward.'
        : 'Bring the handles together with softly bent elbows.';
      pad(143, reverse ? 127 : 79, 34, 10);
      const angle = reverse ? lerp(70, 170, t) : lerp(170, 72, t);
      const elbow = at(left, 34, angle),
        hand = at(elbow, 29, angle + (reverse ? 5 : -5));
      const mirror = (point: Point): Point => [320 - point[0], point[1]];
      line(left, elbow, 'active');
      line(elbow, hand, 'active');
      line(right, mirror(elbow), 'active');
      line(mirror(elbow), mirror(hand), 'active');
      frame.weights.push({ at: hand, r: 4 }, { at: mirror(hand), r: 4 });
      rail([64, 86], [64, 170]);
      rail([256, 86], [256, 170]);
      rail([64, 86], [256, 86]);
    } else if (kind === 'cable-fly') {
      frame.cue = 'One arm sweeps inward; keep the torso facing forward.';
      const elbow = at(right, 34, 10 + 85 * t);
      const hand = at(elbow, 29, 15 + 85 * t);
      line(right, elbow, 'active');
      line(elbow, hand, 'active');
      line(left, [116, 130], 'muted');
      line([116, 130], [128, 147], 'muted');
      rail([286, 106], hand, 1.5);
      rail([286, 76], [286, 153], 5);
      frame.weights.push({ at: hand, r: 4 });
    } else {
      frame.cue = 'Press straight out; resist the cable without turning.';
      const l: Point = [158, 140 + 29 * t],
        r: Point = [162, 140 + 29 * t];
      limb(left, l, 34, 34, 1, 'active');
      limb(right, r, 34, 34, -1, 'active');
      rail([43, 140], [160, l[1]], 1.5);
      rail([43, 115], [43, 163], 5);
      frame.weights.push({ at: [160, l[1]], r: 4 });
    }
  } else if (kind === 'supported-row') {
    frame.cue = 'Keep the chest against the support as you row.';
    seated([148, 131], [157, 83], [158, 61]);
    pad(164, 96, 8, 31);
    rail([168, 126], [168, 178]);
    const hand: Point = [225 - 52 * t, 105 + 7 * t];
    limb([157, 83], hand, 38, 38, 1, 'active');
    rail([269, 108], hand, 1.5);
    rail([269, 64], [269, 178], 5);
    frame.weights.push({ at: hand, r: 4 });
  } else if (kind === 'pulldown') {
    frame.view = 'Front view';
    frame.cue = 'Pull the bar toward the upper chest; elbows travel down.';
    torso([160, 126], [160, 81], [160, 55]);
    line([145, 82], [175, 82], undefined, 12);
    leg([160, 126], [144, 135], [144, 174], [134, 178]);
    leg([160, 126], [176, 135], [176, 174], [186, 178]);
    const y = 30 + 65 * t;
    const l: Point = [105, y],
      r: Point = [215, y];
    limb([145, 82], l, 38, 38, -1, 'active');
    limb([175, 82], r, 38, 38, 1, 'active');
    rail([94, y], [226, y], 5);
    rail([160, 13], [160, y], 1.5);
    rail([79, 17], [79, 178], 4);
    rail([79, 17], [160, 17], 4);
    pad(136, 131, 48, 8);
  } else if (kind === 'leg-extension') {
    frame.cue = 'Keep the thigh still; straighten and lower the knee.';
    seated([150, 124], [139, 75], [133, 54], false);
    rail([148, 132], [137, 78], 8);
    const knee: Point = [192, 130],
      ankle = at(knee, 37, 90 - 85 * t);
    leg([150, 124], knee, ankle, at(ankle, 10, -85 * t), 'active');
    frame.weights.push({ at: at(knee, 30, 90 - 85 * t), r: 7 });
    rail(knee, ankle, 3);
  } else if (kind === 'split-squat') {
    frame.cue = 'Both feet stay on the floor; one hand supports, one DB hangs.';
    const hip: Point = [159, 120 + 18 * t],
      shoulder: Point = [169, 67 + 18 * t];
    torso(hip, shoulder, [170, 46 + 18 * t]);
    const front: Point = [196, 174],
      rear: Point = [114, 168];
    const fk = joint(hip, front, 38, 38, -1),
      rk = joint(hip, rear, 38, 38, -1);
    leg(hip, rk, rear, [126, 179], 'muted');
    leg(hip, fk, front, [211, 179], 'active');
    const hand: Point = [226, 88];
    limb(shoulder, hand, 34, 34, 1, 'muted');
    rail([226, 40], [226, 179], 5);
    const elbow = shift(shoulder, -4, 30),
      wrist = shift(elbow, 0, 30);
    line(shoulder, elbow);
    line(elbow, wrist);
    db(wrist);
  } else if (kind === 'standing-calf' || kind === 'bodyweight-calf') {
    frame.cue =
      kind === 'standing-calf'
        ? 'Hold the upright and one DB; rise onto the forefoot.'
        : 'Use light hand support; rise onto the forefoot.';
    const ankle: Point = [150 + 3 * t, 170 - 9 * t],
      knee = shift(ankle, 0, -27),
      hip = shift(knee, 0, -27),
      shoulder = shift(hip, 2, -51);
    torso(hip, shoulder, shift(shoulder, 0, -21));
    leg(
      hip,
      [134 + 3 * t, 141 - 9 * t],
      [124 + 3 * t, 157 - 9 * t],
      [135 + 3 * t, 157 - 9 * t],
      'muted',
    );
    leg(hip, knee, ankle, [167, 178], 'active');
    line([144 + 3 * t, 177 - 10 * t], [167, 178], 'active', 6);
    limb(shoulder, [211, 85], 34, 34, 1, 'muted');
    rail([211, 38], [211, 179], 5);
    const elbow = shift(shoulder, -2, 30),
      hand = shift(elbow, 0, 30);
    line(shoulder, elbow);
    line(elbow, hand);
    if (kind === 'standing-calf') db(hand);
  } else if (kind === 'smith-incline') {
    frame.cue = 'Bench locked; the Smith bar follows its rails.';
    seated([173, 132], [130, 102], [112, 91]);
    rail([184, 145], [117, 97], 8);
    const hand: Point = [145, 90 - 47 * t];
    limb([130, 102], hand, 31, 31, 1, 'active');
    rail([100, 22], [100, 178], 4);
    rail([188, 22], [188, 178], 4);
    rail([94, hand[1]], [194, hand[1]], 5);
    frame.weights.push({ at: [100, hand[1]], r: 8 }, { at: [188, hand[1]], r: 8 });
  } else if (kind === 'heel-walkout') {
    frame.cue = 'Keep the bridge; walk the heels out, then back.';
    const hip: Point = [151, 132];
    torso(hip, [100, 157], [81, 157]);
    line([100, 157], [119, 168]);
    line([119, 168], [144, 168]);
    const index = Math.min(7, Math.floor(p * 8)),
      f = p * 8 - index,
      smooth = (1 - Math.cos(f * Math.PI)) / 2;
    const sequences = [
      [191, 202, 202, 213, 213, 202, 202, 191, 191],
      [191, 191, 202, 202, 213, 213, 202, 202, 191],
    ];
    for (const [i, xs] of sequences.entries()) {
      const moving = xs[index] !== xs[index + 1];
      const x = lerp(xs[index]!, xs[index + 1]!, smooth);
      const ankle: Point = [x, 174 - (moving ? Math.sin(f * Math.PI) * 3 : 0)];
      leg(hip, joint(hip, ankle, 38, 38, -1), ankle, shift(ankle, 10, -8), i ? 'active' : 'muted');
      line(ankle, shift(ankle, -3, 4), i ? 'active' : 'muted', 5);
    }
  } else if (kind === 'landmine-row') {
    frame.cue = 'Hinge stays still; row the anchored bar toward the trunk.';
    torso([169, 103], [208, 75], [226, 61]);
    leg([169, 103], [155, 139], [149, 174], [160, 178], 'muted');
    leg([169, 103], [184, 140], [190, 174], [201, 178]);
    const anchor: Point = [40, 178],
      hand = at(anchor, 175, -15 - 10 * t);
    rail(anchor, hand, 5);
    frame.weights.push({ at: at(anchor, 158, -15 - 10 * t), r: 10 });
    limb([208, 75], hand, 30, 30, 1, 'active');
  } else if (kind === 'seated-calf') {
    frame.view = 'Front view';
    frame.cue = 'One DB on each thigh; lift and lower both heels.';
    torso([160, 116], [160, 81], [160, 56]);
    line([146, 81], [174, 81], undefined, 12);
    for (const side of [-1, 1]) {
      const x = 160 + side * 29;
      const knee: Point = [x, 134 - 8 * t],
        ankle: Point = [x + side * 2, 170 - 8 * t];
      leg([160, 116], knee, ankle, [x + side * 14, 178], 'active');
      line([x - side * 7, 177 - 9 * t], [x + side * 14, 178], 'active', 6);
      db([x, 127 - 8 * t]);
      line([160 + side * 14, 81], [x, 106]);
      line([x, 106], [x, 123 - 8 * t]);
    }
    pad(137, 119, 46, 7);
    rail([144, 126], [144, 178]);
    rail([176, 126], [176, 178]);
  } else {
    const impossible: never = kind;
    throw new Error(`Unknown movement diagram: ${impossible}`);
  }
  return frame;
}
