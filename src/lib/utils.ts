export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Monday 00:00 to Sunday 23:59:59 of the week containing `date`. */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Format a date as local YYYY-MM-DD. Never use toISOString() for this: it
 * converts to UTC, which shifts local-midnight dates back a day in timezones
 * ahead of UTC (a Monday week start would render as Sunday).
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isLate(submittedAt: Date | null, weekEndDate: Date): boolean {
  if (!submittedAt) return false;
  const deadline = new Date(weekEndDate);
  deadline.setHours(23, 59, 59, 999);
  return submittedAt.getTime() > deadline.getTime();
}
