import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PushupsView from './PushupsView.vue';

function tracker() {
  return mount(PushupsView, {
    props: {
      challenge: { startDate: '2026-08-01', dailyTarget: 100, entries: [] },
      today: '2026-11-03',
      busy: false,
    },
  });
}

describe('push-up date selection', () => {
  it('shows the selected date immediately and keeps quick date choices in sync', async () => {
    const wrapper = tracker();
    const picker = wrapper.get<HTMLInputElement>('#pushup-date');
    expect(picker.element.value).toBe('2026-11-03');
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Yesterday')!
      .trigger('click');
    expect(picker.element.value).toBe('2026-11-02');
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Today')!
      .trigger('click');
    expect(picker.element.value).toBe('2026-11-03');
    await wrapper.get('[aria-label="Previous month"]').trigger('click');
    expect(wrapper.text()).toContain('October 2026');
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Today')!
      .trigger('click');
    expect(wrapper.text()).toContain('November 2026');
    wrapper.unmount();
  });

  it('browses months without changing the logging date until a day is chosen', async () => {
    const wrapper = tracker();
    const picker = wrapper.get<HTMLInputElement>('#pushup-date');
    const previous = wrapper.get('[aria-label="Previous month"]');
    const next = wrapper.get('[aria-label="Next month"]');
    expect(next.attributes('disabled')).toBeDefined();
    await previous.trigger('click');
    expect(wrapper.text()).toContain('October 2026');
    expect(picker.element.value).toBe('2026-11-03');
    await wrapper.get('[aria-label="Sat 31 Oct: 0 of 100 push-ups"]').trigger('click');
    expect(picker.element.value).toBe('2026-10-31');
    await wrapper.get('[aria-label="Custom number of push-ups"]').setValue('25');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('add')![0]!.slice(0, 2)).toEqual(['2026-10-31', 25]);
    await previous.trigger('click');
    await previous.trigger('click');
    expect(wrapper.text()).toContain('August 2026');
    expect(previous.attributes('disabled')).toBeDefined();
    await wrapper.setProps({ busy: true });
    expect(next.attributes('disabled')).toBeDefined();
    expect(wrapper.findAll('[aria-label="Push-up days"] button:not(:disabled)')).toHaveLength(0);
    wrapper.unmount();
  });

  it('keeps a custom amount until the parent confirms it was saved', async () => {
    const wrapper = tracker();
    const input = wrapper.get<HTMLInputElement>('[aria-label="Custom number of push-ups"]');
    await input.setValue('37');
    await wrapper.get('form').trigger('submit');
    expect(input.element.value).toBe('37');
    const onSaved = wrapper.emitted('add')![0]![2] as () => void;
    onSaved();
    await wrapper.vm.$nextTick();
    expect(input.element.value).toBe('');
    wrapper.unmount();
  });

  it('logs dates older than the calendar and rejects empty or out-of-range dates', async () => {
    const wrapper = tracker();
    const picker = wrapper.get<HTMLInputElement>('#pushup-date');
    expect(picker.attributes()).toMatchObject({ min: '2026-08-01', max: '2026-11-03' });
    await picker.setValue('2026-08-01');
    expect(wrapper.text()).toContain('Saturday, 1 August 2026');
    expect(wrapper.get('[aria-label="Previous day"]').attributes('disabled')).toBeDefined();
    await wrapper.get('[aria-label="Custom number of push-ups"]').setValue('30');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('add')![0]!.slice(0, 2)).toEqual(['2026-08-01', 30]);

    for (const value of ['', '2026-07-31', '2026-11-04']) {
      await picker.setValue(value);
      expect(picker.element.value).toBe('2026-08-01');
      expect(wrapper.text()).toContain('Saturday, 1 August 2026');
    }
    wrapper.unmount();
  });

  it('keeps calendar and date picker selection in sync', async () => {
    const wrapper = tracker();
    const calendarDay = wrapper.get('[aria-label="Mon 2 Nov: 0 of 100 push-ups"]');
    await calendarDay.trigger('click');
    const picker = wrapper.get<HTMLInputElement>('#pushup-date');
    expect(picker.element.value).toBe('2026-11-02');
    expect(calendarDay.attributes('aria-pressed')).toBe('true');
    await picker.setValue('2026-11-01');
    expect(calendarDay.attributes('aria-pressed')).toBe('false');
    expect(
      wrapper.get('[aria-label="Sun 1 Nov: 0 of 100 push-ups"]').attributes('aria-pressed'),
    ).toBe('true');
    wrapper.unmount();
  });

  it('preserves a draft and a chosen past date across midnight, then follows a reset', async () => {
    const wrapper = tracker();
    const picker = wrapper.get<HTMLInputElement>('#pushup-date');
    await wrapper.get('[aria-label="Custom number of push-ups"]').setValue('15');
    await wrapper.setProps({ today: '2026-11-04' });
    expect(picker.element.value).toBe('2026-11-03');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('add')![0]!.slice(0, 2)).toEqual(['2026-11-03', 15]);

    await picker.setValue('2026-11-01');
    await wrapper.setProps({ today: '2026-11-05' });
    expect(picker.element.value).toBe('2026-11-01');
    await wrapper.setProps({
      challenge: { startDate: '2026-11-05', dailyTarget: 100, entries: [] },
    });
    expect(picker.element.value).toBe('2026-11-05');
    expect(wrapper.text()).toContain('Day 1');
    wrapper.unmount();
  });
});
