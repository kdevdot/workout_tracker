<script setup lang="ts">
import { shallowRef } from 'vue';
import { Download, Upload } from '@lucide/vue';
import {
  MAX_BACKUP_BYTES,
  encodeBackup,
  parseBackup,
  type AppState,
  type Backup,
} from '@/domain/state';
import { localDate } from '@/domain/dates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const props = defineProps<{ state: AppState; busy: boolean }>();
const emit = defineEmits<{ restore: [data: AppState] }>();
const error = shallowRef('');
const pending = shallowRef<Backup | null>(null);
const accepted = shallowRef(false);
const exported = shallowRef(false);

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
      <p v-if="error" class="text-destructive text-sm font-medium" role="alert">{{ error }}</p>
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
</template>
