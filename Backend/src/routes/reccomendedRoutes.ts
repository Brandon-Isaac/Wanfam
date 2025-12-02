import { RecommendationController } from "../controllers/ReccomendationController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { UserRole } from "../models/UserRole";
import { roleHandler } from "../middleware/roleHandler";

const router = Router();

router.get("/investments/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.ADMIN]), RecommendationController.recommendInvestments);
router.get("/feeding-schedules/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.ADMIN]), RecommendationController.recommendFeedingSchedules);
router.get("/health-checks/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.ADMIN]), RecommendationController.recommendHealthChecks);
router.get("/farm-improvements/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.ADMIN]), RecommendationController.recommendFarmImprovements);

export default router;