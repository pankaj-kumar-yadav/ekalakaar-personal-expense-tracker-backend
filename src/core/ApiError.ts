import type { Response } from "express";

export enum ErrorType {
  BAD_REQUEST = "BadRequest",
  NOT_FOUND = "NotFound",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  INTERNAL = "Internal",
  TOKEN_EXPIRED = "TokenExpired",
}

export class ApiError extends Error {
  type: ErrorType;
  statusCode: number;

  constructor(type: ErrorType, statusCode: number, message: string) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static handle(err: ApiError, res: Response) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
