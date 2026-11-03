import 'fake-indexeddb/auto';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { deleteDB, openDB } from 'idb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingApp from './TrainingApp.vue';
import type { AppState } from '../domain/state';

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
    const inputs = wrapper.findAll('input[type="number"]');
    await inputs[0]!.setValue('120');
    await inputs[1]!.setValue('24');
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
    const restored = wrapper.findAll('input[type="number"]');
    expect((restored[0]!.element as HTMLInputElement).value).toBe('120');
    expect((restored[1]!.element as HTMLInputElement).value).toBe('24');
  });

  it('uses the rest minutes chosen in Settings for the timer', async () => {
    const wrapper = await app();
    await button(wrapper, 'Settings').trigger('click');
    await wrapper.get('select#rest').setValue('2');
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
