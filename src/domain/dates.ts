export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
}

export function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

/** The first day of an adjacent month, without end-of-month overflow. */
export function shiftMonth(value: string, months: number): string {
  const date = new Date(`${value.slice(0, 7)}-01T12:00:00`);
  date.setMonth(date.getMonth() + months);
  return localDate(date);
}

export function weekFor(value: string): string[] {
  const weekday = new Date(`${value}T12:00:00`).getDay();
  const monday = shiftDate(value, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => shiftDate(monday, index));
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(`${value}T12:00:00`));
}
