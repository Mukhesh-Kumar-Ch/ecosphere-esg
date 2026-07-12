import { Router } from "express";
import { GamificationController } from "./gamification.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const gamificationRouter = Router();

gamificationRouter.use(authenticate);

gamificationRouter.get("/badges", GamificationController.getBadges);
gamificationRouter.get("/my-badges", GamificationController.getMyBadges);
gamificationRouter.get("/my-xp", GamificationController.getMyXp);

gamificationRouter.get("/rewards", GamificationController.getRewards);
gamificationRouter.post("/rewards", requireRoles(["Admin", "Asset Manager"]), GamificationController.createReward);
gamificationRouter.patch("/rewards/:id", requireRoles(["Admin", "Asset Manager"]), GamificationController.updateReward);
gamificationRouter.delete("/rewards/:id", requireRoles(["Admin", "Asset Manager"]), GamificationController.deleteReward);
gamificationRouter.post("/rewards/:id/redeem", GamificationController.redeemReward);
gamificationRouter.get("/redemptions", GamificationController.getRedemptions);

gamificationRouter.get("/leaderboard", GamificationController.getLeaderboard);

export default gamificationRouter;
