<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import { ShieldCheck } from '@lucide/vue';
import type { AppState } from '@/domain/state';
import type { Phase } from '@/domain/programme-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  <header class="page-header screen-enter">
    <h1 class="page-heading">Settings & data</h1>
    <p class="text-muted-foreground text-sm">
      Local-first storage, with an independent backup you control.
    </p>
  </header>

  <Card class="gap-4 py-5">
    <CardHeader class="px-5">
      <CardTitle>Training & product label</CardTitle>
      <CardDescription
        >No automatic increase. Existing sessions retain their original
        prescriptions.</CardDescription
      >
    </CardHeader>
    <CardContent class="px-5">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <div class="flex flex-col gap-1.5">
          <Label for="phase">Default phase for new sessions</Label>
          <select
            id="phase"
            v-model="phase"
            class="border-input bg-background focus-visible:ring-ring/50 h-11 rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
          >
            <option value="intro">Introduction · 2 sets, 3 RIR</option>
            <option value="baseline">Full baseline · when ready</option>
          </select>
          <p class="text-muted-foreground text-xs">Timed holds keep technical form reserve.</p>
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
          />
          <p class="text-muted-foreground text-xs">
            Any time from 0.5 to 10 minutes, e.g. 1.5 = 90 s. Leave blank to use each exercise's
            programme rest (60 s–3 min). Applies to the next set you save.
          </p>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="whey-name">Exact whey product / flavour</Label>
          <Input id="whey-name" v-model="name" maxlength="250" required class="h-11" />
        </div>
        <div class="grid grid-cols-2 gap-3">
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
            <Label for="whey-protein">Protein g per serving</Label>
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
        <p class="text-muted-foreground text-xs">
          Enter your label, not a generic brand value. Values apply to new whey entries only.
        </p>
        <p v-if="error" class="text-destructive text-sm font-medium" role="alert">{{ error }}</p>
        <Button type="submit" size="lg" :disabled="busy">Save settings</Button>
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
        <li>Works offline once installed. Demo videos need internet.</li>
      </ul>
      <details>
        <summary class="text-foreground py-2 font-semibold">Exercise media credits</summary>
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
          Demonstrations stream from YouTube creators (mainly Renaissance Periodization, plus Runna,
          Hinge Health, Bodhi Bodies and Josh Evans) inside the exercise guide. They load only when
          you tap Watch, require internet and may show ads. YouTube receives that player connection;
          its privacy rules apply. These streams are not bundled or licensed under the wger notice.
        </p>
        <a class="text-primary underline underline-offset-4" :href="`${base}muscles/LICENSE.txt`"
          >Read the licence notice</a
        >
      </details>
    </CardContent>
  </Card>
</template>
