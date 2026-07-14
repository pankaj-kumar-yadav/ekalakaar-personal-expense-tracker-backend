import {
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";

export type PeriodKey = "this-week" | "last-week";

export type DateRange = {
  start: Date;
  end: Date;
};

const SUNDAY_WEEK = { weekStartsOn: 0 as const };

/** Sunday-start week containing `now`. */
export function weekBounds(now: Date): DateRange {
  return {
    start: startOfWeek(now, SUNDAY_WEEK),
    end: endOfWeek(now, SUNDAY_WEEK),
  };
}

export function getPeriodRange(
  period: PeriodKey,
  now = new Date(),
): DateRange & { previous: DateRange } {
  const weeksBack = period === "this-week" ? 0 : 1;
  const current = weekBounds(subWeeks(now, weeksBack));
  const previous = weekBounds(subWeeks(now, weeksBack + 1));
  return { ...current, previous };
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

export function eachDayOfRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function dayLabel(d: Date): string {
  return format(d, "EEE");
}

export type ActivityRangeKey = "today" | "yesterday" | "week";

export function getActivityCreatedAtRange(
  range: ActivityRangeKey,
  now = new Date(),
): DateRange {
  if (range === "today") {
    return { start: startOfDay(now), end: endOfDay(now) };
  }
  if (range === "yesterday") {
    const yesterday = subDays(now, 1);
    return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
  }
  return { start: subDays(startOfDay(now), 7), end: endOfDay(now) };
}
