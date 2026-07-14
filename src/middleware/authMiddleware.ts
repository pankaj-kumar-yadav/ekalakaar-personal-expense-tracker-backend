import type { NextFunction, RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import { jwtSecret } from "../config/index.js";
import { TokenExpiredError, UnauthorizedError } from "../core/CustomError.js";
import User from "../models/User.js";
import type { ProtectedRequest } from "../types/express.js";

export const protect: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, _res: Response, next: NextFunction) => {
    const token = req.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedError("Not authorized, no token");
    }

    if (!jwtSecret) {
      throw new UnauthorizedError("JWT secret is not configured");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        throw new UnauthorizedError("Not authorized, user not found");
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === "TokenExpiredError"
      ) {
        throw new TokenExpiredError();
      }

      throw new UnauthorizedError("Not authorized, token failed");
    }
  },
);
