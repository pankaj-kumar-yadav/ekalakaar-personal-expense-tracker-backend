import { type Document, model, type Model, Schema, type Types } from "mongoose";

export interface ExpenseDoc extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  description: string;
  category: string;
  date: Date;
}

const expenseSchema = new Schema<ExpenseDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
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
  "Expense",
  expenseSchema,
  "expenses",
);

export default Expense;
