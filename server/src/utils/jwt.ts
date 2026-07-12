import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthUser } from "../modules/auth/auth.types.js";

export type JwtUserPayload = {
  sub: string;
  role: string;
  departmentId: string;
  email: string;
  name: string;
};

export function signAccessToken(user: AuthUser) {
  const expiresIn = env.JWT_ACCESS_EXPIRES_IN as Exclude<SignOptions["expiresIn"], undefined>;

  return jwt.sign(
    {
      sub: user.id,
      role: user.role.name,
      departmentId: user.department.id,
      email: user.email,
      name: user.name,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn } as SignOptions,
  );
}

export function signRefreshToken(user: AuthUser) {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN as Exclude<SignOptions["expiresIn"], undefined>;

  return jwt.sign(
    {
      sub: user.id,
      role: user.role.name,
      departmentId: user.department.id,
      email: user.email,
      name: user.name,
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn } as SignOptions,
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUserPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUserPayload;
}
