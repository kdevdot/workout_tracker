import 'fake-indexeddb/auto';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { deleteDB, openDB } from 'idb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingApp from './TrainingApp.vue';
import { finishSession, recordSet, startSession } from '../domain/sessions';
import { emptyState, encodeBackup, type AppState } from '../domain/state';

const wrappers: VueWrapper[] = [];
const databaseName = 'steady-workout-v1';
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(async () => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  await flushPromises();
  await deleteDB(databaseName);
  vi.restoreAllMocks();
  vi.useRealTimers();
});
async function app() {
  const wrapper = mount(TrainingApp);
  wrappers.push(wrapper);
  await vi.waitFor(() => expect(wrapper.text()).toContain('On-device storage ready'));
  return wrapper;
}
function button(wrapper: VueWrapper, label: string) {
  const match = wrapper.findAll('button').find((entry) => entry.text() === label);
  if (!match) throw new Error(`Missing button: ${label}`);
  return match;
}
async function savedData(): Promise<AppState> {
  const database = await openDB(databaseName, 1);
  const data = await database.get('records', 'state');
  database.close();
  return data;
}
async function begin(wrapper: VueWrapper) {
  await wrapper.get('input[type="date"]').setValue('2026-11-02');
  await button(wrapper, 'Start workout').trigger('click');
  await vi.waitFor(() => expect(wrapper.find('form.set-form').exists()).toBe(true));
}

