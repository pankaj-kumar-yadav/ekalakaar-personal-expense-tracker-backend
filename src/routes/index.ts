import { Router } from "express";

import userRoutes from "./userRoutes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Ekalakaar API is running" });
});

router.use("/users", userRoutes);

export default router;
