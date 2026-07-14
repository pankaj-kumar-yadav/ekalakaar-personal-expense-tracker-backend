import { Router } from "express";

import { ApiMount } from "../constants/http.js";
import dashboardRoutes from "./dashboardRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.get(ApiMount.HEALTH, (_req, res) => {
  res.json({ status: "ok", message: "Ekalakaar API is running" });
});

router.use(ApiMount.USERS, userRoutes);
router.use(ApiMount.EXPENSES, expenseRoutes);
router.use(ApiMount.DASHBOARD, dashboardRoutes);

export default router;
