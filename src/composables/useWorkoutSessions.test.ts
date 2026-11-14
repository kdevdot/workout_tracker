import { shallowRef } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { emptyState } from '@/domain/state';
import { startSession } from '@/domain/sessions';
import { useWorkoutSessions } from './useWorkoutSessions';

describe('workout save failures', () => {
  it('does not swap a previously opened workout when starting another one fails', async () => {
    const previous = startSession('upperA', '2026-11-02', 'intro');
    const update = vi.fn(async () => false);
    const open = vi.fn();
    const actions = useWorkoutSessions({
      state: shallowRef({ ...emptyState(), sessions: [previous] }),
      date: shallowRef('2026-11-09'),
      workoutId: shallowRef('upperA'),
      draft: shallowRef(null),
      currentSession: shallowRef(previous),
      update,
      open,
      notify: vi.fn(),
      onFinished: vi.fn(),
    });
    await actions.swapFromPlan('barbell-bench-press');
    expect(update).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });
});
