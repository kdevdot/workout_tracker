import type { MovementPrescription } from './programme-types';

/** Display text is derived from the prescription; it is never parsed for new exercises. */
export function formatPrescription(sets: number, movement: MovementPrescription): string {
  return `${sets} × ${movement.min}–${movement.max} ${movement.unit === 'seconds' ? 's' : movement.unit}${movement.perSide ? '/side' : ''}`;
}
