import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ExerciseGuide from './ExerciseGuide.vue';
import { alternativeOf, startSession } from '@/domain/sessions';

describe('alternative exercise guidance', () => {
  it('shows stored setup cues when a swapped movement has no dedicated guide', () => {
    const original = startSession('upperA', '2026-11-02', 'intro').exercises[0]!.exercise;
    const exercise = alternativeOf(original);
    const wrapper = mount(ExerciseGuide, { props: { exercise } });
    expect(wrapper.text()).toContain(exercise.cues[0]);
    wrapper.unmount();
  });
});
