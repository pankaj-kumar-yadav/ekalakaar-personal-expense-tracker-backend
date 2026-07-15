import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { mongoURI, port } from "./config/index.js";

const HOST = "0.0.0.0";

const startServer = async () => {
  try {
    await connectDB(mongoURI);

    // Bind 0.0.0.0 so Render (and other hosts) can reach the service;
    // PORT comes from the platform in production.
    app.listen(port, HOST, () => {
      console.log(`Server running on http://${HOST}:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
