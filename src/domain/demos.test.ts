import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { demos } from './demos';
import { guides } from './guides';

describe('audited short demonstrations', () => {
  it('only maps known exercises and records source, rights and duration', () => {
    expect(Object.keys(demos)).toHaveLength(23);
    for (const [exerciseId, demo] of Object.entries(demos)) {
      expect(guides[exerciseId]).toBeDefined();
      expect(demo).toBeDefined();
      expect(demo!.durationSeconds).toBeGreaterThan(0);
      expect(demo!.durationSeconds).toBeLessThanOrEqual(25);
      expect(demo!.credit.length).toBeGreaterThan(0);
      expect(new URL(demo!.creditUrl).protocol).toBe('https:');
      expect(new URL(demo!.licenceUrl).protocol).toBe('https:');
      if (demo!.match === 'related') expect(demo!.difference.trim()).not.toBe('');
    }
  });

  it('keeps Your Move clips remote and only bundles attributable CC assets', () => {
    for (const demo of Object.values(demos)) {
      if (!demo) continue;
      if (demo.licence === 'Your Move free collection') {
        expect(new URL(demo.src).origin).toBe('https://ymove.app');
        expect(new URL(demo.src).pathname).toMatch(/^\/api\/free\/[a-f0-9-]+$/);
        expect(demo.credit).toBe('Exercise video by Your Move');
      } else {
        expect(demo.src).toMatch(/^demos\/[a-z-]+\.mp4$/);
        expect(existsSync(resolve('public', demo.src))).toBe(true);
        expect(existsSync(resolve('public', demo.poster!))).toBe(true);
        expect(demo.credit).toContain('Goulart');
        expect(demo.licenceUrl).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
      }
    }
  });

  it('labels missing pauses rather than pretending standard reps show them', () => {
    for (const exerciseId of ['paused-barbell-bench-press', 'paused-barbell-squat']) {
      const demo = demos[exerciseId]!;
      expect(demo.match).toBe('related');
      if (demo.match === 'related') expect(demo.difference).toContain('Pause not shown');
    }
  });

  it('labels clips that show different equipment from the programme', () => {
    for (const exerciseId of [
      'unica-lat-pulldown',
      'unica-seated-row',
      'unica-arm-curl',
      'machine-pec-fly',
      'machine-reverse-fly',
      'supported-single-leg-standing-db-calf-raise',
      'seated-db-calf-raise',
    ]) {
      expect(demos[exerciseId]?.match).toBe('related');
    }
  });

  it('leaves movements without an honest free clip unassigned', () => {
    for (const exerciseId of [
      'landmine-t-bar-row',
      'hanging-knee-raise',
      'cable-anti-rotation-press',
    ]) {
      expect(demos[exerciseId]).toBeUndefined();
    }
  });
});
