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

import { ActivityRange, DASHBOARD, Period } from "../constants/dashboard.js";

export type PeriodKey = Period;
export type ActivityRangeKey = ActivityRange;

export type DateRange = {
  start: Date;
  end: Date;
};

const SUNDAY_WEEK = { weekStartsOn: DASHBOARD.WEEK_STARTS_ON };

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
  const weeksBack = period === Period.THIS_WEEK ? 0 : 1;
  const current = weekBounds(subWeeks(now, weeksBack));
  const previous = weekBounds(subWeeks(now, weeksBack + 1));
  return { ...current, previous };
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : DASHBOARD.PERCENT_CHANGE_FROM_ZERO;
  }
  return ((current - previous) / previous) * 100;
}

export function eachDayOfRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function dayLabel(d: Date): string {
  return format(d, DASHBOARD.DATE_FORMAT.DAY_LABEL);
}

export function getActivityCreatedAtRange(
  range: ActivityRangeKey,
  now = new Date(),
): DateRange {
  if (range === ActivityRange.TODAY) {
    return { start: startOfDay(now), end: endOfDay(now) };
  }
  if (range === ActivityRange.YESTERDAY) {
    const yesterday = subDays(now, 1);
    return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
  }
  return {
    start: subDays(startOfDay(now), DASHBOARD.ACTIVITY_LOOKBACK_DAYS),
    end: endOfDay(now),
  };
}
