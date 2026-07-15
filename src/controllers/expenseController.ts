import type { RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";

import { EXPENSE, ExpenseMessage } from "../constants/expense.js";
import { HttpStatus } from "../constants/http.js";
import { NotFoundError } from "../core/CustomError.js";
import {
  generateSeedExpenses,
  seedExpenseDate,
} from "../data/seedExpenses.js";
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
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const filter = { user: req.user!._id };

    const totalCount = await Expense.countDocuments(filter);
    const totalPage = totalCount === 0 ? 0 : Math.ceil(totalCount / limit);

    const expenses = await Expense.find(filter)
      .sort(EXPENSE.SORT.LIST)
      .select(EXPENSE.FIELDS.OMIT_USER)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(HttpStatus.OK).json({
      success: true,
      data: expenses,
      meta: {
        page,
        limit,
        totalCount,
        totalPage,
        hasNext: page < totalPage,
        hasPrev: page > 1 && totalCount > 0,
      },
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

/** Always inserts a generated sample set (duplicates allowed on repeat calls). */
export const seedExpenses: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const payload = generateSeedExpenses().map((item) => ({
      user: req.user!._id,
      amount: item.amount,
      description: item.description,
      category: item.category,
      date: seedExpenseDate(item.daysAgo),
    }));

    const created = await Expense.insertMany(payload);

    res.status(HttpStatus.CREATED).json({
      success: true,
      count: created.length,
      data: [],
    });
  },
);
