import type { RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  EXPENSE,
  ExpenseCategory,
  ExpenseMessage,
} from "../constants/expense.js";
import { HttpStatus } from "../constants/http.js";
import { NotFoundError } from "../core/CustomError.js";
import Expense from "../models/Expense.js";
import type { ProtectedRequest } from "../types/express.js";

export const createExpense: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { amount, description, category, date } = req.body;

    const expense = await Expense.create({
      user: req.user!._id,
      amount,
      description,
      category,
      date,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: expense,
    });
  },
);

export const getExpenses: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const expenses = await Expense.find({ user: req.user!._id })
      .sort(EXPENSE.SORT.LIST)
      .select(EXPENSE.FIELDS.OMIT_USER);

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(HttpStatus.OK).json({
      success: true,
      count: expenses.length,
      totalAmount,
      data: expenses,
    });
  },
);

export const deleteExpense: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });

    if (!expense) {
      throw new NotFoundError(ExpenseMessage.NOT_FOUND);
    }

    await expense.deleteOne();

    res.status(HttpStatus.OK).json({
      success: true,
      message: ExpenseMessage.DELETED,
      data: {
        _id: expense._id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expense.date,
      },
    });
  },
);

function daysAgo(days: number): Date {
  const date = new Date();
  date.setHours(EXPENSE.SEED_NOON_HOUR, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

const SEED_EXPENSES = [
  {
    amount: 250,
    description: "Lunch at cafe",
    category: ExpenseCategory.FOOD,
    daysAgo: 0,
  },
  {
    amount: 80,
    description: "Metro card top-up",
    category: ExpenseCategory.TRANSPORT,
    daysAgo: 1,
  },
  {
    amount: 1200,
    description: "Electricity bill",
    category: ExpenseCategory.BILLS,
    daysAgo: 2,
  },
  {
    amount: 450,
    description: "Groceries",
    category: ExpenseCategory.FOOD,
    daysAgo: 3,
  },
  {
    amount: 180,
    description: "Auto to office",
    category: ExpenseCategory.TRANSPORT,
    daysAgo: 4,
  },
  {
    amount: 99,
    description: "Cloud subscription",
    category: ExpenseCategory.OTHER,
    daysAgo: 5,
  },
  {
    amount: 320,
    description: "Dinner with friends",
    category: ExpenseCategory.FOOD,
    daysAgo: 6,
  },
  {
    amount: 60,
    description: "Parking fee",
    category: ExpenseCategory.TRANSPORT,
    daysAgo: 0,
  },
] as const;

/** Always inserts the fixed sample set (duplicates allowed on repeat calls). */
export const seedExpenses: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const payload = SEED_EXPENSES.map((item) => ({
      user: req.user!._id,
      amount: item.amount,
      description: item.description,
      category: item.category,
      date: daysAgo(item.daysAgo),
    }));

    const created = await Expense.insertMany(payload);
    const data = created.map((expense) => {
      const { user: _user, ...rest } = expense.toObject();
      return rest;
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      count: data.length,
      data,
    });
  },
);
