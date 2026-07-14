export enum Period {
  THIS_WEEK = "this-week",
  LAST_WEEK = "last-week",
}

export enum ActivityRange {
  TODAY = "today",
  YESTERDAY = "yesterday",
  WEEK = "week",
}

export enum DashboardPath {
  METRICS = "/metrics",
  CHART = "/chart",
  ACTIVITY = "/activity",
}

export enum DashboardQueryKey {
  PERIOD = "period",
  RANGE = "range",
  Q = "q",
}

export const DASHBOARD = {
  DEFAULT_PERIOD: Period.THIS_WEEK,
  DEFAULT_ACTIVITY_RANGE: ActivityRange.WEEK,
  ACTIVITY_LIMIT: 8,
  ACTIVITY_LOOKBACK_DAYS: 7,
  WEEK_STARTS_ON: 0 as const,
  PERCENT_CHANGE_FROM_ZERO: 100,
  DATE_FORMAT: {
    LOCAL_KEY: "yyyy-MM-dd",
    DAY_LABEL: "EEE",
  },
  KPI_LABELS: {
    TOTAL_SPENT: "Total Spent",
    EXPENSES_LOGGED: "Expenses Logged",
    AVG_EXPENSE: "Avg. Expense",
  },
  FIELDS: {
    AMOUNT_DATE: "amount date",
    OMIT_USER: "-user",
  },
  SORT: {
    ACTIVITY: { createdAt: -1 as const },
  },
  REGEX_OPTIONS: "i",
} as const;
