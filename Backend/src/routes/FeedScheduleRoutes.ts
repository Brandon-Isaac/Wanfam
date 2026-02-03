import { FeedScheduleController } from "../controllers/FeedScheduleController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.post("/:farmId/generate-schedule", authenticate, roleHandler([UserRole.FARMER, UserRole.WORKER]), FeedScheduleController.generateFeedingScheduleWithAI);
router.post("/:farmId/:animalId", authenticate, roleHandler([UserRole.FARMER]), FeedScheduleController.createFeedSchedule);
router.post("/:farmId", authenticate, roleHandler([UserRole.FARMER]), FeedScheduleController.createFeedScheduleForMultipleAnimals);
router.get("/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.WORKER]), FeedScheduleController.getFeedingSchedulesForFarm);
router.get("/animal/:animalId", authenticate, roleHandler([UserRole.FARMER, UserRole.WORKER]), FeedScheduleController.getFeedingSchedulesForAnimal);
router.put("/:scheduleId", authenticate, roleHandler([UserRole.FARMER, UserRole.WORKER]), FeedScheduleController.updateFeedingSchedule);
router.delete("/:scheduleId", authenticate, roleHandler([UserRole.FARMER]), FeedScheduleController.deleteFeedingSchedule);

export default router;