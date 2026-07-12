export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = "HTTP_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class ValidationError extends HttpError {
  constructor(details: unknown, message = "Validation failed.") {
    super(400, message, "VALIDATION_ERROR", details);
  }
}
