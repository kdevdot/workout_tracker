import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ExerciseGuide from './ExerciseGuide.vue';
import { alternativeOf, startSession } from '@/domain/sessions';
import { workouts } from '@/domain/programme';

describe('alternative exercise guidance', () => {
  it('provides a non-YouTube player for every prescribed movement and swap', async () => {
    const current = Object.values(workouts).flatMap((workout) => workout.exercises);
    const exercises = new Map(
      current
        .flatMap((exercise) => [exercise, alternativeOf(exercise)])
        .map((exercise) => [exercise.id, exercise]),
    );
    for (const exercise of exercises.values()) {
      const wrapper = mount(ExerciseGuide, { props: { exercise } });
      expect(wrapper.find('[data-quick-demo]').exists(), exercise.id).toBe(true);
      expect(wrapper.text()).not.toContain('not available');
      expect(wrapper.text()).not.toContain('YouTube');
      expect(wrapper.find('video, iframe').exists()).toBe(false);
      await wrapper.get('[data-quick-demo]').trigger('click');
      expect(wrapper.find('video, iframe, [data-motion]').exists(), exercise.id).toBe(true);
      if (wrapper.find('[data-motion]').exists())
        expect(wrapper.text()).toContain('Pause animation');
      expect(wrapper.html()).not.toMatch(/youtube|ytimg/i);
      wrapper.unmount();
    }
  });

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
