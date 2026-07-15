import { Types } from "mongoose";
import { z } from "zod";

import {
  EXPENSE,
  ExpenseCategory,
  ExpenseValidationMessage,
} from "../constants/expense.js";

export const createExpenseSchema = z.object({
  amount: z.number().positive({
    message: ExpenseValidationMessage.AMOUNT_POSITIVE,
  }),
  description: z.string().trim().min(1, {
    message: ExpenseValidationMessage.DESCRIPTION_REQUIRED,
  }),
  category: z.enum(ExpenseCategory, {
    message: ExpenseValidationMessage.CATEGORY_INVALID,
  }),
  date: z.coerce.date({ message: ExpenseValidationMessage.DATE_REQUIRED }),
});

export const expenseIdSchema = z.object({
  id: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: ExpenseValidationMessage.INVALID_ID,
  }),
});

export const expenseListQuerySchema = z.object({
  page: z.coerce
    .number({ message: ExpenseValidationMessage.PAGE_INVALID })
    .int({ message: ExpenseValidationMessage.PAGE_INVALID })
    .min(1, { message: ExpenseValidationMessage.PAGE_INVALID })
    .default(EXPENSE.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number({ message: ExpenseValidationMessage.LIMIT_INVALID })
    .int({ message: ExpenseValidationMessage.LIMIT_INVALID })
    .min(1, { message: ExpenseValidationMessage.LIMIT_INVALID })
    .max(EXPENSE.PAGINATION.MAX_LIMIT, {
      message: ExpenseValidationMessage.LIMIT_INVALID,
    })
    .default(EXPENSE.PAGINATION.DEFAULT_LIMIT),
});
