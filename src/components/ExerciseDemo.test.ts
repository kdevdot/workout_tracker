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
  it('loads the native video only after a tap and uses a frame from that clip', async () => {
    const wrapper = player();
    expect(wrapper.find('video').exists()).toBe(false);
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(
      wrapper.findAll('img').every((image) => !image.attributes('src')?.startsWith('https:')),
    ).toBe(true);
    expect(wrapper.get('img').attributes('src')).toBe(
      `${import.meta.env.BASE_URL}demos/barbell-bench-press.jpg`,
    );
    expect(wrapper.text()).toContain('Exercise video by Your Move');
    await wrapper.get('[data-quick-demo]').trigger('click');
    const video = wrapper.get('video');
    expect(video.attributes('src')).toBe(
      `${import.meta.env.BASE_URL}demos/barbell-bench-press.mp4`,
    );
    for (const attribute of ['controls', 'autoplay', 'loop', 'playsinline']) {
      expect(video.attributes()).toHaveProperty(attribute);
    }
    expect((video.element as HTMLVideoElement).muted).toBe(true);
    expect(video.attributes('preload')).toBe('none');
    expect(video.attributes('aria-label')).toBe('Exercise demonstration: Barbell bench press');
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

  it('pairs a Vimeo video with its own poster and loads the player only after a tap', async () => {
    const wrapper = player('barbell-romanian-deadlift');
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.find('video').exists()).toBe(false);
    expect(wrapper.get('img').attributes('src')).toBe(
      demos['barbell-romanian-deadlift']!.kind === 'vimeo'
        ? demos['barbell-romanian-deadlift']!.poster
        : '',
    );
    await wrapper.get('[data-quick-demo]').trigger('click');
    const frame = wrapper.get('iframe');
    const url = new URL(frame.attributes('src')!);
    expect(url.origin).toBe('https://player.vimeo.com');
    expect(url.pathname).toBe('/video/1000189819');
    for (const key of ['autoplay', 'muted', 'loop', 'playsinline', 'dnt']) {
      expect(url.searchParams.get(key)).toBe('1');
    }
    expect(frame.attributes()).toHaveProperty('allowfullscreen');
    expect(wrapper.text()).toContain('ActionJax Strength & Performance');
    expect(wrapper.find('video').exists()).toBe(false);
    expect(wrapper.html()).not.toMatch(/youtube|ytimg/i);
    await wrapper.get('button').trigger('click');
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.get('[data-quick-demo]').element);
  });

  it('retries an embedded player and unloads it when the exercise changes', async () => {
    const wrapper = player('barbell-romanian-deadlift');
    await wrapper.get('[data-quick-demo]').trigger('click');
    const previousFrame = wrapper.get('iframe').element;
    const retry = wrapper.findAll('button').find((button) => button.text() === 'Retry demo')!;
    await retry.trigger('click');
    expect(wrapper.get('iframe').element).not.toBe(previousFrame);
    await wrapper.setProps({
      exerciseId: 'floor-reverse-crunch',
      demo: demos['floor-reverse-crunch']!,
    });
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.find('[data-motion="reverse-crunch"]').exists()).toBe(true);
  });

  it('keeps playback available when a poster fails instead of substituting another exercise', async () => {
    const wrapper = player();
    await wrapper.get('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.get('[data-quick-demo]').text()).toContain('Barbell bench press');
    expect(wrapper.find('[data-exercise-icon]').exists()).toBe(false);
    await wrapper.get('[data-quick-demo]').trigger('click');
    expect(wrapper.find('video').exists()).toBe(true);
  });

  it('shows variation differences before starting playback', () => {
    const wrapper = player('paused-barbell-bench-press');
    expect(wrapper.text()).toContain('Pause not shown');
    expect(wrapper.find('video').exists()).toBe(false);
  });

  it('uses the same movement model for an animation preview and its playback', async () => {
    const wrapper = player('incline-db-curl');
    const preview = wrapper.get('[data-motion]');
    expect(preview.attributes('data-motion')).toBe('incline-curl');
    expect(preview.attributes('data-phase')).toBe('0.000');
    expect(wrapper.find('img, video, iframe').exists()).toBe(false);
    await wrapper.get('[data-quick-demo]').trigger('click');
    expect(wrapper.get('[data-motion]').attributes('data-motion')).toBe('incline-curl');
    const pause = wrapper.findAll('button').find((button) => button.text() === 'Pause animation')!;
    await pause.trigger('click');
    expect(wrapper.text()).toContain('Resume animation');
    await wrapper.get('button').trigger('click');
    expect(wrapper.find('[data-quick-demo]').exists()).toBe(true);
    expect(wrapper.get('[data-motion]').attributes('data-phase')).toBe('0.000');
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
    const retry = wrapper.findAll('button').find((button) => button.text() === 'Retry demo')!;
    await retry.trigger('click');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.get('video').attributes('src')).toBe(
      `${import.meta.env.BASE_URL}demos/barbell-bench-press.mp4`,
    );
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
