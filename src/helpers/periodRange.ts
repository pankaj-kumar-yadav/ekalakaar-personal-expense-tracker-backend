export type PeriodKey = "this-week" | "last-week";

export type DateRange = {
  start: Date;
  end: Date;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** Sunday-start week containing `now`. */
export function weekBounds(now: Date): DateRange {
  const day = now.getDay(); // 0 = Sunday
  const start = startOfDay(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - day),
  );
  const end = endOfDay(
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6),
  );
  return { start, end };
}

export function getPeriodRange(
  period: PeriodKey,
  now = new Date(),
): DateRange & { previous: DateRange } {
  const thisWeek = weekBounds(now);
  if (period === "this-week") {
    const prevStart = startOfDay(
      new Date(
        thisWeek.start.getFullYear(),
        thisWeek.start.getMonth(),
        thisWeek.start.getDate() - 7,
      ),
    );
    const prevEnd = endOfDay(
      new Date(
        prevStart.getFullYear(),
        prevStart.getMonth(),
        prevStart.getDate() + 6,
      ),
    );
    return { ...thisWeek, previous: { start: prevStart, end: prevEnd } };
  }

  const lastStart = startOfDay(
    new Date(
      thisWeek.start.getFullYear(),
      thisWeek.start.getMonth(),
      thisWeek.start.getDate() - 7,
    ),
  );
  const lastEnd = endOfDay(
    new Date(
      lastStart.getFullYear(),
      lastStart.getMonth(),
      lastStart.getDate() + 6,
    ),
  );
  const prevStart = startOfDay(
    new Date(
      lastStart.getFullYear(),
      lastStart.getMonth(),
      lastStart.getDate() - 7,
    ),
  );
  const prevEnd = endOfDay(
    new Date(
      prevStart.getFullYear(),
      prevStart.getMonth(),
      prevStart.getDate() + 6,
    ),
  );
  return {
    start: lastStart,
    end: lastEnd,
    previous: { start: prevStart, end: prevEnd },
  };
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function eachDayOfRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate() + 1,
    );
  }
  return days;
}

export function dayLabel(d: Date): string {
  return DAY_LABELS[d.getDay()];
}

export type ActivityRangeKey = "today" | "yesterday" | "week";

export function getActivityCreatedAtRange(
  range: ActivityRangeKey,
  now = new Date(),
): DateRange {
  const todayStart = startOfDay(now);
  if (range === "today") {
    return { start: todayStart, end: endOfDay(now) };
  }
  if (range === "yesterday") {
    const y = new Date(
      todayStart.getFullYear(),
      todayStart.getMonth(),
      todayStart.getDate() - 1,
    );
    return { start: startOfDay(y), end: endOfDay(y) };
  }
  const weekAgo = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() - 7,
  );
  return { start: weekAgo, end: endOfDay(now) };
}
