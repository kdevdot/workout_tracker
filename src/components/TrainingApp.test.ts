import 'fake-indexeddb/auto';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { deleteDB, openDB } from 'idb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingApp from './TrainingApp.vue';
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
    const symbols = wrapper.findAll('[data-exercise-icon]');
    expect(symbols).toHaveLength(7);
    expect(symbols[0]!.attributes('data-exercise-icon')).toBe('bench-press');
    expect(symbols[1]!.attributes('data-exercise-icon')).toBe('pull-up');
    const summaries = wrapper
      .findAll('summary')
      .filter((summary) => summary.find('[data-exercise-icon]').exists());
    expect(summaries.every((summary) => !/^\d/.test(summary.text()))).toBe(true);
    expect(summaries[0]!.text()).toContain('Smith flat bench press');
    expect(summaries[0]!.text()).toContain('2 × 5–8');
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
    await wrapper.get('[data-watch]').trigger('click');
    expect(wrapper.get('iframe').attributes('src')).toContain('/embed/O5viuEPDXKY');
    await button(wrapper, 'Close video').trigger('click');
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

  it('tracks daily push-ups: start, log, undo', async () => {
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
    await chip('Supine heel walkout').trigger('click');
    expect(wrapper.find('[id^="load-"]').exists()).toBe(false);
    await chip('Dead bug').trigger('click');
    expect(wrapper.find('[id^="load-"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('both sides');
    await wrapper.get('#left-1').setValue('10');
    await wrapper.get('#right-1').setValue('9');
    await wrapper.get('#effort-1').setValue('2');
    await wrapper.get('form.set-form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('L 10 / R 9'));
    const deadBug = (await savedData()).sessions[0]!.exercises.find(
      (item) => item.exercise.id === 'dead-bug',
    )!;
    expect(deadBug.logs[0]).toMatchObject({ load: null, reps: 9, sides: { left: 10, right: 9 } });
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
