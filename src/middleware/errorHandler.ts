import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../core/ApiError.js";
import { InternalError } from "../core/CustomError.js";
import { environment } from "../config/index.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    if (environment === "development") {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        type: err.type,
      });
    }
    return ApiError.handle(err, res);
  }

  const fallback = new InternalError();
  const message = err instanceof Error ? err.message : "Unknown error";

  return res.status(fallback.statusCode).json({
    success: false,
    message,
  });
};
