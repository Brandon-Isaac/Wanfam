import { feedScheduleController } from "../controllers/FeedScheduleController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.post("/:farmSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedScheduleController.createFeedConsumptionScheduleForMultipleAnimals);
router.post("/:farmSlug/:animalSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedScheduleController.createFeedConsumptionSchedule);
router.get("/:farmSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedScheduleController.getFeedingSchedulesForFarm);
router.get("/:farmSlug/:animalSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedScheduleController.getFeedingSchedulesForAnimal);
router.put("/:farmSlug/:animalSlug/:scheduleSlug", authenticate, roleHandler([UserRole.ADMIN]), feedScheduleController.updateFeedingSchedule);
router.delete("/:farmSlug/:animalSlug/:scheduleSlug", authenticate, roleHandler([UserRole.ADMIN]), feedScheduleController.deleteFeedingSchedule);
router.post("/:farmSlug/:animalSlug/:scheduleSlug/execute", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedScheduleController.executeFeedingSchedule);

export default router;