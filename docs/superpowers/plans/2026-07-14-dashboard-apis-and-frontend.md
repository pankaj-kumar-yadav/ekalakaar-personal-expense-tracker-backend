# Dashboard APIs + Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authenticated `GET /api/dashboard/{metrics,chart,activity}` endpoints in the backend, then wire the Next.js dashboard page to consume them (table still uses `GET /api/expenses`).

**Architecture:** Backend shares Sunday-based period helpers and Mongo aggregates for KPIs/chart; activity uses a filtered `find`. Frontend adds typed API clients and replaces client-side `buildDashboardStats` usage on the dashboard page; `ActivityFeed` fetches its own activity data by tab/search.

**Tech Stack:** Express + Mongoose + Zod (backend); Next.js + axios + existing dashboard components (frontend). No new dependencies. Neither repo has a unit-test runner — verify with `pnpm typecheck` and manual curl / UI checks.

**Repos:**
- Backend: `c:/Users/panka/OneDrive/Desktop/pankaj/coding-project/personal/own/live/ekalakaar-personal-expense-tracker/backend`
- Frontend: `c:/Users/panka/OneDrive/Desktop/pankaj/coding-project/personal/own/live/ekalakaar-personal-expense-tracker/frontend`

**Spec:** `backend/docs/superpowers/specs/2026-07-14-dashboard-apis-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `backend/src/helpers/periodRange.ts` | `this-week` / `last-week` ranges + prior week + `%` change |
| `backend/src/schemas/dashboardSchema.ts` | Zod query schemas |
| `backend/src/controllers/dashboardController.ts` | metrics, chart, activity handlers |
| `backend/src/routes/dashboardRoutes.ts` | Route mounting + protect + validation |
| `backend/src/routes/index.ts` | Mount `/dashboard` |
| `frontend/lib/types.ts` | Dashboard response types |
| `frontend/lib/api.ts` | `getDashboardMetrics`, `getDashboardChart`, `getDashboardActivity` |
| `frontend/app/(protected)/dashboard/page.tsx` | Load metrics + chart + expenses from APIs |
| `frontend/components/dashboard/activity-feed.tsx` | Load activity from API by tab + `q` |

---

### Task 1: Backend period helpers

**Files:**
- Create: `backend/src/helpers/periodRange.ts`

- [ ] **Step 1: Create `periodRange.ts`**

```ts
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
```

- [ ] **Step 2: Typecheck**

Run (backend): `pnpm typecheck`  
Expected: PASS (no errors from new file; `tsc` includes it once imported — if unused, either export is enough if `include` covers `src/**`, verify project includes all src files).

- [ ] **Step 3: Commit (backend)**

```bash
git add src/helpers/periodRange.ts
git commit -m "feat(dashboard): add period range helpers"
```

---

### Task 2: Dashboard schemas + routes + controller

**Files:**
- Create: `backend/src/schemas/dashboardSchema.ts`
- Create: `backend/src/controllers/dashboardController.ts`
- Create: `backend/src/routes/dashboardRoutes.ts`
- Modify: `backend/src/routes/index.ts`

- [ ] **Step 1: Create schemas**

```ts
import { z } from "zod";

export const periodQuerySchema = z.object({
  period: z.enum(["this-week", "last-week"]).default("this-week"),
});

export const activityQuerySchema = z.object({
  range: z.enum(["today", "yesterday", "week"]).default("week"),
  q: z.string().optional().default(""),
});
```

- [ ] **Step 2: Create controller**

Implement three handlers in `dashboardController.ts`:

1. `getDashboardMetrics` — `getPeriodRange(period)`, aggregate expenses for current + previous ranges by day (`$match` user + date, `$group` by day), build KPI objects matching the spec (`Total Spent`, `Expenses Logged`, `Avg. Expense` with `value` strings, `change`, `sparkline`).
2. `getDashboardChart` — same daily buckets; return `{ period, total, change, days: [{ label, fullLabel, date, amount }] }`.
3. `getDashboardActivity` — `getActivityCreatedAtRange(range)`, `Expense.find({ user, createdAt: { $gte, $lte }, ...(q trim ? $or regex on description/category : {}) }).sort({ createdAt: -1 }).limit(8).select("-user")`.

Use `asyncHandler`, `ProtectedRequest`, response shape `{ success: true, data: ... }` (activity also `count`).

Daily aggregation sketch:

```ts
const buckets = await Expense.aggregate([
  {
    $match: {
      user: req.user!._id,
      date: { $gte: range.start, $lte: range.end },
    },
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$date" },
      },
      amount: { $sum: "$amount" },
      count: { $sum: 1 },
    },
  },
]);
```

Map `eachDayOfRange` → fill missing days with 0; look up bucket by `YYYY-MM-DD` local key (`${y}-${m}-${d}` padded).

- [ ] **Step 3: Create routes and mount**

`dashboardRoutes.ts`:

```ts
import { Router } from "express";

import {
  getDashboardActivity,
  getDashboardChart,
  getDashboardMetrics,
} from "../controllers/dashboardController.js";
import { ValidationSource, validateRequest } from "../helpers/validator.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  activityQuerySchema,
  periodQuerySchema,
} from "../schemas/dashboardSchema.js";

const router = Router();
router.use(protect);

router.get(
  "/metrics",
  validateRequest(periodQuerySchema, ValidationSource.QUERY),
  getDashboardMetrics,
);
router.get(
  "/chart",
  validateRequest(periodQuerySchema, ValidationSource.QUERY),
  getDashboardChart,
);
router.get(
  "/activity",
  validateRequest(activityQuerySchema, ValidationSource.QUERY),
  getDashboardActivity,
);

export default router;
```

In `routes/index.ts` add:

```ts
import dashboardRoutes from "./dashboardRoutes.js";
// ...
router.use("/dashboard", dashboardRoutes);
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`  
Expected: PASS

- [ ] **Step 5: Manual smoke (optional if server + DB + cookie available)**

```bash
# after login cookie jar
curl -s -b cookies.txt "http://localhost:8080/api/dashboard/metrics?period=this-week"
curl -s -b cookies.txt "http://localhost:8080/api/dashboard/chart?period=last-week"
curl -s -b cookies.txt "http://localhost:8080/api/dashboard/activity?range=week"
```

Expected: JSON with `success: true` and shapes from the spec (zeros / `[]` if empty).

- [ ] **Step 6: Commit (backend)**

```bash
git add src/schemas/dashboardSchema.ts src/controllers/dashboardController.ts src/routes/dashboardRoutes.ts src/routes/index.ts
git commit -m "feat(dashboard): add metrics, chart, and activity APIs"
```

---

### Task 3: Frontend API client + types

**Files:**
- Modify: `frontend/lib/types.ts`
- Modify: `frontend/lib/api.ts`

- [ ] **Step 1: Add types to `lib/types.ts`**

```ts
export type PeriodKey = "this-week" | "last-week"
export type ActivityRangeKey = "today" | "yesterday" | "week"

export type DashboardKpi = {
  label: string
  value: string
  change: number
  sparkline: number[]
}

export type DashboardMetrics = {
  period: PeriodKey
  range: { start: string; end: string }
  kpis: DashboardKpi[]
}

export type DashboardChartDay = {
  label: string
  fullLabel: string
  date: string
  amount: number
}

export type DashboardChart = {
  period: PeriodKey
  total: number
  change: number
  days: DashboardChartDay[]
}
```

- [ ] **Step 2: Add API functions to `lib/api.ts`**

```ts
export async function getDashboardMetrics(
  period: PeriodKey = "this-week"
): Promise<DashboardMetrics> {
  try {
    const { data } = await api.get<ApiSuccessResponse<DashboardMetrics>>(
      "/api/dashboard/metrics",
      { params: { period } }
    )
    return data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getDashboardChart(
  period: PeriodKey = "this-week"
): Promise<DashboardChart> {
  try {
    const { data } = await api.get<ApiSuccessResponse<DashboardChart>>(
      "/api/dashboard/chart",
      { params: { period } }
    )
    return data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getDashboardActivity(params?: {
  range?: ActivityRangeKey
  q?: string
}): Promise<Expense[]> {
  try {
    const { data } = await api.get<ApiListResponse<Expense>>(
      "/api/dashboard/activity",
      { params: { range: params?.range ?? "week", q: params?.q ?? "" } }
    )
    return data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
```

Import the new types at the top of `api.ts`.

- [ ] **Step 3: Typecheck (frontend)**

Run: `pnpm typecheck`  
Expected: PASS

- [ ] **Step 4: Commit (frontend)**

```bash
git add lib/types.ts lib/api.ts
git commit -m "feat(api): add dashboard metrics, chart, activity clients"
```

---

### Task 4: Wire dashboard page to metrics + chart APIs

**Files:**
- Modify: `frontend/app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Replace client aggregates with API loads**

Keep period dropdown and expenses list for the monitoring table.

State shape:

```ts
const [period, setPeriod] = useState<PeriodKey>("this-week")
const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
const [chart, setChart] = useState<DashboardChart | null>(null)
const [expenses, setExpenses] = useState<Expense[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

`loadDashboard`:

```ts
const loadDashboard = useCallback(async () => {
  setIsLoading(true)
  setError(null)
  try {
    const [metricsData, chartData, expenseData] = await Promise.all([
      getDashboardMetrics(period),
      getDashboardChart(period),
      getExpenses(),
    ])
    setMetrics(metricsData)
    setChart(chartData)
    setExpenses(expenseData)
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load dashboard.")
  } finally {
    setIsLoading(false)
  }
}, [period])
```

`useEffect(() => { void loadDashboard() }, [loadDashboard])`

Render:

- `metrics?.kpis` → `KpiCard` list (fallback empty array while loading with `isLoading`)
- `SpendingChart` gets `total={chart?.total ?? 0}`, `change={chart?.change ?? 0}`, `days={chart?.days ?? []}`
- Remove imports of `buildDashboardStats`, `percentChange`, `sumAmount` from this page
- Pass only `isLoading` to `ActivityFeed` (or no expenses prop — Task 5 changes it)

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`  
Expected: PASS (may fail until Task 5 updates `ActivityFeed` props — if so, complete Task 5 before committing Task 4, or temporarily keep `expenses={[]}`).

- [ ] **Step 3: Commit (frontend)** — after ActivityFeed compiles (see Task 5). Prefer single commit with Task 5 if coupled.

---

### Task 5: ActivityFeed uses activity API

**Files:**
- Modify: `frontend/components/dashboard/activity-feed.tsx`
- Modify: `frontend/app/(protected)/dashboard/page.tsx` (prop cleanup)

- [ ] **Step 1: Make ActivityFeed self-fetching**

Change props to:

```ts
type ActivityFeedProps = {
  // no expenses prop
}
```

Inside component:

```ts
const [tab, setTab] = useState<ActivityRangeKey>("week")
const [query, setQuery] = useState("")
const [expenses, setExpenses] = useState<Expense[]>([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  let cancelled = false
  setIsLoading(true)
  void getDashboardActivity({ range: tab, q: query })
    .then((data) => {
      if (!cancelled) setExpenses(data)
    })
    .catch(() => {
      if (!cancelled) setExpenses([])
    })
    .finally(() => {
      if (!cancelled) setIsLoading(false)
    })
  return () => {
    cancelled = true
  }
}, [tab, query])
```

Remove the client-side date/tab filter `useMemo` — API already filters. Keep search box: either debounce later or refetch on every `query` change (acceptable for this scale). Map tabs `today|yesterday|week` to API `range`. Drop `.slice(0, 6)` or keep UI cap at 6 of the 8 returned.

- [ ] **Step 2: Update dashboard page**

```tsx
<ActivityFeed />
```

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm typecheck`  
Expected: PASS

- [ ] **Step 4: Commit (frontend)**

```bash
git add app/(protected)/dashboard/page.tsx components/dashboard/activity-feed.tsx lib/types.ts lib/api.ts
git commit -m "feat(dashboard): load overview from dashboard APIs"
```

---

### Task 6: Verify end-to-end

- [ ] **Step 1: Backend running** on `NEXT_PUBLIC_API_URL` (default `http://localhost:5000` in frontend — align with backend `8080` via `.env` if needed).

- [ ] **Step 2: Open `/dashboard`**, toggle This week / Last week — KPIs and chart update without console errors.

- [ ] **Step 3: Activity tabs + search** refetch and update list.

- [ ] **Step 4: Monitoring table** still lists/deletes via `GET/DELETE /api/expenses`.

- [ ] **Step 5: Frontend build**

Run: `pnpm build`  
Expected: success

---

## Spec coverage check

| Spec item | Task |
|---|---|
| `GET /metrics` | 2 |
| `GET /chart` | 2 |
| `GET /activity` | 2 |
| Sunday week + prior `%` | 1–2 |
| Auth protect | 2 |
| Table stays on `/expenses` | 4 |
| Frontend integration | 3–5 |
| Seed button | Out of scope (later) |

## Out of scope (still)

- Seed Data button / `POST /api/expenses/seed`
- Changing expense CRUD contracts
