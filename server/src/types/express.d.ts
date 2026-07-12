import type { JwtUserPayload } from "../utils/jwt.js";
import type { AuthUser } from "../modules/auth/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      auth?: JwtUserPayload;
      user?: AuthUser;
    }
  }
}

export {};
