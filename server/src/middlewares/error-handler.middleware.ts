import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { HttpError } from "../utils/http-error.js";
import { sendError } from "../utils/response.js";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return sendError(response, 400, "Validation failed.", error.flatten());
  }

  if (error instanceof HttpError) {
    return sendError(response, error.statusCode, error.message, error.details ?? []);
  }

  logger.error("Unhandled server error", error);

  return sendError(
    response,
    500,
    env.NODE_ENV === "production" ? "Internal server error." : "Internal server error.",
  );
}
