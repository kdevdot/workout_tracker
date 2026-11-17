<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import { ShieldCheck } from '@lucide/vue';
import type { AppState } from '@/domain/state';
import type { Phase } from '@/domain/programme-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BackupCard from '@/components/BackupCard.vue';

const props = defineProps<{ state: AppState; busy: boolean }>();
const emit = defineEmits<{
  settings: [settings: AppState['settings']];
  restore: [data: AppState];
}>();
const name = shallowRef('');
const calories = shallowRef<string | number>('');
const protein = shallowRef<string | number>('');
const phase = shallowRef<Phase>('intro');
const restMinutes = shallowRef<string | number>('');
const error = shallowRef('');
const base = import.meta.env.BASE_URL;

watch(
  () => props.state.settings,
  (settings) => {
    name.value = settings.whey.name;
    calories.value = settings.whey.calories === null ? '' : String(settings.whey.calories);
    protein.value = settings.whey.protein === null ? '' : String(settings.whey.protein);
    phase.value = settings.phase;
    restMinutes.value = settings.restMinutes === null ? '' : String(settings.restMinutes);
  },
  { immediate: true },
);

function optionalNumber(value: string | number) {
  return String(value).trim() === '' ? null : Number(value);
}
function save() {
  const calorieValue = optionalNumber(calories.value);
  const proteinValue = optionalNumber(protein.value);
  const restValue = optionalNumber(restMinutes.value);
  if (restValue !== null && !(restValue >= 0.5 && restValue <= 10)) {
    error.value = 'Rest must be between 0.5 and 10 minutes, or blank for the programme default.';
    return;
  }
  if (
    !name.value.trim() ||
    [calorieValue, proteinValue].some(
      (value) => value !== null && (!Number.isFinite(value) || value < 0 || value > 10000),
    )
  ) {
    error.value = 'Enter a product name and nonnegative label values, or leave values blank.';
    return;
  }
  error.value = '';
  emit('settings', {
    phase: phase.value,
    restMinutes: restValue,
    whey: { name: name.value.trim(), calories: calorieValue, protein: proteinValue },
  });
}
</script>

<template>
  <header class="page-header">
    <h1 class="page-heading">Settings & data</h1>
    <p class="text-muted-foreground text-sm">
      Set up your training, product label and device backups.
    </p>
  </header>

  <Card class="gap-4 py-5">
    <CardContent class="px-5">
      <form class="flex flex-col gap-6" @submit.prevent="save">
        <fieldset class="flex min-w-0 flex-col gap-4">
          <legend class="section-heading mb-3">Training</legend>
          <p class="text-muted-foreground text-sm leading-5">
            You choose when to change phase. Saved workouts keep their original prescriptions.
          </p>
          <div class="flex flex-col gap-1.5">
            <Label for="phase">Phase for new workouts</Label>
            <select
              id="phase"
              v-model="phase"
              class="border-input bg-background focus-visible:ring-ring/50 h-11 min-w-0 rounded-lg border px-3 text-base outline-none focus-visible:ring-3"
            >
              <option value="intro">Introduction · 2 sets, 3 RIR</option>
              <option value="baseline">Full baseline · when ready</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="rest">Rest between sets · minutes</Label>
            <Input
              id="rest"
              v-model="restMinutes"
              type="number"
              min="0.5"
              max="10"
              step="any"
              inputmode="decimal"
              placeholder="Programme default"
              class="h-11"
              aria-describedby="rest-help"
            />
            <p id="rest-help" class="text-muted-foreground text-xs leading-5">
              Leave blank for each exercise's rest. Or enter 0.5–10 minutes (1.5 = 90 s). Applies to
              the next set you save.
            </p>
          </div>
        </fieldset>
        <fieldset class="flex min-w-0 flex-col gap-4">
          <legend class="section-heading mb-3">Whey label</legend>
          <p id="whey-help" class="text-muted-foreground text-sm leading-5">
            Use the values on your pack. These apply to new whey entries only.
          </p>
          <div class="flex flex-col gap-1.5">
            <Label for="whey-name">Exact whey product / flavour</Label>
            <Input
              id="whey-name"
              v-model="name"
              maxlength="250"
              required
              aria-describedby="whey-help"
            />
          </div>
          <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,6rem),1fr))] gap-3">
            <div class="flex flex-col gap-1.5">
              <Label for="whey-kcal">kcal per serving</Label>
              <Input
                id="whey-kcal"
                v-model="calories"
                type="number"
                min="0"
                max="10000"
                step="any"
                inputmode="decimal"
                placeholder="Label needed"
                class="h-11"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="whey-protein">Protein · g per serving</Label>
              <Input
                id="whey-protein"
                v-model="protein"
                type="number"
                min="0"
                max="10000"
                step="any"
                inputmode="decimal"
                placeholder="Label needed"
                class="h-11"
              />
            </div>
          </div>
        </fieldset>
        <p v-if="error" class="text-destructive text-sm font-medium" role="alert">{{ error }}</p>
        <Button type="submit" size="lg" :disabled="busy">{{
          busy ? 'Saving…' : 'Save settings'
        }}</Button>
      </form>
    </CardContent>
  </Card>

  <BackupCard :state="state" :busy="busy" @restore="emit('restore', $event)" />

  <Card class="gap-3 py-5">
    <CardHeader class="px-5">
      <CardTitle class="flex items-center gap-2"
        ><ShieldCheck class="size-4" />Storage & privacy</CardTitle
      >
    </CardHeader>
    <CardContent class="text-muted-foreground flex flex-col gap-2 px-5 text-xs leading-5">
      <ul class="flex flex-col gap-1">
        <li>
          Records stay on this device only. Clearing site data deletes them, so export a backup now
          and then.
        </li>
        <li>No account, analytics or tracking. Nothing is uploaded.</li>
        <li>Works offline once installed. Videos need internet; movement diagrams work offline.</li>
      </ul>
      <details>
        <summary class="text-foreground flex min-h-11 items-center py-2 font-semibold">
          Exercise media credits
        </summary>
        <p>
          Exercise-list artwork: Bryl Lim / Workout Guide and Everkinetic, CC BY-SA 4.0. Selected
          stills are cropped and displayed in monochrome on neutral backgrounds, without animation.
          Some show the closest catalogue movement; thumbnails do not replace technique
          instructions.
          <a
            class="text-primary underline underline-offset-4"
            :href="`${base}exercises/ATTRIBUTION.md`"
            >Artwork credits and provenance</a
          >.
        </p>
        <p>
          Muscle diagrams from the wger exercise database (wger.de), licensed CC BY-SA 4.0, with
          highlight colours changed. Modified files are shared under the same licence.
        </p>
        <p class="mt-2">
          Demonstrations use licensed Your Move and Goulart / wger videos, creator-hosted Vimeo
          embeds and original movement diagrams. Each preview uses its selected video or diagram.
          Source credits and any setup differences appear beside the demonstration.
        </p>
        <a class="text-primary underline underline-offset-4" :href="`${base}demos/ATTRIBUTION.md`">
          Video credits and modifications
        </a>
        <p class="mt-2">
          Vimeo receives a connection when its poster loads and when you start its player; its
          privacy rules apply. Videos need internet, start only after a tap and are not saved for
          offline playback. Creator-hosted embeds retain their own rights; the wger licence does not
          apply to them.
        </p>
        <a class="text-primary underline underline-offset-4" :href="`${base}muscles/LICENSE.txt`"
          >Read the licence notice</a
        >
      </details>
    </CardContent>
  </Card>
</template>
