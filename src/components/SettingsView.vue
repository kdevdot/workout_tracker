<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import {
  MAX_BACKUP_BYTES,
  encodeBackup,
  parseBackup,
  type AppState,
  type Backup,
} from '../domain/state';
import { localDate } from '../domain/dates';
import type { Phase } from '../domain/programme-types';

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
function save() {
  const calorieValue = String(calories.value).trim() === '' ? null : Number(calories.value);
  const proteinValue = String(protein.value).trim() === '' ? null : Number(protein.value);
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
  <h1>Your data. Your copy.</h1>
  <p class="page-description">Local-first storage, with an independent backup you control.</p>
  <section class="settings-section">
    <h2>Training & product label</h2>
    <form @submit.prevent="save">
      <label
        >Default phase for new sessions<select v-model="phase">
          <option value="intro">Introduction · 2 sets, 3 RIR</option>
          <option value="baseline">Full baseline · when ready</option>
        </select></label
      >
      <p class="fine-print">
        No automatic increase. Existing sessions retain their original prescriptions. Timed holds
        keep technical form reserve.
      </p>
      <label>Exact whey product / flavour<input v-model="name" maxlength="250" required /></label>
      <div class="two-fields">
        <label
          >kcal per serving<input
            v-model="calories"
            type="number"
            min="0"
            max="10000"
            step="any"
            inputmode="decimal"
            placeholder="Label needed" /></label
        ><label
          >Protein g per serving<input
            v-model="protein"
            type="number"
            min="0"
            max="10000"
            step="any"
            inputmode="decimal"
            placeholder="Label needed"
        /></label>
      </div>
      <p class="fine-print">
        Enter your label, not a generic brand value. Values apply to new whey entries only.
      </p>
      <button class="secondary-button" :disabled="busy">Save settings</button>
    </form>
  </section>
  <section class="settings-section">
    <h2>JSON backup</h2>
    <p>
      {{ state.sessions.length }} workout sessions · {{ state.intakes.length }} supplement entries
    </p>
    <button class="primary-button" :disabled="busy" @click="download">Download JSON backup</button>
    <p v-if="exported" class="fine-print" role="status">
      Download requested. Check your phone's Files or Downloads before relying on this copy.
    </p>
    <label class="file-label"
      >Choose a backup to restore<input
        type="file"
        accept=".json,application/json"
        :disabled="busy"
        @change="readFile"
    /></label>
    <p class="fine-print">
      Restoring replaces current records; it does not merge them. Export your current data first.
    </p>
    <div v-if="pending" class="confirmation">
      <h3>Review backup</h3>
      <p>
        {{ pending.data.sessions.length }} sessions · {{ pending.data.intakes.length }} intake
        entries
      </p>
      <p class="fine-print">Exported {{ new Date(pending.exportedAt).toLocaleString() }}</p>
      <label class="checkbox-label"
        ><input v-model="accepted" type="checkbox" />I understand this replaces my current saved
        records.</label
      ><button
        class="primary-button"
        :disabled="!accepted || busy"
        @click="emit('restore', pending.data)"
      >
        Replace with this backup</button
      ><button class="text-button" @click="pending = null">Cancel restore</button>
    </div>
  </section>
  <p v-if="error" class="error-text" role="alert">{{ error }}</p>
  <section class="settings-section">
    <h2>Google Drive</h2>
    <p>
      Not connected. Drive backup is a later milestone; no Google authorisation or cloud backup has
      happened.
    </p>
  </section>
  <section class="settings-section">
    <h2>Storage & privacy</h2>
    <p class="fine-print">
      Records live in this browser on this origin. Browser cleanup, private browsing, device loss,
      or changing the app's address can make them unavailable. Export regularly, especially before
      moving to the hosted app. This version does not promise an offline app shell.
    </p>
    <p class="fine-print">
      The app has no analytics, account service, or server-side logging. No personal training data
      is sent to GitHub.
    </p>
  </section>
  <details class="warmup">
    <summary>Body-map attribution</summary>
    <p class="fine-print">
      Adapted from react-body-highlighter by GV79, MIT licensed. Pinned revision:
      28035c2c11d49038026e5c7e038c623f331edb60. Colours and rendering modified; broad regions only.
    </p>
    <a :href="`${base}muscles/LICENSE.txt`">Read the MIT licence</a>
  </details>
</template>
