import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";

import { isProduction, jwtSecret } from "../config/index.js";

export const generateToken = (res: Response, userId: Types.ObjectId) => {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign({ userId: userId.toString() }, jwtSecret, {
    expiresIn: "30d",
  });

  // Cross-origin (e.g. Vercel → Render) requires SameSite=None + Secure.
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const clearToken = (res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    expires: new Date(0),
  });
};
