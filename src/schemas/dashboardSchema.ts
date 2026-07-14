import { z } from "zod";

import {
  ActivityRange,
  DASHBOARD,
  Period,
} from "../constants/dashboard.js";

export const periodQuerySchema = z.object({
  period: z.enum(Period).default(DASHBOARD.DEFAULT_PERIOD),
});

export const activityQuerySchema = z.object({
  range: z.enum(ActivityRange).default(DASHBOARD.DEFAULT_ACTIVITY_RANGE),
  q: z.string().optional().default(""),
});
