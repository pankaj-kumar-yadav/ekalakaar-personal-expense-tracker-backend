import { Types } from "mongoose";
import { z } from "zod";

import {
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
