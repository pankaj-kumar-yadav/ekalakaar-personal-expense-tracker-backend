import type { Request } from "express";

import type { UserDoc } from "../models/User.js";

export interface ProtectedRequest extends Request {
  user?: UserDoc;
}
