import type { Request, Response } from "express";
import { getCurrentUser, login, refreshSession, signup } from "./auth.service.js";
import { sendSuccess } from "../../utils/response.js";

export async function loginController(request: Request, response: Response) {
  const result = await login(request.body);

  return sendSuccess(response, "Login successful.", result);
}

export async function signupController(request: Request, response: Response) {
  const result = await signup(request.body);

  return sendSuccess(response, "Signup successful.", result, 201);
}

export async function currentUserController(request: Request, response: Response) {
  const user = await getCurrentUser(request.user!.id);

  return sendSuccess(response, "Current user retrieved successfully.", { user });
}

export async function logoutController(_request: Request, response: Response) {
  return sendSuccess(response, "Logout successful.", { loggedOut: true });
}

export async function refreshController(request: Request, response: Response) {
  const result = await refreshSession(request.body);

  return sendSuccess(response, "Token refreshed successfully.", result);
}
