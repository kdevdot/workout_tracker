import type { Ref } from 'vue';
import type { AppState } from '@/domain/state';

export type UpdateState = (change: (current: AppState) => AppState) => Promise<boolean>;

/** The persistence and feedback capabilities required by feature actions. */
export interface TrainingActions {
  state: Ref<AppState>;
  update: UpdateState;
  notify: (text: string) => void;
}
