import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import ExerciseIcon from './ExerciseIcon.vue';
import { workouts } from '@/domain/programme';

describe('exercise thumbnails', () => {
  it('uses audited artwork or a library equipment icon for every programme movement', () => {
    const exercises = new Map(
      Object.values(workouts).flatMap((workout) =>
        workout.exercises.map((exercise) => [exercise.id, exercise] as const),
      ),
    );
    let illustrations = 0;
    for (const exercise of exercises.values()) {
      const wrapper = mount(ExerciseIcon, { props: { exerciseId: exercise.id } });
      expect(wrapper.attributes('aria-hidden')).toBe('true');
      if (wrapper.find('img').exists()) {
        illustrations++;
        const image = wrapper.get('img');
        expect(image.attributes('alt')).toBe('');
        expect(existsSync(`public${image.attributes('src')}`)).toBe(true);
      } else {
        expect(wrapper.find('svg').exists()).toBe(true);
      }
      wrapper.unmount();
    }
    expect(illustrations).toBe(11);
  });

  it('excludes rejected and mismatched poses and retains asset provenance', () => {
    for (const exerciseId of [
      'smith-flat-bench-press',
      'supine-heel-walkout',
      'seated-db-calf-raise',
    ]) {
      const wrapper = mount(ExerciseIcon, { props: { exerciseId } });
      expect(wrapper.find('img').exists()).toBe(false);
      wrapper.unmount();
    }
    const provenance = JSON.parse(readFileSync('public/exercises/provenance.json', 'utf8'));
    expect(provenance.exercises).toHaveLength(11);
    expect(existsSync('public/exercises/LICENSE-ASSETS')).toBe(true);
  });

  it('updates reactively and safely handles an unknown historical movement', async () => {
    const wrapper = mount(ExerciseIcon, { props: { exerciseId: 'smith-squat' } });
    expect(wrapper.get('img').attributes('src')).toBe('/exercises/smith-machine-squat.svg');
    await wrapper.setProps({ exerciseId: 'side-plank' });
    expect(wrapper.get('img').attributes('src')).toBe('/exercises/side-plank.svg');
    await wrapper.setProps({ exerciseId: 'unknown-movement' });
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('svg').exists()).toBe(true);
    wrapper.unmount();
  });
});
