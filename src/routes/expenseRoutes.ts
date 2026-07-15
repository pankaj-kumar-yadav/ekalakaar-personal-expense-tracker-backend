import { Router } from "express";

import { ExpensePath } from "../constants/expense.js";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  seedExpenses,
} from "../controllers/expenseController.js";
import { ValidationSource, validateRequest } from "../helpers/validator.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createExpenseSchema,
  expenseIdSchema,
  expenseListQuerySchema,
} from "../schemas/expenseSchema.js";

const router = Router();

router.use(protect);

router.post(
  ExpensePath.ROOT,
  validateRequest(createExpenseSchema, ValidationSource.BODY),
  createExpense,
);

router.post(ExpensePath.SEED, seedExpenses);

router.get(
  ExpensePath.ROOT,
  validateRequest(expenseListQuerySchema, ValidationSource.QUERY),
  getExpenses,
);

router.delete(
  ExpensePath.BY_ID,
  validateRequest(expenseIdSchema, ValidationSource.PARAMS),
  deleteExpense,
);

export default router;
