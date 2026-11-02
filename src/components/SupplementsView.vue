<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import type { Intake } from '../domain/state';
import { formatDate, localDate } from '../domain/dates';

const props = defineProps<{ date: string; intakes: Intake[]; busy: boolean; hasLabel: boolean }>();
const emit = defineEmits<{
  date: [date: string];
  add: [kind: 'whey' | 'creatine', amount: number];
  remove: [id: string];
  settings: [];
}>();
const whey = shallowRef('1');
const creatine = shallowRef('5');
const error = shallowRef('');
const todays = computed(() => props.intakes.filter((entry) => entry.date === props.date));
const wheyEntries = computed(() => todays.value.filter((entry) => entry.kind === 'whey'));
const labelMissing = computed(() =>
  wheyEntries.value.some((entry) => entry.calories === null || entry.protein === null),
);
const calories = computed(() =>
  wheyEntries.value.reduce((sum, entry) => sum + (entry.calories ?? 0), 0),
);
const protein = computed(() =>
  wheyEntries.value.reduce((sum, entry) => sum + (entry.protein ?? 0), 0),
);
function add(kind: 'whey' | 'creatine') {
  const amount = Number(kind === 'whey' ? whey.value : creatine.value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100) {
    error.value = 'Enter an amount greater than zero and no more than 100.';
    return;
  }
  error.value = '';
  emit('add', kind, amount);
}
function remove(id: string) {
  if (window.confirm('Remove this intake entry?')) emit('remove', id);
}
</script>

<template>
  <h1>Daily supplements</h1>
  <p class="page-description">Whey and creatine, on training and rest days. No food diary.</p>
  <label
    >Intake date<input
      type="date"
      :value="date"
      :max="localDate()"
      @change="emit('date', ($event.target as HTMLInputElement).value)"
  /></label>
  <p class="muted">{{ formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
  <section class="supplement-section">
    <h2>Optimum Nutrition whey</h2>
    <p class="muted">Servings as defined on your exact product label.</p>
    <form @submit.prevent="add('whey')">
      <label
        >Servings consumed<input
          v-model="whey"
          type="number"
          min="0.01"
          max="100"
          step="any"
          inputmode="decimal"
          required /></label
      ><button class="primary-button" :disabled="busy || date > localDate()">Log whey</button>
    </form>
  </section>
  <section class="supplement-section">
    <h2>Optimum Nutrition creatine</h2>
    <p class="muted">
      Grams of product, not an assumed scoop size. Confirm the label's serving information.
    </p>
    <form @submit.prevent="add('creatine')">
      <label
        >Grams consumed<input
          v-model="creatine"
          type="number"
          min="0.01"
          max="100"
          step="any"
          inputmode="decimal"
          required /></label
      ><button class="secondary-button" :disabled="busy || date > localDate()">Log creatine</button>
    </form>
  </section>
  <p v-if="error" role="alert" class="error-text">{{ error }}</p>
  <section class="nutrition-summary">
    <h2>Recorded whey nutrition</h2>
    <p v-if="!wheyEntries.length">No whey entries for this date.</p>
    <template v-else
      ><p>
        {{ Math.round(calories) }} kcal · {{ Math.round(protein * 10) / 10 }} g protein{{
          labelMissing ? ' · partial totals' : ''
        }}
      </p>
      <p v-if="labelMissing" class="fine-print">
        Some entries had no configured label. Their nutrition is unknown, not zero. Updating your
        label does not rewrite historical entries.
      </p></template
    ><button v-if="!hasLabel" class="text-button" @click="emit('settings')">
      Configure your product label
    </button>
    <p class="fine-print">
      These are whey-only totals—not total daily calories or protein. Creatine is tracked in grams;
      its product nutrition is not included.
    </p>
  </section>
  <h2>Today's entries</h2>
  <p v-if="!todays.length" class="muted">Nothing recorded yet.</p>
  <ul class="intake-list">
    <li v-for="entry in todays" :key="entry.id">
      <div>
        <strong>{{ entry.amount }} {{ entry.kind === 'whey' ? 'serving(s)' : 'g' }}</strong
        ><small>{{ entry.product }}</small>
      </div>
      <button class="text-button" :disabled="busy" @click="remove(entry.id)">Remove</button>
    </li>
  </ul>
</template>
