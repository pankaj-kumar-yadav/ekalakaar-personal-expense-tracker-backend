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
  PAGE_INVALID = "Page must be an integer greater than or equal to 1",
  LIMIT_INVALID = "Limit must be an integer between 1 and 100",
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
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 100,
    MAX_LIMIT: 100,
  },
} as const;
