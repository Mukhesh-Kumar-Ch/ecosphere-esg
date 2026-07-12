import type { Response } from "express";

export function sendSuccess<T>(response: Response, message: string, data: T, statusCode = 200) {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  response: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
) {
  return response.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? [],
  });
}
