# Dashboard APIs Design

**Date:** 2026-07-14  
**Repo:** `backend`  
**Status:** Approved for planning

## Goal

Expose dedicated, authenticated dashboard endpoints so the frontend overview can load KPIs, spending chart data, and recent activity without client-side aggregation of the full expense list. The monitoring table continues to use existing `GET /api/expenses`.

Seed data for the expenses page is **out of scope** for this pass and follows later.

## Decisions

| Decision | Choice |
|---|---|
| Endpoint style | Separate routes (not one fat `/api/dashboard`) |
| Implementation | MongoDB aggregation + shared period helpers |
| Week definition | Sunday-start weeks, matching frontend `dashboard-stats.ts` |
| Auth | Existing `protect` middleware (user-scoped) |
| Table data | Keep `GET /api/expenses` |

## API surface

All routes require auth. Invalid query → `400`. Empty ranges return zeros / empty arrays.

### `GET /api/dashboard/metrics?period=this-week|last-week`

Default `period`: `this-week`.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "period": "this-week",
    "range": {
      "start": "2026-07-12T00:00:00.000Z",
      "end": "2026-07-18T23:59:59.999Z"
    },
    "kpis": [
      {
        "label": "Total Spent",
        "value": "420.00",
        "change": 12.5,
        "sparkline": [10, 40, 0, 80, 20, 0, 270]
      },
      {
        "label": "Expenses Logged",
        "value": "6",
        "change": 20,
        "sparkline": [1, 1, 0, 2, 1, 0, 1]
      },
      {
        "label": "Avg. Expense",
        "value": "70.00",
        "change": -5,
        "sparkline": [10, 40, 0, 80, 20, 0, 270]
      }
    ]
  }
}
```

- `change` is percent vs the immediate prior week window.
- `sparkline` is one number per day in the selected period (amount for total/avg; counts for expenses logged).

### `GET /api/dashboard/chart?period=this-week|last-week`

Default `period`: `this-week`.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "period": "this-week",
    "total": 420,
    "change": 12.5,
    "days": [
      {
        "label": "Sun",
        "fullLabel": "Sun",
        "date": "2026-07-12T00:00:00.000Z",
        "amount": 10
      }
    ]
  }
}
```

### `GET /api/dashboard/activity?range=today|yesterday|week&q=`

Defaults: `range=week`, `q` empty.

- Filter by `createdAt` (activity timestamp), not expense `date`.
- Optional `q`: case-insensitive match on `description` or `category`.
- Sort newest first; limit **8**.
- Omit `user` from documents.

**Response `200`:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "amount": 250,
      "description": "Lunch",
      "category": "Food",
      "date": "2026-07-14T00:00:00.000Z",
      "createdAt": "2026-07-14T10:30:00.000Z",
      "updatedAt": "2026-07-14T10:30:00.000Z"
    }
  ]
}
```

## Period math

Shared helper (`helpers/periodRange.ts`):

- `this-week`: Sunday 00:00 → Saturday end-of-day (local server time via `Date` construction; store/compare as `Date` against expense `date`).
- `last-week`: previous Sunday–Saturday.
- Prior baseline for `%`: the week immediately before the selected period.
- `% change`: `((current - previous) / previous) * 100`; if previous is `0`, return `0` when current is `0`, else `100` (match frontend).

## Backend layout

```
src/
  controllers/dashboardController.ts
  routes/dashboardRoutes.ts
  schemas/dashboardSchema.ts
  helpers/periodRange.ts
  routes/index.ts          # + router.use("/dashboard", dashboardRoutes)
```

- Zod validate query via existing `validateRequest` + `ValidationSource.QUERY`.
- Controllers use `express-async-handler`, `ProtectedRequest`, filter `{ user: req.user._id }`.
- No new dependencies.

## Aggregation strategy

1. **metrics / chart:** `$match` on `user` + `date` in range → group/sum daily buckets; compute totals, avg, counts, prior-period totals for change; fill missing days with `0`.
2. **activity:** `find` with `user`, `createdAt` window, optional `$regex` on description/category → `sort({ createdAt: -1 }).limit(8).select("-user")`.

## Error handling

| Case | Status |
|---|---|
| Invalid `period` / `range` | `400` (zod / BadRequestError) |
| Unauthenticated | Existing auth middleware behavior |
| Server / DB failure | Existing errorHandler |

## Out of scope

- Frontend wiring to these endpoints
- `POST /api/expenses/seed` and Seed Data button
- Pagination beyond activity limit
- Changing create/list/delete expense contracts

## Success criteria

- Authenticated calls to the three endpoints return shapes above for empty and non-empty data.
- Period toggle `this-week` / `last-week` changes metrics and chart consistently with Sunday week boundaries.
- Activity respects `range` and `q`.
- Expenses monitoring table still works via `GET /api/expenses` unchanged.
