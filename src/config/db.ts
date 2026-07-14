import mongoose from "mongoose";

import { environment } from "./index.js";

export const connectDB = async (url: string): Promise<void> => {
  if (!url) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(url, {
    autoIndex: environment === "development",
  });

  console.log("MongoDB connected");
};
