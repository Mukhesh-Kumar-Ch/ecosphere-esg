import bcrypt from "bcrypt";
import { HttpError } from "../../utils/http-error.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.js";
import { findActiveUserById, findUserForLogin } from "./auth.repository.js";
import type { AuthUser, LoginInput, RefreshInput } from "./auth.types.js";

function toAuthUser(user: NonNullable<Awaited<ReturnType<typeof findUserForLogin>>>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    role: user.role,
    department: user.department,
  } satisfies AuthUser;
}

export async function login(input: LoginInput) {
  const user = await findUserForLogin(input.email.toLowerCase().trim());

  if (!user) {
    throw new HttpError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new HttpError(403, "User account is inactive.", "INACTIVE_USER");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  const authUser = toAuthUser(user);

  return {
    user: authUser,
    accessToken: signAccessToken(authUser),
    refreshToken: signRefreshToken(authUser),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await findActiveUserById(userId);

  if (!user) {
    throw new HttpError(404, "Authenticated user not found.", "USER_NOT_FOUND");
  }

  return toAuthUser(user);
}

export async function refreshSession(input: RefreshInput) {
  const { verifyRefreshToken } = await import("../../utils/jwt.js");
  const payload = verifyRefreshToken(input.refreshToken);
  const user = await findActiveUserById(payload.sub);

  if (!user) {
    throw new HttpError(401, "Refresh token is no longer valid.", "INVALID_REFRESH_TOKEN");
  }

  const authUser = toAuthUser(user);

  return {
    user: authUser,
    accessToken: signAccessToken(authUser),
    refreshToken: signRefreshToken(authUser),
  };
}
