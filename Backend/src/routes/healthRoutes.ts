import { healthController } from "../controllers/HealthController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.post("/:farmSlug/animals/:animalSlug", authenticate, roleHandler([UserRole.VETERINARY]), healthController.createHealthRecord);
router.get("/:farmSlug/animals/:animalSlug", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), healthController.getHealthRecords);
router.get("/:farmSlug/animals/:animalSlug/:id", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), healthController.getHealthRecordById);
router.get("/:farmSlug/", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), healthController.getFarmHealthRecords);
router.put("/:farmSlug/animals/:animalSlug/:id", authenticate, roleHandler([UserRole.VETERINARY]), healthController.updateHealthRecord);
router.delete("/:farmSlug/animals/:animalSlug/:id", authenticate, roleHandler([UserRole.VETERINARY]), healthController.deleteHealthRecord);
router.put("/:farmSlug/animals/:animalSlug/:id/weight", authenticate, roleHandler([UserRole.VETERINARY]), healthController.updateWeightRecord);

export default router;