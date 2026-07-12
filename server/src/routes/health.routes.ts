import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { sendSuccess } from "../utils/response.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  let databaseStatus = "unhealthy";

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = "healthy";
  } catch {
    databaseStatus = "unhealthy";
  }

  return sendSuccess(response, "Health check successful.", {
    status: "healthy",
    server: "running",
    database: databaseStatus,
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});
