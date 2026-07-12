import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { ValidationError } from "../utils/http-error.js";

export function validateRequest(schema: ZodTypeAny, source: "body" | "query" | "params" = "body"):
  RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request[source]);

    if (!result.success) {
      return next(new ValidationError(result.error.flatten()));
    }

    return next();
  };
}
