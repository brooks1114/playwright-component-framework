// src/utils/date-utils.ts

export type DateLike = string | number; // number = offset in days (+/-)

export function resolveDateLike(
  value: DateLike | undefined | null,
  opts: { format?: "MM/DD/YYYY" | "ISO" } = {}
): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  if (typeof value === "number") {
    const today = new Date();
    const target = addDays(today, value);
    return opts.format === "ISO" ? toISODate(target) : toMMDDYYYY(target);
  }

  return undefined;
}

function addDays(base: Date, days: number): Date {
  const copy = new Date(base.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toMMDDYYYY(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${mm}/${dd}/${yyyy}`;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
