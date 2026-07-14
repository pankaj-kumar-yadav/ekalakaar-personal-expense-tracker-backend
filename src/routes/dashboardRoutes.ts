import { Router } from "express";

import { DashboardPath } from "../constants/dashboard.js";
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
  DashboardPath.METRICS,
  validateRequest(periodQuerySchema, ValidationSource.QUERY),
  getDashboardMetrics,
);
router.get(
  DashboardPath.CHART,
  validateRequest(periodQuerySchema, ValidationSource.QUERY),
  getDashboardChart,
);
router.get(
  DashboardPath.ACTIVITY,
  validateRequest(activityQuerySchema, ValidationSource.QUERY),
  getDashboardActivity,
);

export default router;
