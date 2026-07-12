import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { loginSchema, refreshSchema } from "../modules/auth/auth.schemas.js";
import {
  currentUserController,
  loginController,
  logoutController,
  refreshController,
} from "../modules/auth/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", validateRequest(loginSchema), loginController);
authRouter.post("/logout", authenticate, logoutController);
authRouter.get("/me", authenticate, currentUserController);
authRouter.post("/refresh", validateRequest(refreshSchema), refreshController);
