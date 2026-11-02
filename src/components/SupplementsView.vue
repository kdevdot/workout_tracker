<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { Info, Trash2 } from '@lucide/vue';
import type { Intake } from '@/domain/state';
import { formatDate, localDate } from '@/domain/dates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Kind = Intake['kind'];
const props = defineProps<{ date: string; intakes: Intake[]; busy: boolean; hasLabel: boolean }>();
const emit = defineEmits<{
  date: [date: string];
  add: [kind: Kind, amount: number];
  remove: [id: string];
  settings: [];
}>();

const amounts = ref<Record<Kind, string | number>>({ whey: '1', creatine: '5' });
const error = shallowRef('');
const today = localDate();
const future = computed(() => props.date > today);
const entries = computed(() => props.intakes.filter((entry) => entry.date === props.date));
const wheyEntries = computed(() => entries.value.filter((entry) => entry.kind === 'whey'));
const labelMissing = computed(() =>
  wheyEntries.value.some((entry) => entry.calories === null || entry.protein === null),
);
const totals = computed(() =>
  wheyEntries.value.reduce(
    (sum, entry) => ({
      calories: sum.calories + (entry.calories ?? 0),
      protein: sum.protein + (entry.protein ?? 0),
    }),
    { calories: 0, protein: 0 },
  ),
);
const products = [
  {
    kind: 'whey',
    title: 'Optimum Nutrition whey',
    description: 'Servings as defined on your exact product label.',
    label: 'Servings consumed',
    action: 'Log whey',
  },
  {
    kind: 'creatine',
    title: 'Optimum Nutrition creatine',
    description:
      "Grams of product, not an assumed scoop size. Confirm the label's serving information.",
    label: 'Grams consumed',
    action: 'Log creatine',
  },
] as const;

function add(kind: Kind) {
  const amount = Number(amounts.value[kind]);
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
  <header class="flex flex-col gap-1">
    <h1 class="text-[2.1rem] leading-tight font-extrabold tracking-tight">Daily supplements</h1>
    <p class="text-muted-foreground text-sm">
      Whey and creatine, on training and rest days. No food diary.
    </p>
  </header>

  <label class="flex items-center justify-between gap-3 text-sm font-medium">
    <span class="flex flex-col">
      Intake date
      <span class="text-muted-foreground text-xs font-normal">{{
        formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })
      }}</span>
    </span>
    <input
      type="date"
      :value="date"
      :max="today"
      class="border-input bg-card focus-visible:ring-ring/50 h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
      @change="emit('date', ($event.target as HTMLInputElement).value)"
    />
  </label>

  <section class="bg-primary text-primary-foreground flex flex-col gap-1 rounded-2xl p-5">
    <h2 class="text-sm font-semibold opacity-80">Recorded whey nutrition</h2>
    <p v-if="!wheyEntries.length" class="text-lg font-bold">No whey entries for this date.</p>
    <p v-else class="flex items-baseline gap-4">
      <span
        ><strong class="text-3xl font-extrabold tabular-nums">{{
          Math.round(totals.calories)
        }}</strong>
        kcal</span
      >
      <span
        ><strong class="text-3xl font-extrabold tabular-nums">{{
          Math.round(totals.protein * 10) / 10
        }}</strong>
        g protein</span
      >
      <span v-if="labelMissing" class="text-xs opacity-80">· partial totals</span>
    </p>
    <p v-if="labelMissing" class="text-xs leading-5 opacity-80">
      Some entries had no configured label. Their nutrition is unknown, not zero. Updating your
      label does not rewrite historical entries.
    </p>
    <p class="text-xs leading-5 opacity-70">
      Whey-only totals, not total daily calories or protein. Creatine is tracked in grams; its
      product nutrition is not included.
    </p>
    <Button
      v-if="!hasLabel"
      variant="secondary"
      size="sm"
      class="mt-2 w-fit"
      @click="emit('settings')"
      ><Info />Configure your product label</Button
    >
  </section>

  <Card v-for="product in products" :key="product.kind" class="gap-4 py-5">
    <CardHeader class="px-5">
      <CardTitle>{{ product.title }}</CardTitle>
      <CardDescription>{{ product.description }}</CardDescription>
    </CardHeader>
    <CardContent class="px-5">
      <form class="flex items-end gap-2" @submit.prevent="add(product.kind)">
        <div class="flex flex-1 flex-col gap-1.5">
          <Label :for="`amount-${product.kind}`">{{ product.label }}</Label>
          <Input
            :id="`amount-${product.kind}`"
            v-model="amounts[product.kind]"
            type="number"
            min="0.01"
            max="100"
            step="any"
            inputmode="decimal"
            required
            class="h-11"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          class="h-11"
          :variant="product.kind === 'whey' ? 'default' : 'secondary'"
          :disabled="busy || future"
          >{{ product.action }}</Button
        >
      </form>
    </CardContent>
  </Card>
  <p v-if="error" role="alert" class="text-destructive text-sm font-medium">{{ error }}</p>

  <section class="flex flex-col gap-2">
    <h2 class="text-lg font-bold tracking-tight">Entries for this date</h2>
    <p v-if="!entries.length" class="text-muted-foreground text-sm">Nothing recorded yet.</p>
    <ul class="flex flex-col gap-2">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="bg-card flex items-center justify-between gap-3 rounded-xl border py-2 pr-2 pl-4"
      >
        <div class="flex flex-col">
          <strong class="text-sm"
            >{{ entry.amount }} {{ entry.kind === 'whey' ? 'serving(s)' : 'g' }}</strong
          >
          <small class="text-muted-foreground text-xs">{{ entry.product }}</small>
        </div>
        <Button
          variant="ghost"
          size="sm"
          class="text-destructive hover:text-destructive"
          :disabled="busy"
          @click="remove(entry.id)"
          ><Trash2 />Remove</Button
        >
      </li>
    </ul>
  </section>
</template>
