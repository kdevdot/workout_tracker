import { defineComponent, nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import ExerciseDemo from './ExerciseDemo.vue';
import { demos } from '@/domain/demos';

const wrappers: VueWrapper[] = [];

function player(exerciseId = 'barbell-bench-press') {
  const wrapper = mount(ExerciseDemo, {
    props: { demo: demos[exerciseId]!, exerciseId, exerciseName: 'Barbell bench press' },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
});

describe('quick exercise demonstration', () => {
  it('does not connect to the remote media host before a tap', async () => {
    const wrapper = player();
    expect(wrapper.find('video').exists()).toBe(false);
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(
      wrapper.findAll('img').every((image) => !image.attributes('src')?.startsWith('https:')),
    ).toBe(true);
    expect(wrapper.text()).toContain('Exercise video by Your Move');
    await wrapper.get('[data-quick-demo]').trigger('click');
    const video = wrapper.get('video');
    expect(video.attributes('src')).toBe(demos['barbell-bench-press']!.src);
    for (const attribute of ['controls', 'autoplay', 'loop', 'playsinline']) {
      expect(video.attributes()).toHaveProperty(attribute);
    }
    expect((video.element as HTMLVideoElement).muted).toBe(true);
    expect(video.attributes('preload')).toBe('none');
    expect(video.attributes('aria-label')).toBe('Quick demonstration: Barbell bench press');
    expect(wrapper.find('iframe').exists()).toBe(false);
  });

  it('uses base-relative local videos and real posters for the CC clips', async () => {
    const wrapper = player('dips');
    expect(wrapper.get('img').attributes('src')).toBe(`${import.meta.env.BASE_URL}demos/dips.jpg`);
    await wrapper.get('[data-quick-demo]').trigger('click');
    expect(wrapper.get('video').attributes('src')).toBe(
      `${import.meta.env.BASE_URL}demos/dips.mp4`,
    );
    expect(wrapper.text()).toContain('Goulart / wger');
    expect(wrapper.text()).toContain('CC BY-SA 4.0');
  });

  it('shows variation differences before starting playback', () => {
    const wrapper = player('paused-barbell-bench-press');
    expect(wrapper.text()).toContain('Pause not shown');
    expect(wrapper.find('video').exists()).toBe(false);
  });

  it('unloads on close and restores focus', async () => {
    const wrapper = player();
    await wrapper.get('[data-quick-demo]').trigger('click');
    await wrapper.get('button').trigger('click');
    expect(wrapper.find('video').exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.get('[data-quick-demo]').element);
  });

  it('recovers from network errors without leaving the page', async () => {
    const wrapper = player();
    await wrapper.get('[data-quick-demo]').trigger('click');
    await wrapper.get('video').trigger('error');
    expect(wrapper.get('[role="alert"]').text()).toContain('Check your connection');
    expect(wrapper.find('video').exists()).toBe(false);
    const retry = wrapper.findAll('button').find((button) => button.text() === 'Retry quick demo')!;
    await retry.trigger('click');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.get('video').attributes('src')).toBe(demos['barbell-bench-press']!.src);
  });

  it('resets playback and errors when changing exercise, even with the same clip', async () => {
    const wrapper = player();
    await wrapper.get('[data-quick-demo]').trigger('click');
    await wrapper.get('video').trigger('error');
    await wrapper.setProps({ exerciseId: 'paused-barbell-bench-press' });
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('[data-quick-demo]').exists()).toBe(true);
    await wrapper.get('[data-quick-demo]').trigger('click');
    await wrapper.setProps({ exerciseId: 'barbell-bench-press' });
    expect(wrapper.find('video').exists()).toBe(false);
  });

  it('unloads when the exercise guide is collapsed', async () => {
    const wrapper = mount(
      defineComponent({
        components: { ExerciseDemo },
        setup: () => ({ demo: demos['barbell-bench-press']! }),
        template:
          '<details open><summary>Guide</summary><ExerciseDemo :demo="demo" exercise-id="barbell-bench-press" exercise-name="Barbell bench press" /></details>',
      }),
    );
    wrappers.push(wrapper);
    await nextTick();
    await wrapper.get('[data-quick-demo]').trigger('click');
    const details = wrapper.get('details');
    (details.element as HTMLDetailsElement).open = false;
    await details.trigger('toggle');
    expect(wrapper.find('video').exists()).toBe(false);
  });
});
