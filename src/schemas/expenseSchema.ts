import { Types } from "mongoose";
import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  category: z.string().trim().min(1, { message: "Category is required" }),
  date: z.coerce.date({ message: "Valid date is required" }),
});

export const expenseIdSchema = z.object({
  id: z
    .string()
    .refine((id) => Types.ObjectId.isValid(id), {
      message: "Invalid expense id",
    }),
});
