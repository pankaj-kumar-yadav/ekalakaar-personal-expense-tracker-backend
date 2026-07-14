import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { mongoURI, port } from "./config/index.js";

const startServer = async () => {
  try {
    await connectDB(mongoURI);

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
