import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { guides, hasMuscleMapping, musclesFor } from './guides';
import { workouts } from './programme';

const exercises = Object.values(workouts).flatMap((workout) => workout.exercises);
const labels = Object.values(workouts).flatMap((workout) => [
  ...workout.primary,
  ...workout.supporting,
  ...workout.exercises.flatMap((exercise) => [...exercise.primary, ...exercise.supporting]),
]);

describe('exercise guides', () => {
  it('cover every programme exercise and nothing else', () => {
    expect(new Set(Object.keys(guides))).toEqual(new Set(exercises.map((exercise) => exercise.id)));
  });

  it('map every muscle label to at least one diagram region', () => {
    expect(labels.filter((label) => !hasMuscleMapping(label))).toEqual([]);
    expect(musclesFor(['Chest', 'Front delts', 'Side delts'])).toEqual([4, 2]);
  });

  it('reference video and poster files that ship with the app', () => {
    for (const guide of Object.values(guides)) {
      if (guide.video?.provider !== 'wger') continue;
      for (const extension of ['mp4', 'jpg'])
        expect(existsSync(`public/videos/wger-${guide.video.id}.${extension}`)).toBe(true);
    }
  });

  it('keeps the three selected external demos tied to their exact exercise IDs', () => {
    const selected = Object.entries(guides).filter(
      ([, guide]) => guide.video?.provider === 'youtube',
    );
    expect(selected.map(([id]) => id)).toEqual([
      'smith-flat-bench-press',
      'bench-supported-one-arm-db-row',
      'db-lateral-raise',
    ]);
    for (const [, guide] of selected) {
      expect(guide.video?.id).toMatch(/^[A-Za-z0-9_-]{11}$/);
      if (guide.video?.provider === 'youtube') {
        expect(guide.video.author).toBe('Renaissance Periodization');
        expect(guide.video.title).not.toBe('');
      }
    }
  });

  it('keep form checks short enough to read between sets', () => {
    for (const guide of Object.values(guides)) {
      expect(guide.checks.length).toBeLessThanOrEqual(3);
      for (const check of guide.checks) expect(check.length).toBeLessThanOrEqual(50);
    }
  });
});
