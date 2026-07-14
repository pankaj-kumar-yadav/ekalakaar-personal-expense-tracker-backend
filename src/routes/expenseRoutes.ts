import { Router } from "express";

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
} from "../schemas/expenseSchema.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  validateRequest(createExpenseSchema, ValidationSource.BODY),
  createExpense,
);

router.post("/seed", seedExpenses);

router.get("/", getExpenses);

router.delete(
  "/:id",
  validateRequest(expenseIdSchema, ValidationSource.PARAMS),
  deleteExpense,
);

export default router;
