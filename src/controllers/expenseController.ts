import type { RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";

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

    res.status(201).json({
      success: true,
      data: expense,
    });
  },
);

export const getExpenses: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const expenses = await Expense.find({ user: req.user!._id })
      .sort({ date: -1, createdAt: -1 })
      .select("-user");

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(200).json({
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
      throw new NotFoundError("Expense not found");
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
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
