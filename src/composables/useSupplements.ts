import { computed, type Ref } from 'vue';
import { localDate } from '@/domain/dates';
import { CREATINE, intakeSchema } from '@/domain/state';
import type { TrainingActions } from './training-types';

/** Supplement recording and label calculations, shared by training and rest days. */
export function useSupplements({
  state,
  date,
  update,
  notify,
}: TrainingActions & { date: Ref<string> }) {
  const hasLabel = computed(
    () => state.value.settings.whey.calories !== null && state.value.settings.whey.protein !== null,
  );
  async function addIntake(kind: 'whey' | 'creatine', amount: number) {
    if (date.value > localDate()) return;
    const whey = state.value.settings.whey;
    const input = {
      id: crypto.randomUUID(),
      date: date.value,
      kind,
      amount,
      product: kind === 'whey' ? whey.name : CREATINE,
      calories: kind === 'whey' && whey.calories !== null ? whey.calories * amount : null,
      protein: kind === 'whey' && whey.protein !== null ? whey.protein * amount : null,
      recordedAt: new Date().toISOString(),
    };
    if (
      await update((current) => ({
        ...current,
        intakes: [...current.intakes, intakeSchema.parse(input)],
      }))
    )
      notify('Intake saved on this device.');
  }
  function removeIntake(id: string) {
    return update((current) => ({
      ...current,
      intakes: current.intakes.filter((entry) => entry.id !== id),
    }));
  }
  return { hasLabel, addIntake, removeIntake };
}
