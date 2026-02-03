import { FeedConsumptionController } from "../controllers/FeedConsumptionController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
const router = Router();

router.post("/:farmId/execute", authenticate, roleHandler([UserRole.FARMER, UserRole.WORKER]), FeedConsumptionController.executeTodaysFeedSchedule);
router.post("/:scheduleId/", authenticate, roleHandler([UserRole.WORKER, UserRole.FARMER]), FeedConsumptionController.executeFeedingSchedule);
router.post("/:farmId/:animalId", authenticate, roleHandler([UserRole.WORKER, UserRole.FARMER]), FeedConsumptionController.recordFeedConsumption);
router.post("/:farmId", authenticate, roleHandler([UserRole.WORKER, UserRole.FARMER]), FeedConsumptionController.recordFeedConsumptionByMultipleAnimals);
router.get("/:farmId/:animalId", authenticate, roleHandler([UserRole.WORKER, UserRole.FARMER]), FeedConsumptionController.getFeedConsumptionByAnimal);
router.get("/:farmId", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), FeedConsumptionController.getConsumptionByFarm);
router.put("/:farmId/:animalId/:recordId", authenticate, roleHandler([UserRole.WORKER, UserRole.FARMER, UserRole.ADMIN]), FeedConsumptionController.updateFeedConsumption);
router.delete("/:farmId/:animalId/:recordId", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.WORKER]), FeedConsumptionController.deleteFeedConsumption);

export default router;