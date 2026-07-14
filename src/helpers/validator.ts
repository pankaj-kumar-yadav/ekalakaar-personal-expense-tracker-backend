import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import { BadRequestError } from "../core/CustomError.js";

export enum ValidationSource {
  BODY = "body",
  QUERY = "query",
  PARAMS = "params",
}

export const validateRequest = (
  schema: ZodSchema,
  source: ValidationSource = ValidationSource.BODY,
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      Object.assign(req[source], data);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues.map((issue) => issue.message).join(", ");
        return next(new BadRequestError(message));
      }
      return next(err);
    }
  };
};
