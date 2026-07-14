import { Router } from "express";

import expenseRoutes from "./expenseRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Ekalakaar API is running" });
});

router.use("/users", userRoutes);
router.use("/expenses", expenseRoutes);

export default router;
