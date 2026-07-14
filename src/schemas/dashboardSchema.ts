import { z } from "zod";

export const periodQuerySchema = z.object({
  period: z.enum(["this-week", "last-week"]).default("this-week"),
});

export const activityQuerySchema = z.object({
  range: z.enum(["today", "yesterday", "week"]).default("week"),
  q: z.string().optional().default(""),
});
