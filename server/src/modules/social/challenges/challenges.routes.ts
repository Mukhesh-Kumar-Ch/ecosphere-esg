import { Router } from "express";
import { ChallengesController } from "./challenges.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const challengesRouter = Router();

challengesRouter.use(authenticate);

challengesRouter.get("/", ChallengesController.getChallenges);
challengesRouter.get("/:id", ChallengesController.getChallengeById);

challengesRouter.post(
  "/",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  ChallengesController.createChallenge
);

challengesRouter.patch(
  "/:id",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  ChallengesController.updateChallenge
);

challengesRouter.delete(
  "/:id",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  ChallengesController.deleteChallenge
);

challengesRouter.post("/:id/join", ChallengesController.joinChallenge);
challengesRouter.post("/:id/progress", ChallengesController.updateProgress);

challengesRouter.post(
  "/participations/:id/approve",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  ChallengesController.approveParticipation
);

challengesRouter.get("/participations/all", ChallengesController.getParticipations);

export default challengesRouter;
