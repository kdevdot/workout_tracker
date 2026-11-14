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
  it('cover the new programme while retaining guides for historical sessions', () => {
    for (const exercise of exercises) {
      const guide = guides[exercise.id]!;
      expect(guide, exercise.id).toBeDefined();
      expect(guide.evidence?.selection.length).toBeGreaterThan(0);
      expect(guide.evidence?.qualification.length).toBeGreaterThan(0);
      expect(guide.evidence?.sources.length).toBeGreaterThan(0);
      for (const source of guide.evidence!.sources) {
        expect(new URL(source.url).protocol).toBe('https:');
        expect(source.year).toBeGreaterThan(2000);
        expect(source.authors).not.toBe('');
      }
    }
    for (const id of [
      'paused-barbell-bench-press',
      'paused-barbell-squat',
      'barbell-deadlift',
      'db-stationary-split-squat',
      'cable-anti-rotation-press',
      'seated-db-calf-raise',
    ]) {
      expect(guides[id], id).toBeDefined();
    }
  });

  it('map every muscle label to at least one diagram region', () => {
    expect(labels.filter((label) => !hasMuscleMapping(label))).toEqual([]);
    expect(musclesFor(['Chest', 'Front delts', 'Side delts'])).toEqual([4, 2]);
  });

  it('keep form checks short enough to read between sets', () => {
    for (const guide of Object.values(guides)) {
      expect(guide.checks.length).toBeLessThanOrEqual(3);
      for (const check of guide.checks) expect(check.length).toBeLessThanOrEqual(50);
    }
  });
});
