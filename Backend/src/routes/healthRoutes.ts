import { healthController } from "../controllers/HealthController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();
router.get("/animal/:animalId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY, UserRole.WORKER, UserRole.LOAN_OFFICER, UserRole.ADMIN]), healthController.getAnimalHealthRecords);
router.get("/farm/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY, UserRole.WORKER, UserRole.LOAN_OFFICER, UserRole.ADMIN]), healthController.getAllFarmHealthRecords);
router.get("/:id", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY, UserRole.WORKER, UserRole.LOAN_OFFICER, UserRole.ADMIN]), healthController.getHealthRecordById);
router.get("/", authenticate, roleHandler([UserRole.ADMIN]), healthController.getAllSystemHealthRecords);

export default router;