import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { getExercises } from '@/domain/programme';
import type { Exercise } from '@/domain/programme-types';
import type { SetLog } from '@/domain/state';
import SetForm from './SetForm.vue';

const wrappers: VueWrapper[] = [];
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
});

function form(exercise: Exercise, options: { initial?: SetLog; defaults?: SetLog } = {}) {
  const wrapper = mount(SetForm, {
    attachTo: document.body,
    props: { exercise, index: 1, initial: null, defaults: null, busy: false, ...options },
  });
  wrappers.push(wrapper);
  return wrapper;
}

const bench = getExercises('upperA', 'intro')[0]!;
const oneSided = getExercises('upperA', 'baseline').find((exercise) => exercise.perSide)!;
const previousSet = (reps: number): SetLog => ({
  index: 1,
  load: 20,
  reps,
  effort: 3,
  loggedAt: '2026-11-16T10:00:00Z',
});

describe('prescription hints and starting values', () => {
  it.each([
    { name: 'bench reps', exercise: bench, keys: ['reps'], hint: '5–8', reserve: '3' },
    {
      name: 'both sides',
      exercise: oneSided,
      keys: ['left', 'right'],
      hint: '10–15',
      reserve: '1–2',
    },
    {
      name: 'saved cycle prescription',
      exercise: { ...bench, unit: 'cycles' as const, min: 4, max: 8 },
      keys: ['reps'],
      hint: '4–8',
      reserve: '3',
    },
    {
      name: 'saved timed prescription',
      exercise: { ...bench, unit: 'seconds' as const, min: 20, max: 40, targetRir: '5–10' },
      keys: ['reps'],
      hint: '20–40',
      reserve: '5–10',
    },
  ])(
    'shows the active $name as hints without entering results',
    ({ exercise, keys, hint, reserve }) => {
      const wrapper = form(exercise);
      for (const key of keys) {
        const input = wrapper.get<HTMLInputElement>(`input[name="${key}"]`);
        expect(input.attributes('placeholder')).toBe(hint);
        expect(input.element.value).toBe('');
      }
      expect(wrapper.get('[name="effort"]').attributes('placeholder')).toBe(reserve);
      expect(wrapper.get<HTMLInputElement>('[name="load"]').element.value).toBe('');
    },
  );

  it.each([4, 10])(
    'does not prefill %i reps outside 5–8, but still records that actual result',
    async (reps) => {
      const previous = previousSet(reps);
      const wrapper = form(bench, { defaults: previous });
      const input = wrapper.get<HTMLInputElement>('[name="reps"]');
      expect(input.element.value).toBe('');
      expect(input.attributes('placeholder')).toBe('5–8');
      expect(wrapper.get<HTMLInputElement>('[name="load"]').element.value).toBe('20');
      expect(previous.reps).toBe(reps);

      await input.setValue(String(reps));
      await wrapper.get('form').trigger('submit');
      expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ load: 20, reps });
    },
  );

  it('repeats in-range values and keeps an edited out-of-range result intact', async () => {
    const repeat = form(bench, { defaults: previousSet(7) });
    expect(repeat.get<HTMLInputElement>('[name="reps"]').element.value).toBe('7');

    const correction = form(bench, { initial: previousSet(10), defaults: previousSet(7) });
    expect(correction.get<HTMLInputElement>('[name="reps"]').element.value).toBe('10');
    await correction.get('form').trigger('submit');
    expect(correction.emitted('submit')?.[0]?.[0]).toMatchObject({ load: 20, reps: 10 });
  });

  it('checks each side independently when repeating a unilateral set', () => {
    const wrapper = form(oneSided, {
      defaults: { ...previousSet(12), sides: { left: 12, right: 18 } },
    });
    expect(wrapper.get<HTMLInputElement>('[name="left"]').element.value).toBe('12');
    expect(wrapper.get<HTMLInputElement>('[name="right"]').element.value).toBe('');
    expect(wrapper.get('[name="right"]').attributes('placeholder')).toBe('10–15');
  });
});

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
