import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";

export function requireRoles(allowedRoles: string[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const roleName = request.user?.role?.name;

    if (!request.user) {
      return next(new HttpError(401, "Authentication required.", "UNAUTHORIZED"));
    }

    if (!roleName || !allowedRoles.includes(roleName)) {
      return next(new HttpError(403, "You do not have access to this resource.", "FORBIDDEN"));
    }

    return next();
  };
}

export const requireAdmin = requireRoles(["Admin"]);
