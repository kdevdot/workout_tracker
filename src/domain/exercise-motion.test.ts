import { describe, expect, it } from 'vitest';
import { joint, motionFrame, motionKinds } from './exercise-motion';

describe('movement diagrams', () => {
  it.each(motionKinds)('%s has a visible moving model and stays inside its viewport', (kind) => {
    expect(motionFrame(kind, 0)).not.toEqual(motionFrame(kind, 0.5));
    expect(motionFrame(kind, 0)).toEqual(motionFrame(kind, 1));
    for (const phase of [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]) {
      const frame = motionFrame(kind, phase);
      expect(frame.cue).not.toBe('');
      const points = [
        frame.head,
        ...frame.body.flatMap((line) => [line.a, line.b]),
        ...frame.weights.map((weight) => weight.at),
      ];
      for (const [x, y] of points) {
        expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
        expect(x).toBeGreaterThan(10);
        expect(x).toBeLessThan(310);
        expect(y).toBeGreaterThan(10);
        expect(y).toBeLessThan(190);
      }
    }
  });

  it('bends a limb without changing its segment lengths', () => {
    const start = [60, 50] as const;
    for (const end of [
      [60, 100],
      [90, 80],
      [95, 60],
    ] as const) {
      const elbow = joint(start, end, 30, 30);
      expect(Math.hypot(elbow[0] - start[0], elbow[1] - start[1])).toBeCloseTo(30);
      expect(Math.hypot(elbow[0] - end[0], elbow[1] - end[1])).toBeCloseTo(30);
    }
  });

  it('rotates the leg-extension shin around a fixed knee and thigh', () => {
    const start = motionFrame('leg-extension', 0),
      finish = motionFrame('leg-extension', 0.5);
    expect(start.body[2]).toEqual(finish.body[2]);
    const a = start.body[3]!,
      b = finish.body[3]!;
    expect(a.a).toEqual(b.a);
    expect(a.b).not.toEqual(b.b);
    expect(Math.hypot(a.b[0] - a.a[0], a.b[1] - a.a[1])).toBeCloseTo(
      Math.hypot(b.b[0] - b.a[0], b.b[1] - b.a[1]),
    );
  });
});
