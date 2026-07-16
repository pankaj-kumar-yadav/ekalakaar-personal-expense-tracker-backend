import type { RequestHandler, Response } from "express";
import asyncHandler from "express-async-handler";

import { BadRequestError } from "../core/CustomError.js";
import User from "../models/User.js";
import type { ProtectedRequest } from "../types/express.js";
import { clearToken, generateToken } from "../utils/generateToken.js";

export const registerUser: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new BadRequestError("User already exists");
    }

    const user = await User.create({ name, email, password });

    generateToken(res, user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  },
);

export const loginUser: RequestHandler = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      throw new BadRequestError("Invalid user credentials");
    }

    generateToken(res, user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  },
);

export const logoutUser: RequestHandler = asyncHandler(
  async (_req: ProtectedRequest, res: Response) => {
    clearToken(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);
