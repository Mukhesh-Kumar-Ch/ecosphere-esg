import bcrypt from "bcrypt";
import { HttpError } from "../../utils/http-error.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.js";
import {
  createUser,
  findActiveUserById,
  findDepartmentByCode,
  findRoleByName,
  findUserByEmail,
  findUserForLogin,
} from "./auth.repository.js";
import type { AuthUser, LoginInput, RefreshInput, SignupInput } from "./auth.types.js";

const defaultSignupDepartmentCode = "OPS";
const employeeRoleName = "Employee";

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

function toDisplayName(email: string) {
  const localPart = email.split("@")[0] ?? email;
  const words = localPart.replace(/[._-]+/g, " ").trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return email;
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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

export async function signup(input: SignupInput) {
  const email = input.email.toLowerCase().trim();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new HttpError(409, "An account with this email already exists.", "EMAIL_ALREADY_EXISTS");
  }

  const employeeRole = await findRoleByName(employeeRoleName);

  if (!employeeRole) {
    throw new HttpError(500, "Employee role is not configured.", "ROLE_NOT_CONFIGURED");
  }

  const department = await findDepartmentByCode(defaultSignupDepartmentCode);

  if (!department) {
    throw new HttpError(500, "Default signup department is not configured.", "DEFAULT_DEPARTMENT_NOT_CONFIGURED");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await createUser({
    departmentId: department.id,
    roleId: employeeRole.id,
    name: toDisplayName(email),
    email,
    passwordHash,
  });
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