describe('working app integration', () => {
  it('keeps a shared page frame across tabs and workout logging', async () => {
    const wrapper = await app();
    const frame = wrapper.get('main').attributes('class');
    for (const label of ['History', 'Supplements', 'Settings', 'Plan']) {
      await button(wrapper, label).trigger('click');
      expect(wrapper.get('main').attributes('class')).toBe(frame);
      expect(wrapper.findAll('main')).toHaveLength(1);
    }
    await begin(wrapper);
    expect(wrapper.get('main').attributes('class')).toBe(frame);
    expect(wrapper.get('main').classes()).not.toContain('app-main--focused');
  });

  it('shows exercise-specific icons instead of numbered workout badges', async () => {
    const wrapper = await app();
    await wrapper.get('input[type="date"]').setValue('2026-11-02');
    const symbols = wrapper.findAll('summary [data-exercise-icon]');
    expect(symbols).toHaveLength(7);
    expect(symbols[0]!.attributes('data-exercise-icon')).toBe('bench-press');
    expect(symbols[1]!.attributes('data-exercise-icon')).toBe('pull-up');
    const summaries = wrapper
      .findAll('summary')
      .filter((summary) => summary.find('[data-exercise-icon]').exists());
    expect(summaries.every((summary) => !/^\d/.test(summary.text()))).toBe(true);
    expect(summaries[0]!.text()).toContain('Barbell bench press');
    expect(summaries[0]!.text()).toContain('2 × 4–6');
  });

  it('keeps an unfinished workout form in place while opening and closing an inline demo', async () => {
    const wrapper = await app();
    await begin(wrapper);
    const load = wrapper.get('.set-fields input');
    await load.setValue('20');
    const disclosure = wrapper
      .findAll('details')
      .find((details) => details.find('summary').text().includes('How to do it'))!;
    (disclosure.element as HTMLDetailsElement).open = true;
    await disclosure.trigger('toggle');
    await wrapper.get('[data-quick-demo]').trigger('click');
    expect(wrapper.get('video').attributes('src')).toContain('https://ymove.app/api/free/');
    expect(wrapper.find('iframe').exists()).toBe(false);
    await button(wrapper, 'Close demo').trigger('click');
    expect(wrapper.find('video').exists()).toBe(false);
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect((load.element as HTMLInputElement).value).toBe('20');
    expect((await savedData()).sessions[0]!.exercises[0]!.logs).toHaveLength(0);
    expect(wrapper.find('form.set-form').exists()).toBe(true);
  });

  it('saves numeric whey label inputs and retains them after remount', async () => {
    let wrapper = await app();
    await button(wrapper, 'Settings').trigger('click');
    await wrapper.get('#whey-kcal').setValue('120');
    await wrapper.get('#whey-protein').setValue('24');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Settings saved.'));
    expect((await savedData()).settings.whey).toMatchObject({ calories: 120, protein: 24 });

    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    await flushPromises();
    wrapper = mount(TrainingApp);
    wrappers.push(wrapper);
    await vi.waitFor(() => expect(wrapper.text()).toContain('Saved on this device'));
    await button(wrapper, 'Settings').trigger('click');
    expect((wrapper.get('#whey-kcal').element as HTMLInputElement).value).toBe('120');
    expect((wrapper.get('#whey-protein').element as HTMLInputElement).value).toBe('24');
  });

  it('moves to the new day when the app is reopened after midnight', async () => {
    vi.setSystemTime(new Date(2026, 10, 2, 23, 50));
    const wrapper = await app();
    const date = () => (wrapper.get('input[type="date"]').element as HTMLInputElement).value;
    expect(date()).toBe('2026-11-02');
    vi.setSystemTime(new Date(2026, 10, 3, 7, 0));
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(date()).toBe('2026-11-03'));
    expect(wrapper.get('[aria-label^="Monday 2 November"]').classes()).not.toContain(
      'border-input',
    );
  });

  it('restores a backup only after the replacement is confirmed', async () => {
    const wrapper = await app();
    await button(wrapper, 'Settings').trigger('click');
    const intake = {
      id: crypto.randomUUID(),
      date: '2026-11-01',
      kind: 'creatine' as const,
      product: 'Optimum Nutrition creatine',
      amount: 3.4,
      calories: null,
      protein: null,
      recordedAt: new Date().toISOString(),
    };
    const file = new File([encodeBackup({ ...emptyState(), intakes: [intake] })], 'backup.json', {
      type: 'application/json',
    });
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: [file] });
    await input.trigger('change');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Review backup'));
    const replace = button(wrapper, 'Replace with this backup');
    expect(replace.attributes('disabled')).toBeDefined();
    await replace.trigger('click');
    expect(await savedData()).toBeUndefined();

    await wrapper.get('[role="checkbox"]').trigger('click');
    expect(replace.attributes('disabled')).toBeUndefined();
    await replace.trigger('click');
    await vi.waitFor(async () => expect((await savedData()).intakes).toEqual([intake]));
    await vi.waitFor(() => expect(wrapper.text()).toContain('Backup restored on this device.'));
  });

  it('tracks daily push-ups: start, log, undo, start over', async () => {
    const wrapper = await app();
    await button(wrapper, 'Push-ups').trigger('click');
    await wrapper.get('#pushup-target').setValue('50');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() =>
      expect(wrapper.findAll('[aria-label="Push-up days"] button')).toHaveLength(84),
    );
    expect(wrapper.text()).toContain('Day 1');

    await button(wrapper, '+25').trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('25 to go'));
    await button(wrapper, '+25').trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Target hit'));
    expect((await savedData()).pushups.entries.map((entry) => entry.reps)).toEqual([25, 25]);

    await wrapper.get('[aria-label="Undo last entry"]').trigger('click');
    await vi.waitFor(async () => expect((await savedData()).pushups.entries).toHaveLength(1));
    expect(wrapper.text()).toContain('25 to go');

    await button(wrapper, 'Start over from today').trigger('click');
    await button(wrapper, 'Delete and restart').trigger('click');
    await vi.waitFor(async () => expect((await savedData()).pushups.entries).toHaveLength(0));
    expect((await savedData()).pushups.startDate).not.toBeNull();
    expect(wrapper.text()).toContain('50 to go');
  });

  it('uses the rest minutes chosen in Settings for the timer', async () => {
    const wrapper = await app();
    await button(wrapper, 'Settings').trigger('click');
    await wrapper.get('input#rest').setValue('20');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.text()).toContain('Rest must be between 0.5 and 10 minutes');
    await wrapper.get('input#rest').setValue('2');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(async () => expect((await savedData()).settings.restMinutes).toBe(2));
    await button(wrapper, 'Plan').trigger('click');
    await begin(wrapper);
    expect(wrapper.text()).toContain('2 min');
    const inputs = wrapper.findAll('.set-fields input');
    await inputs[0]!.setValue('20');
    await inputs[1]!.setValue('7');
    await inputs[2]!.setValue('3');
    const before = Date.now();
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Set saved on this device.'));
    const restMs = (await savedData()).timer!.endsAt - before;
    expect(restMs).toBeGreaterThanOrEqual(120_000);
    expect(restMs).toBeLessThan(125_000);
    // Starts at the full rest, not a second over.
    expect(wrapper.get('[role=timer]').text()).toContain('2:00');
  });

  it('starts the next set with the values of the last one', async () => {
    const wrapper = await app();
    await begin(wrapper);
    const inputs = wrapper.findAll('.set-fields input');
    await inputs[0]!.setValue('20');
    await inputs[1]!.setValue('7');
    await inputs[2]!.setValue('3');
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Record set 2'));
    const next = wrapper.findAll<HTMLInputElement>('.set-fields input');
    expect(next.map((input) => input.element.value)).toEqual(['20', '7', '3']);
  });

  it('skips the load for bodyweight moves and logs each side of one-sided moves', async () => {
    const wrapper = await app();
    await wrapper.get('input[type="date"]').setValue('2026-11-03');
    await button(wrapper, 'Start workout').trigger('click');
    await vi.waitFor(() => expect(wrapper.find('form.set-form').exists()).toBe(true));
    const chip = (name: string) =>
      wrapper.get(`nav[aria-label="Exercises"] button[aria-label*="${name}"]`);
    await chip('Hanging knee raise').trigger('click');
    expect(wrapper.find('[id^="load-"]').exists()).toBe(false);
    await chip('Supported single-leg standing DB calf raise').trigger('click');
    expect(wrapper.text()).toContain('both sides');
    await wrapper.get('#load-1').setValue('16');
    await wrapper.get('#left-1').setValue('10');
    await wrapper.get('#right-1').setValue('9');
    await wrapper.get('#effort-1').setValue('2');
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('L 10 / R 9'));
    const rdl = (await savedData()).sessions[0]!.exercises.find(
      (item) => item.exercise.id === 'supported-single-leg-standing-db-calf-raise',
    )!;
    expect(rdl.logs[0]).toMatchObject({ load: 16, reps: 9, sides: { left: 10, right: 9 } });
  });

  it('remembers a switched workout and drops the untouched draft it replaces', async () => {
    const first = await app();
    await first.get('input[type="date"]').setValue('2026-11-02');
    await first.get('select').setValue('lowerB');
    await button(first, 'Start workout').trigger('click');
    await vi.waitFor(() => expect(first.find('form.set-form').exists()).toBe(true));
    // Reopen the app: the switch must come back from storage, not memory.
    const wrapper = mount(TrainingApp);
    wrappers.push(wrapper);
    await vi.waitFor(() => expect(wrapper.text()).toContain('Saved on this device'));
    await wrapper.get('input[type="date"]').setValue('2026-11-02');
    expect(wrapper.get('.workout-title').text()).toBe('Lower B');
    await wrapper.get('select').setValue('upperA');
    await button(wrapper, 'Start workout').trigger('click');
    await vi.waitFor(() => expect(wrapper.find('form.set-form').exists()).toBe(true));
    expect((await savedData()).sessions.map((session) => session.workoutId)).toEqual(['upperA']);
  });

  it('hides the save confirmation by itself', async () => {
    const wrapper = await app();
    await button(wrapper, 'Settings').trigger('click');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Settings saved.'));
    await vi.waitFor(() => expect(wrapper.text()).not.toContain('Settings saved.'), {
      timeout: 4000,
    });
  });

  it('records a set, reopens it after remount, corrects it, and completes a partial session', async () => {
    let wrapper = await app();
    await begin(wrapper);
    const inputs = wrapper.findAll('.set-fields input');
    await inputs[0]!.setValue('20');
    await inputs[1]!.setValue('7');
    await inputs[2]!.setValue('3');
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Set saved on this device.'));
    const deadline = (await savedData()).timer!.endsAt;
    expect((await savedData()).sessions[0]!.exercises[0]!.logs).toHaveLength(1);

    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    await flushPromises();
    wrapper = mount(TrainingApp);
    wrappers.push(wrapper);
    await vi.waitFor(() => expect(wrapper.text()).toContain('Saved on this device'));
    await wrapper.get('input[type="date"]').setValue('2026-11-02');
    await button(wrapper, 'Resume workout').trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('20 kg × 7'));
    expect((await savedData()).timer!.endsAt).toBe(deadline);

    await button(wrapper, 'Edit').trigger('click');
    await wrapper.findAll('.set-fields input')[1]!.setValue('8');
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Corrected set saved'));
    expect((await savedData()).sessions[0]!.exercises[0]!.logs).toHaveLength(1);
    expect((await savedData()).timer!.endsAt).toBe(deadline);
    await button(wrapper, 'Finish workout').trigger('click');
    await button(wrapper, 'Confirm finish').trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Completed · partial'));
    expect((await savedData()).sessions[0]!.status).toBe('completed');
    expect((await savedData()).timer).toBeNull();

    await button(wrapper, 'Plan').trigger('click');
    await wrapper.get('input[type="date"]').setValue('2026-11-02');
    await vi.waitFor(() => expect(wrapper.text()).toContain('View in history'));
    expect(wrapper.text()).toContain('Completed · partial');
    expect(wrapper.find('[aria-label$=", completed"]').exists()).toBe(true);
  });

  it('logs supplements on a rest day without inventing missing nutrition', async () => {
    const wrapper = await app();
    await button(wrapper, 'Supplements').trigger('click');
    await wrapper.get('input[type="date"]').setValue('2026-11-01');
    const forms = wrapper.findAll('form');
    await forms[0]!.trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('partial totals'));
    await forms[1]!.trigger('submit');
    await vi.waitFor(async () => expect((await savedData()).intakes).toHaveLength(2));
    const entries = (await savedData()).intakes;
    expect(entries[0]!.date).toBe('2026-11-01');
    expect(entries[0]!.calories).toBeNull();
    expect(entries[1]!.amount).toBe(3.4);
    await vi.waitFor(() => expect(wrapper.text()).toContain('3.4 g'));
    expect(wrapper.text()).toContain('Log more');
  });

  it('applies a phase change to the plan and to a started workout with nothing logged', async () => {
    const wrapper = await app();
    await begin(wrapper);
    expect(wrapper.text()).toContain('0/7 exercises done');
    await button(wrapper, 'Back to plan').trigger('click');
    await button(wrapper, 'Settings').trigger('click');
    await wrapper.get('#phase').setValue('baseline');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Settings saved.'));
    await button(wrapper, 'Plan').trigger('click');
    expect(wrapper.text()).toContain('19 working sets');
    await button(wrapper, 'Start workout').trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('0/7 exercises done'));
    expect((await savedData()).sessions.map((session) => session.phase)).toEqual(['baseline']);
  });

  it('keeps the targets of a workout that already has logged sets', async () => {
    const wrapper = await app();
    await begin(wrapper);
    const inputs = wrapper.findAll('.set-fields input');
    for (const [index, value] of ['20', '7', '3'].entries()) await inputs[index]!.setValue(value);
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Set saved on this device.'));
    // One set of a two-set exercise: the exercise is one unit, so its bar stays empty.
    expect(wrapper.get('.segments i').attributes('style')).toContain('scaleX(0)');
    await button(wrapper, 'Back to plan').trigger('click');
    await button(wrapper, 'Settings').trigger('click');
    await wrapper.get('#phase').setValue('baseline');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Settings saved.'));
    await button(wrapper, 'Plan').trigger('click');
    expect(wrapper.text()).toContain('0 / 7 exercises done');
    expect(wrapper.get('.segments i').attributes('style')).toContain('scaleX(0)');
    expect((await savedData()).sessions.map((session) => session.phase)).toEqual(['intro']);
  });

  it('swaps from the plan: starts the workout with the alternative in place', async () => {
    const wrapper = await app();
    await wrapper.get('input[type="date"]').setValue('2026-11-02');
    await wrapper
      .findAll('button')
      .find((item) => item.text().includes('Swap for this workout'))!
      .trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('Exercise swapped for this workout.'));
    expect(wrapper.get('main h1').text()).toBe('Smith flat bench press');
    expect((await savedData()).sessions[0]!.exercises[0]!.exercise.name).toBe(
      'Smith flat bench press',
    );
  });

  it('swaps an exercise for its alternative and logs it', async () => {
    const wrapper = await app();
    await begin(wrapper);
    await wrapper
      .findAll('button')
      .find((item) => item.text().includes('Swap to'))!
      .trigger('click');
    await vi.waitFor(() => expect(wrapper.get('main h1').text()).toBe('Smith flat bench press'));
    const inputs = wrapper.findAll('.set-fields input');
    for (const [index, value] of ['20', '7', '3'].entries()) await inputs[index]!.setValue(value);
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(async () =>
      expect((await savedData()).sessions[0]!.exercises[0]!.logs).toHaveLength(1),
    );
    expect((await savedData()).sessions[0]!.exercises[0]!.exercise.loadKind).toBe('smith');
  });

  it('resumes at the first exercise with sets left', async () => {
    const wrapper = await app();
    await begin(wrapper);
    for (const index of [1, 2]) {
      const inputs = wrapper.findAll('.set-fields input');
      for (const [field, value] of ['20', '7', '3'].entries()) await inputs[field]!.setValue(value);
      await wrapper.get('form.set-form').trigger('submit');
      await vi.waitFor(async () =>
        expect((await savedData()).sessions[0]!.exercises[0]!.logs).toHaveLength(index),
      );
    }
    await button(wrapper, 'Back to plan').trigger('click');
    await button(wrapper, 'Resume workout').trigger('click');
    expect(wrapper.get('main h1').text()).toBe('Fixed-handle pull-up or chin-up');
  });

  it('suggests full baseline after two weeks of introduction', async () => {
    const database = await openDB(databaseName, 1, {
      upgrade: (entry) => entry.createObjectStore('records'),
    });
    const first = startSession('upperA', '2026-11-02', 'intro');
    const done = finishSession(
      recordSet(first, first.exercises[0]!.exercise.id, {
        index: 1,
        load: 20,
        reps: 6,
        effort: 3,
        loggedAt: new Date().toISOString(),
      }),
    );
    await database.put('records', { ...emptyState(), sessions: [done] }, 'state');
    database.close();
    vi.setSystemTime(new Date(2026, 10, 12, 9));
    const wrapper = mount(TrainingApp);
    wrappers.push(wrapper);
    await vi.waitFor(() => expect(wrapper.text()).toContain('On-device storage ready'));
    expect(wrapper.text()).not.toContain('Two weeks of introduction done');
    vi.setSystemTime(new Date(2026, 10, 16, 9));
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(wrapper.text()).toContain('Two weeks of introduction done'));
    await button(wrapper, 'Switch to Full baseline').trigger('click');
    expect(wrapper.text()).toContain('Settings & data');
  });

  it('shows a storage error instead of resetting an unsupported saved schema', async () => {
    const database = await openDB(databaseName, 1, {
      upgrade: (entry) => entry.createObjectStore('records'),
    });
    await database.put('records', { schemaVersion: 999, retained: true }, 'state');
    database.close();
    const wrapper = mount(TrainingApp);
    wrappers.push(wrapper);
    await vi.waitFor(() => expect(wrapper.text()).toContain('Nothing was reset'));
    expect(wrapper.findAll('button').some((entry) => entry.text() === 'Start workout')).toBe(false);
    const reopened = await openDB(databaseName, 1);
    expect(await reopened.get('records', 'state')).toEqual({ schemaVersion: 999, retained: true });
    reopened.close();
  });
});
