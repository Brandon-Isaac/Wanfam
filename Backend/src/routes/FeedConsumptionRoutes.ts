import { feedConsumptionController } from "../controllers/FeedConsumptionController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
const router = Router();

router.post("/:farmSlug/:animalSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedConsumptionController.recordFeedConsumption);
router.post("/:farmSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedConsumptionController.recordFeedConsumptionByMultipleAnimals);
router.get("/:farmSlug/:animalSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedConsumptionController.getFeedConsumptionByAnimal);
router.get("/:farmSlug", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), feedConsumptionController.getConsumptionByFarm);
router.put("/:farmSlug/:animalSlug/:recordSlug", authenticate, roleHandler([UserRole.ADMIN]), feedConsumptionController.updateFeedConsumption);
router.delete("/:farmSlug/:animalSlug/:recordSlug", authenticate, roleHandler([UserRole.ADMIN]), feedConsumptionController.deleteFeedConsumption);

export default router;