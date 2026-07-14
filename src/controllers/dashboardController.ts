import type { RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";
import type { Types } from "mongoose";

import {
  dayLabel,
  eachDayOfRange,
  getActivityCreatedAtRange,
  getPeriodRange,
  percentChange,
  type PeriodKey,
} from "../helpers/periodRange.js";
import Expense from "../models/Expense.js";
import type { ProtectedRequest } from "../types/express.js";

type DailyBucket = {
  amount: number;
  count: number;
  date: Date;
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getDailyBuckets(
  user: Types.ObjectId,
  range: { start: Date; end: Date },
): Promise<DailyBucket[]> {
  const expenses = await Expense.find({
    user,
    date: { $gte: range.start, $lte: range.end },
  }).select("amount date");

  const totals = new Map<string, { amount: number; count: number }>();
  for (const expense of expenses) {
    const key = localDateKey(expense.date);
    const total = totals.get(key) ?? { amount: 0, count: 0 };
    total.amount += expense.amount;
    total.count += 1;
    totals.set(key, total);
  }

  return eachDayOfRange(range.start, range.end).map((date) => {
    const total = totals.get(localDateKey(date)) ?? { amount: 0, count: 0 };
    return { ...total, date };
  });
}

export const getDashboardMetrics: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const period = req.query.period as PeriodKey;
    const range = getPeriodRange(period);
    const [current, previous] = await Promise.all([
      getDailyBuckets(req.user!._id, range),
      getDailyBuckets(req.user!._id, range.previous),
    ]);

    const currentTotal = current.reduce((sum, day) => sum + day.amount, 0);
    const previousTotal = previous.reduce((sum, day) => sum + day.amount, 0);
    const currentCount = current.reduce((sum, day) => sum + day.count, 0);
    const previousCount = previous.reduce((sum, day) => sum + day.count, 0);
    const currentAverage = currentCount === 0 ? 0 : currentTotal / currentCount;
    const previousAverage =
      previousCount === 0 ? 0 : previousTotal / previousCount;

    res.status(200).json({
      success: true,
      data: {
        period,
        range: { start: range.start.toISOString(), end: range.end.toISOString() },
        kpis: [
          {
            label: "Total Spent",
            value: currentTotal.toFixed(2),
            change: percentChange(currentTotal, previousTotal),
            sparkline: current.map((day) => day.amount),
          },
          {
            label: "Expenses Logged",
            value: String(currentCount),
            change: percentChange(currentCount, previousCount),
            sparkline: current.map((day) => day.count),
          },
          {
            label: "Avg. Expense",
            value: currentAverage.toFixed(2),
            change: percentChange(currentAverage, previousAverage),
            sparkline: current.map((day) => day.amount),
          },
        ],
      },
    });
  },
);

export const getDashboardChart: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const period = req.query.period as PeriodKey;
    const range = getPeriodRange(period);
    const [current, previous] = await Promise.all([
      getDailyBuckets(req.user!._id, range),
      getDailyBuckets(req.user!._id, range.previous),
    ]);
    const total = current.reduce((sum, day) => sum + day.amount, 0);
    const previousTotal = previous.reduce((sum, day) => sum + day.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        period,
        total,
        change: percentChange(total, previousTotal),
        days: current.map((day) => ({
          label: dayLabel(day.date),
          fullLabel: dayLabel(day.date),
          date: day.date.toISOString(),
          amount: day.amount,
        })),
      },
    });
  },
);

export const getDashboardActivity: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const range = getActivityCreatedAtRange(
      req.query.range as "today" | "yesterday" | "week",
    );
    const q = (req.query.q as string).trim();
    const filter = {
      user: req.user!._id,
      createdAt: { $gte: range.start, $lte: range.end },
      ...(q
        ? {
            $or: [
              { description: { $regex: q, $options: "i" } },
              { category: { $regex: q, $options: "i" } },
            ],
          }
        : {}),
    };
    const activity = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .limit(8)
      .select("-user");

    res.status(200).json({
      success: true,
      count: activity.length,
      data: activity,
    });
  },
);
