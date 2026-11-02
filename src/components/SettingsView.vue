<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import { Cloud, Download, ShieldCheck, Upload } from '@lucide/vue';
import {
  MAX_BACKUP_BYTES,
  encodeBackup,
  parseBackup,
  type AppState,
  type Backup,
} from '@/domain/state';
import { localDate } from '@/domain/dates';
import type { Phase } from '@/domain/programme-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const props = defineProps<{ state: AppState; busy: boolean }>();
const emit = defineEmits<{
  settings: [settings: AppState['settings']];
  restore: [data: AppState];
}>();
const name = shallowRef('');
const calories = shallowRef<string | number>('');
const protein = shallowRef<string | number>('');
const phase = shallowRef<Phase>('intro');
const error = shallowRef('');
const pending = shallowRef<Backup | null>(null);
const accepted = shallowRef(false);
const exported = shallowRef(false);
const base = import.meta.env.BASE_URL;

watch(
  () => props.state.settings,
  (settings) => {
    name.value = settings.whey.name;
    calories.value = settings.whey.calories === null ? '' : String(settings.whey.calories);
    protein.value = settings.whey.protein === null ? '' : String(settings.whey.protein);
    phase.value = settings.phase;
  },
  { immediate: true },
);

function optionalNumber(value: string | number) {
  return String(value).trim() === '' ? null : Number(value);
}
function save() {
  const calorieValue = optionalNumber(calories.value);
  const proteinValue = optionalNumber(protein.value);
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
    whey: { name: name.value.trim(), calories: calorieValue, protein: proteinValue },
  });
}
function download() {
  error.value = '';
  try {
    const blob = new Blob([encodeBackup(props.state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `steady-backup-${localDate()}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    exported.value = true;
  } catch {
    error.value = 'Backup could not be prepared. Your saved data was not changed.';
  }
}
async function readFile(event: Event) {
  error.value = '';
  pending.value = null;
  accepted.value = false;
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error('Too large');
    pending.value = parseBackup(await file.text());
  } catch {
    error.value =
      'Invalid, unsupported, or oversized backup. Nothing was replaced. Only version 1 Steady backups up to 50 MB are accepted.';
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <header class="flex flex-col gap-1">
    <h1 class="text-[2.1rem] leading-tight font-extrabold tracking-tight">Your data. Your copy.</h1>
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
        <Button type="submit" variant="secondary" size="lg" :disabled="busy">Save settings</Button>
      </form>
    </CardContent>
  </Card>

  <Card class="gap-4 py-5">
    <CardHeader class="px-5">
      <CardTitle>JSON backup</CardTitle>
      <CardDescription>
        {{ state.sessions.length }} workout sessions · {{ state.intakes.length }} supplement entries
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-3 px-5">
      <Button size="lg" :disabled="busy" @click="download"><Download />Download JSON backup</Button>
      <p v-if="exported" class="text-muted-foreground text-xs" role="status">
        Download requested. Check your phone's Files or Downloads before relying on this copy.
      </p>
      <label
        class="hover:bg-muted/50 focus-within:ring-ring/50 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed text-sm font-medium focus-within:ring-3"
      >
        <Upload class="size-4" />Choose a backup to restore
        <input
          type="file"
          accept=".json,application/json"
          class="sr-only"
          :disabled="busy"
          @change="readFile"
        />
      </label>
      <p class="text-muted-foreground text-xs">
        Restoring replaces current records; it does not merge them. Export your current data first.
      </p>
      <div v-if="pending" class="bg-coral-soft/60 flex flex-col gap-3 rounded-xl p-4">
        <h3 class="font-bold">Review backup</h3>
        <p class="text-sm">
          {{ pending.data.sessions.length }} sessions · {{ pending.data.intakes.length }} intake
          entries
        </p>
        <p class="text-muted-foreground text-xs">
          Exported {{ new Date(pending.exportedAt).toLocaleString() }}
        </p>
        <Label class="flex items-start gap-2 text-sm leading-5 font-normal">
          <Checkbox v-model="accepted" class="mt-0.5" />I understand this replaces my current saved
          records.
        </Label>
        <Button
          variant="destructive"
          size="lg"
          :disabled="!accepted || busy"
          @click="emit('restore', pending.data)"
          >Replace with this backup</Button
        >
        <Button variant="ghost" @click="pending = null">Cancel restore</Button>
      </div>
    </CardContent>
  </Card>
  <p v-if="error" class="text-destructive text-sm font-medium" role="alert">{{ error }}</p>

  <Card class="gap-3 py-5">
    <CardHeader class="px-5">
      <CardTitle class="flex items-center gap-2"><Cloud class="size-4" />Google Drive</CardTitle>
    </CardHeader>
    <CardContent class="text-muted-foreground px-5 text-sm leading-6">
      Not connected. Drive backup is a later milestone; no Google authorisation or cloud backup has
      happened.
    </CardContent>
  </Card>

  <Card class="gap-3 py-5">
    <CardHeader class="px-5">
      <CardTitle class="flex items-center gap-2"
        ><ShieldCheck class="size-4" />Storage & privacy</CardTitle
      >
    </CardHeader>
    <CardContent class="text-muted-foreground flex flex-col gap-2 px-5 text-xs leading-5">
      <p>
        Records live in this browser on this origin. Browser cleanup, private browsing, device loss,
        or changing the app's address can make them unavailable. Export regularly, especially before
        moving to the hosted app. This version does not promise an offline app shell.
      </p>
      <p>
        The app has no analytics, account service, or server-side logging. No personal training data
        is sent to GitHub.
      </p>
      <details>
        <summary class="text-foreground py-2 font-semibold">Body-map attribution</summary>
        <p>
          Adapted from react-body-highlighter by GV79, MIT licensed. Pinned revision:
          28035c2c11d49038026e5c7e038c623f331edb60. Colours and rendering modified; broad regions
          only.
        </p>
        <a class="text-primary underline underline-offset-4" :href="`${base}muscles/LICENSE.txt`"
          >Read the MIT licence</a
        >
      </details>
    </CardContent>
  </Card>
</template>
