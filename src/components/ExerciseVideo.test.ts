import { defineComponent, nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExerciseVideo from './ExerciseVideo.vue';
import type { Video } from '@/domain/guides';

const wrappers: VueWrapper[] = [];
const video: Video = {
  id: 'O5viuEPDXKY',
  title: 'Smith Machine Bench Press',
  author: 'Renaissance Periodization',
};

function player() {
  const wrapper = mount(ExerciseVideo, {
    props: { video, exerciseName: 'Smith flat bench press' },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  vi.restoreAllMocks();
});

describe('inline exercise demonstration', () => {
  it('only loads YouTube after a tap and has no outbound video link', async () => {
    const wrapper = player();
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.find('a').exists()).toBe(false);
    await wrapper.get('[data-watch]').trigger('click');
    const frame = wrapper.get('iframe');
    const source = new URL(frame.attributes('src')!);
    expect(source.origin).toBe('https://www.youtube-nocookie.com');
    expect(source.pathname).toBe('/embed/O5viuEPDXKY');
    expect(source.searchParams.get('playsinline')).toBe('1');
    expect(source.searchParams.get('origin')).toBe(window.location.origin);
    expect(frame.attributes('title')).toBe('Demonstration: Smith flat bench press');
    expect(frame.attributes('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    expect(wrapper.find('a').exists()).toBe(false);
  });

  it('unloads the player on close and returns focus to the watch button', async () => {
    const wrapper = player();
    await wrapper.get('[data-watch]').trigger('click');
    await wrapper.get('button').trigger('click');
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.get('[data-watch]').element);
  });

  it('removes the previous player when the exercise changes', async () => {
    const wrapper = player();
    await wrapper.get('[data-watch]').trigger('click');
    await wrapper.setProps({
      video: { ...video, id: 'DMo3HJoawrU', title: 'Single Arm Supported Dumbbell Row' },
      exerciseName: 'Bench-supported one-arm DB row',
    });
    expect(wrapper.find('iframe').exists()).toBe(false);
    await wrapper.get('[data-watch]').trigger('click');
    expect(wrapper.get('iframe').attributes('src')).toContain('/embed/DMo3HJoawrU');
  });

  it('unloads playback when the enclosing exercise disclosure is collapsed', async () => {
    const wrapper = mount(
      defineComponent({
        components: { ExerciseVideo },
        setup: () => ({ video }),
        template:
          '<details open><summary>Exercise</summary><ExerciseVideo :video="video" exercise-name="Smith flat bench press" /></details>',
      }),
    );
    wrappers.push(wrapper);
    await nextTick();
    await wrapper.get('[data-watch]').trigger('click');
    expect(wrapper.find('iframe').exists()).toBe(true);
    const details = wrapper.get('details');
    (details.element as HTMLDetailsElement).open = false;
    await details.trigger('toggle');
    expect(wrapper.find('iframe').exists()).toBe(false);
  });

  it('retries inside the existing page instead of opening another tab', async () => {
    const wrapper = player();
    const open = vi.spyOn(window, 'open');
    await wrapper.get('[data-watch]').trigger('click');
    const original = wrapper.get('iframe').element;
    const retryButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Retry video here')!;
    await retryButton.trigger('click');
    expect(wrapper.get('iframe').element).not.toBe(original);
    expect(open).not.toHaveBeenCalled();
  });

  it('shows the variation warning when the clip differs from your setup', () => {
    const wrapper = mount(ExerciseVideo, {
      props: { video: { ...video, variant: 'Grip may differ.' }, exerciseName: 'Pull-up' },
    });
    wrappers.push(wrapper);
    expect(wrapper.text()).toContain('Grip may differ.');
    expect(wrapper.find('iframe').exists()).toBe(false);
  });
});
