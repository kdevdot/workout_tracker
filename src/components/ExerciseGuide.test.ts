import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ExerciseGuide from './ExerciseGuide.vue';
import { alternativeOf, startSession } from '@/domain/sessions';

describe('alternative exercise guidance', () => {
  it('shows a read-only selection rationale and primary research links for a new movement', () => {
    const session = startSession('upperB', '2026-11-19', 'intro');
    const exercise = session.exercises.find(
      (entry) => entry.exercise.id === 'incline-db-curl',
    )!.exercise;
    const wrapper = mount(ExerciseGuide, { props: { exercise } });
    const evidence = wrapper
      .findAll('details')
      .find((item) => item.text().includes('Why this exercise'))!;
    expect(evidence.text()).toContain('combination itself was not tested as superior');
    expect(evidence.get('a').attributes('href')).toBe(
      'https://doi.org/10.1080/02640414.2026.2741751',
    );
    expect(evidence.get('a').attributes('rel')).toContain('noopener');
    expect(wrapper.find('iframe').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shows stored setup cues when a swapped movement has no dedicated guide', () => {
    const original = startSession('upperA', '2026-11-02', 'intro').exercises[0]!.exercise;
    const exercise = alternativeOf(original);
    const wrapper = mount(ExerciseGuide, { props: { exercise } });
    expect(wrapper.text()).toContain(exercise.cues[0]);
    wrapper.unmount();
  });
});
