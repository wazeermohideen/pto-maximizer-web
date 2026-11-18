export interface PlannerInput {
  startDate: string;
  endDate: string;
  ptoBudget: number;
  holidays: readonly string[];
  blockedDates: readonly string[];
}

export interface PlannedBreak {
  startDate: string;
  endDate: string;
  totalDaysOff: number;
  ptoDates: string[];
  ptoRemaining: number;
}

const millisecondsPerDay = 86_400_000;

function formatDay(day: number): string {
  return new Date(day * millisecondsPerDay).toISOString().slice(0, 10);
}

function parseDay(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError(`Expected a date in YYYY-MM-DD format: ${date}`);
  }

  const day = Date.parse(`${date}T00:00:00Z`) / millisecondsPerDay;
  if (!Number.isFinite(day) || formatDay(day) !== date) {
    throw new RangeError(`Invalid calendar date: ${date}`);
  }

  return day;
}

/** Finds the highest-ranked break inside the inclusive date range. */
export function planBestBreak(input: PlannerInput): PlannedBreak | null {
  const firstDay = parseDay(input.startDate);
  const lastDay = parseDay(input.endDate);
  if (firstDay > lastDay) {
    throw new RangeError("The start date must be on or before the end date.");
  }
  if (!Number.isSafeInteger(input.ptoBudget) || input.ptoBudget < 0) {
    throw new RangeError("The PTO budget must be a nonnegative whole number.");
  }

  const holidays = new Set(input.holidays.map(parseDay));
  const blockedDates = new Set(input.blockedDates.map(parseDay));

  function requiresPto(day: number): boolean {
    const weekday = new Date(day * millisecondsPerDay).getUTCDay();
    return weekday >= 1 && weekday <= 5 && !holidays.has(day);
  }

  let windowStart = firstDay;
  let ptoUsed = 0;
  let bestStart = firstDay;
  let bestLength = 0;
  let bestPtoUsed = 0;

  for (let day = firstDay; day <= lastDay; day++) {
    if (requiresPto(day)) {
      if (blockedDates.has(day)) {
        windowStart = day + 1;
        ptoUsed = 0;
        continue;
      }
      ptoUsed++;
    }

    // Keep the longest affordable window ending on this day.
    while (ptoUsed > input.ptoBudget) {
      if (requiresPto(windowStart)) ptoUsed--;
      windowStart++;
    }

    const length = day - windowStart + 1;
    if (length > bestLength || (length === bestLength && ptoUsed < bestPtoUsed)) {
      // For equal lengths and costs, the earlier window was visited first.
      bestStart = windowStart;
      bestLength = length;
      bestPtoUsed = ptoUsed;
    }
  }

  if (bestLength === 0) return null;

  const bestEnd = bestStart + bestLength - 1;
  const ptoDates: string[] = [];
  for (let day = bestStart; day <= bestEnd; day++) {
    if (requiresPto(day)) ptoDates.push(formatDay(day));
  }

  return {
    startDate: formatDay(bestStart),
    endDate: formatDay(bestEnd),
    totalDaysOff: bestLength,
    ptoDates,
    ptoRemaining: input.ptoBudget - bestPtoUsed,
  };
}
