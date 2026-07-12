import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { verifyAccessToken } from "../utils/jwt.js";
import type { AuthUser } from "../modules/auth/auth.types.js";

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication token is required.", "UNAUTHORIZED"));
  }

  try {
    const token = authorizationHeader.slice(7);
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
        status: "ACTIVE",
      },
      include: {
        role: true,
        department: true,
      },
    });

    if (!user) {
      return next(new HttpError(401, "User session is no longer valid.", "UNAUTHORIZED"));
    }

    request.auth = payload;
    request.user = user as AuthUser;
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token.", "UNAUTHORIZED"));
  }
}
