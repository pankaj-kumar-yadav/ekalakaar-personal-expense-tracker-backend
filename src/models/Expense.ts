import { type Document, model, type Model, Schema, type Types } from "mongoose";

import { EXPENSE, ExpenseCategory } from "../constants/expense.js";

export interface ExpenseDoc extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  description: string;
  category: ExpenseCategory | string;
  date: Date;
}

const expenseSchema = new Schema<ExpenseDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: EXPENSE.USER_REF,
    },
    amount: {
      type: Number,
      required: true,
      min: EXPENSE.MIN_AMOUNT,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(ExpenseCategory),
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Expense: Model<ExpenseDoc> = model<ExpenseDoc>(
  EXPENSE.MODEL_NAME,
  expenseSchema,
  EXPENSE.COLLECTION,
);

export default Expense;
