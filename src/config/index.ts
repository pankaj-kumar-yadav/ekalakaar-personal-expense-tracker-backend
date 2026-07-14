export const environment = process.env.NODE_ENV ?? "development";
export const port = Number(process.env.PORT) || 8080;
export const mongoURI = process.env.MONGODB_URI ?? "";
export const jwtSecret = process.env.JWT_SECRET ?? "";
