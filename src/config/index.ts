export const environment = process.env.NODE_ENV ?? "development";
// Prefer platform PORT (Render sets this). Fallback is for local only.
const parsedPort = Number(process.env.PORT);
export const port =
  Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8080;
export const mongoURI = process.env.MONGODB_URI ?? "";
export const jwtSecret = process.env.JWT_SECRET ?? "";
