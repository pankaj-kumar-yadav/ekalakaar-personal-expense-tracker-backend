import { Router } from "express";

import {
  getDashboardActivity,
  getDashboardChart,
  getDashboardMetrics,
} from "../controllers/dashboardController.js";
import { ValidationSource, validateRequest } from "../helpers/validator.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  activityQuerySchema,
  periodQuerySchema,
} from "../schemas/dashboardSchema.js";

const router = Router();

router.use(protect);

router.get(
  "/metrics",
  validateRequest(periodQuerySchema, ValidationSource.QUERY),
  getDashboardMetrics,
);
router.get(
  "/chart",
  validateRequest(periodQuerySchema, ValidationSource.QUERY),
  getDashboardChart,
);
router.get(
  "/activity",
  validateRequest(activityQuerySchema, ValidationSource.QUERY),
  getDashboardActivity,
);

export default router;
