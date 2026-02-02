import { FeedScheduleController } from "../controllers/FeedScheduleController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.post("/:farmId/generate-schedule", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), FeedScheduleController.generateFeedingScheduleWithAI);
router.post("/:farmId/:animalId", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), FeedScheduleController.createFeedConsumptionSchedule);
router.post("/:farmId", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), FeedScheduleController.createFeedConsumptionScheduleForMultipleAnimals);
router.get("/:farmId", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), FeedScheduleController.getFeedingSchedulesForFarm);
router.get("/animal/:animalId", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), FeedScheduleController.getFeedingSchedulesForAnimal);
router.put("/:scheduleId", authenticate, roleHandler([UserRole.ADMIN]), FeedScheduleController.updateFeedingSchedule);
router.delete("/:scheduleId", authenticate, roleHandler([UserRole.ADMIN]), FeedScheduleController.deleteFeedingSchedule);

export default router;