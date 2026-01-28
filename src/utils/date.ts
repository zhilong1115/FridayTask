export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];

  // Add days from previous month to fill the first week
  const startDow = firstDay.getDay(); // 0=Sun
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Fill remaining days to complete the grid (6 rows × 7 cols = 42)
  while (days.length < 42) {
    const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1);
    days.push(nextDate);
  }

  return days;
}

export function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}

export function getDayName(index: number): string {
  return DAY_NAMES[index];
}

export function getDayNameShort(index: number): string {
  return DAY_NAMES_SHORT[index];
}

/** Parse a cron expression and return the next N occurrences as ISO date strings */
export function getNextCronDates(cronExpr: string, count: number = 60): string[] {
  const parts = cronExpr.split(' ');
  if (parts.length < 5) return [];

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const dates: string[] = [];
  const now = new Date();

  // Simple cron parser: iterate day by day for 60 days and check if it matches
  for (let i = 0; i < 90 && dates.length < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    if (matchesCronField(d.getDate(), dayOfMonth, 1, 31) &&
        matchesCronField(d.getMonth() + 1, month, 1, 12) &&
        matchesCronField(d.getDay(), dayOfWeek, 0, 6)) {
      dates.push(formatDate(d));
    }
  }

  return dates;
}

function matchesCronField(value: number, field: string, min: number, max: number): boolean {
  if (field === '*') return true;

  // Handle comma-separated values
  const parts = field.split(',');
  for (const part of parts) {
    // Handle ranges (e.g. 1-5)
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (value >= start && value <= end) return true;
    }
    // Handle step values (e.g. */2)
    else if (part.includes('/')) {
      const [base, step] = part.split('/');
      const stepNum = Number(step);
      const baseNum = base === '*' ? min : Number(base);
      if ((value - baseNum) % stepNum === 0 && value >= baseNum) return true;
    }
    // Simple value
    else {
      if (Number(part) === value) return true;
    }
  }

  return false;
}
