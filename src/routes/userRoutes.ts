import { Router } from "express";

import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js";
import { ValidationSource, validateRequest } from "../helpers/validator.js";
import { protect } from "../middleware/authMiddleware.js";
import { userLoginSchema, userRegisterSchema } from "../schemas/userSchema.js";

const router = Router();

router.post(
  "/register",
  validateRequest(userRegisterSchema, ValidationSource.BODY),
  registerUser,
);

router.post(
  "/login",
  validateRequest(userLoginSchema, ValidationSource.BODY),
  loginUser,
);

router.post("/logout", logoutUser);

router.get("/me", protect, getMe);

export default router;
