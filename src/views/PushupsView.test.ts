import { mount, type VueWrapper } from '@vue/test-utils';
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

function selectedDate(wrapper: VueWrapper) {
  return wrapper.get('time').attributes('datetime');
}

describe('push-up calendar date selection', () => {
  it('opens on today and shows the full selected date without duplicate date controls', () => {
    const wrapper = tracker();
    expect(selectedDate(wrapper)).toBe('2026-11-03');
    expect(wrapper.get('#pushup-log-date').text()).toBe('Tuesday, 3 November 2026');
    expect(wrapper.find('input[type="date"]').exists()).toBe(false);
    expect(
      wrapper.findAll('button').some((button) => ['Today', 'Yesterday'].includes(button.text())),
    ).toBe(false);
    expect(
      wrapper.get('[aria-label="Tue 3 Nov: 0 of 100 push-ups"]').attributes('aria-pressed'),
    ).toBe('true');
    wrapper.unmount();
  });

  it('browses months without changing the logging date until a day is chosen', async () => {
    const wrapper = tracker();
    const previous = wrapper.get('[aria-label="Previous month"]');
    const next = wrapper.get('[aria-label="Next month"]');
    expect(next.attributes('disabled')).toBeDefined();
    await previous.trigger('click');
    expect(wrapper.text()).toContain('October 2026');
    expect(selectedDate(wrapper)).toBe('2026-11-03');
    await wrapper.get('[aria-label="Sat 31 Oct: 0 of 100 push-ups"]').trigger('click');
    expect(selectedDate(wrapper)).toBe('2026-10-31');
    expect(wrapper.emitted('add')).toBeUndefined();
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

  it('reaches the challenge start through the calendar and rejects unavailable days', async () => {
    const wrapper = tracker();
    const previous = wrapper.get('[aria-label="Previous month"]');
    for (let count = 0; count < 3; count++) await previous.trigger('click');
    const beforeStart = wrapper.get('[aria-label="Fri 31 Jul: 0 of 100 push-ups"]');
    expect(beforeStart.attributes('disabled')).toBeDefined();
    await beforeStart.trigger('click');
    expect(selectedDate(wrapper)).toBe('2026-11-03');
    await wrapper.get('[aria-label="Sat 1 Aug: 0 of 100 push-ups"]').trigger('click');
    expect(selectedDate(wrapper)).toBe('2026-08-01');
    expect(wrapper.text()).toContain('Saturday, 1 August 2026');
    await wrapper.get('[aria-label="Custom number of push-ups"]').setValue('30');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('add')![0]!.slice(0, 2)).toEqual(['2026-08-01', 30]);

    const next = wrapper.get('[aria-label="Next month"]');
    for (let count = 0; count < 3; count++) await next.trigger('click');
    const future = wrapper.get('[aria-label="Wed 4 Nov: 0 of 100 push-ups"]');
    expect(future.attributes('disabled')).toBeDefined();
    await future.trigger('click');
    expect(selectedDate(wrapper)).toBe('2026-08-01');
    expect(wrapper.emitted('add')).toHaveLength(1);
    wrapper.unmount();
  });

  it('keeps the logging date and calendar selection in sync', async () => {
    const wrapper = tracker();
    const calendarDay = wrapper.get('[aria-label="Mon 2 Nov: 0 of 100 push-ups"]');
    await calendarDay.trigger('click');
    expect(selectedDate(wrapper)).toBe('2026-11-02');
    expect(calendarDay.attributes('aria-pressed')).toBe('true');
    await wrapper.get('[aria-label="Sun 1 Nov: 0 of 100 push-ups"]').trigger('click');
    expect(selectedDate(wrapper)).toBe('2026-11-01');
    expect(calendarDay.attributes('aria-pressed')).toBe('false');
    expect(
      wrapper.get('[aria-label="Sun 1 Nov: 0 of 100 push-ups"]').attributes('aria-pressed'),
    ).toBe('true');
    wrapper.unmount();
  });

  it('preserves a draft and a chosen past date across midnight, then follows a reset', async () => {
    const wrapper = tracker();
    await wrapper.get('[aria-label="Custom number of push-ups"]').setValue('15');
    await wrapper.setProps({ today: '2026-11-04' });
    expect(selectedDate(wrapper)).toBe('2026-11-03');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('add')![0]!.slice(0, 2)).toEqual(['2026-11-03', 15]);

    await wrapper.get('[aria-label="Sun 1 Nov: 0 of 100 push-ups"]').trigger('click');
    await wrapper.setProps({ today: '2026-11-05' });
    expect(selectedDate(wrapper)).toBe('2026-11-01');
    await wrapper.setProps({
      challenge: { startDate: '2026-11-05', dailyTarget: 100, entries: [] },
    });
    expect(selectedDate(wrapper)).toBe('2026-11-05');
    expect(wrapper.text()).toContain('Day 1');
    wrapper.unmount();
  });
});
