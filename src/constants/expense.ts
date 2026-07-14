export enum ExpenseCategory {
  FOOD = "Food",
  TRANSPORT = "Transport",
  BILLS = "Bills",
  OTHER = "Other",
}

export enum ExpensePath {
  ROOT = "/",
  SEED = "/seed",
  BY_ID = "/:id",
}

export enum ExpenseMessage {
  NOT_FOUND = "Expense not found",
  DELETED = "Expense deleted successfully",
}

export enum ExpenseValidationMessage {
  AMOUNT_POSITIVE = "Amount must be greater than 0",
  DESCRIPTION_REQUIRED = "Description is required",
  CATEGORY_INVALID = "Category must be Food, Transport, Bills, or Other",
  DATE_REQUIRED = "Valid date is required",
  INVALID_ID = "Invalid expense id",
}

export const EXPENSE = {
  MIN_AMOUNT: 0.01,
  SEED_NOON_HOUR: 12,
  MODEL_NAME: "Expense",
  COLLECTION: "expenses",
  USER_REF: "User",
  FIELDS: {
    OMIT_USER: "-user",
  },
  SORT: {
    LIST: { date: -1 as const, createdAt: -1 as const },
  },
} as const;
