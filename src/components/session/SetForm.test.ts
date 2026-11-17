import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { getExercises } from '@/domain/programme';
import type { Exercise } from '@/domain/programme-types';
import SetForm from './SetForm.vue';

const wrappers: VueWrapper[] = [];
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
});

function form(exercise: Exercise) {
  const wrapper = mount(SetForm, {
    attachTo: document.body,
    props: { exercise, index: 1, initial: null, defaults: null, busy: false },
  });
  wrappers.push(wrapper);
  return wrapper;
}

function expectError(wrapper: VueWrapper, name: string, message: string) {
  const input = wrapper.get(`input[name="${name}"]`);
  const alert = wrapper.get('[role="alert"]');
  expect(document.activeElement).toBe(input.element);
  expect(input.attributes('aria-invalid')).toBe('true');
  expect(input.attributes('aria-describedby')).toBe(alert.attributes('id'));
  expect(alert.text()).toBe(message);
  expect(wrapper.emitted('submit')).toBeUndefined();
}

describe('set-entry recovery', () => {
  it('focuses and describes each invalid field, then records the corrected values', async () => {
    const wrapper = form(getExercises('upperA', 'intro')[0]!);
    await wrapper.get('form').trigger('submit');
    expectError(wrapper, 'load', 'Enter the load in kg.');

    await wrapper.get('[name="load"]').setValue('20');
    await wrapper.get('form').trigger('submit');
    expectError(wrapper, 'reps', 'Enter whole reps.');
    expect(wrapper.get('[name="load"]').attributes('aria-invalid')).toBeUndefined();

    await wrapper.get('[name="reps"]').setValue('8');
    await wrapper.get('form').trigger('submit');
    expectError(wrapper, 'effort', 'Enter your reps in reserve (0–10).');

    await wrapper.get('[name="effort"]').setValue('3');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      index: 1,
      load: 20,
      reps: 8,
      effort: 3,
    });
  });

  it('identifies the missing side without losing the other side or load', async () => {
    const exercise = getExercises('upperA', 'intro').find((item) => item.perSide)!;
    const wrapper = form(exercise);
    await wrapper.get('[name="load"]').setValue('12.5');
    await wrapper.get('[name="left"]').setValue('10');
    await wrapper.get('[name="effort"]').setValue('2');
    await wrapper.get('form').trigger('submit');
    expectError(wrapper, 'right', 'Enter whole reps for both sides.');

    await wrapper.get('[name="right"]').setValue('12');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      load: 12.5,
      reps: 10,
      sides: { left: 10, right: 12 },
      effort: 2,
    });
  });
});
