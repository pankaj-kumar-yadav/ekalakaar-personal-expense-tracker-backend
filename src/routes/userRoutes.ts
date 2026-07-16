import { Router } from "express";

import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js";
import { ValidationSource, validateRequest } from "../helpers/validator.js";
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

export default router;
