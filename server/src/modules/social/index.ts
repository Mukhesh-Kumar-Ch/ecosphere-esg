import { Router } from "express";
import { csrRouter } from "./csr/csr.routes.js";
import { challengesRouter } from "./challenges/challenges.routes.js";
import { gamificationRouter } from "./gamification/gamification.routes.js";
import { trainingRouter } from "./training/training.routes.js";
import { diversityRouter } from "./diversity/diversity.routes.js";
import { reportsRouter } from "./reports.routes.js";

export const socialRouter = Router();

socialRouter.use("/csr", csrRouter);
socialRouter.use("/challenges", challengesRouter);
socialRouter.use("/gamification", gamificationRouter);
socialRouter.use("/training", trainingRouter);
socialRouter.use("/diversity", diversityRouter);
socialRouter.use(reportsRouter);

export default socialRouter;
