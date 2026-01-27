import { VaccinationController } from "../controllers/VaccinationController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { UserRole } from "../models/UserRole";
import { roleHandler } from "../middleware/roleHandler";

const router = Router();

router.post("/schedules/:farmSlug/:animalId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.createVaccinationSchedule);
router.get("/schedules/veterinarian", authenticate, roleHandler([UserRole.VETERINARY]), VaccinationController.getVeterinarianSchedules);
router.get("/schedules/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.getVaccinationSchedules);
router.put("/schedules/:scheduleId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.updateVaccinationSchedule);
router.delete("/schedules/:scheduleId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.deleteVaccinationSchedule);
router.post("/records", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.createVaccinationRecord);
router.post("/schedules/:scheduleId/execute", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.executeVaccinationSchedule);
router.get("/records/:farmId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.getVaccinationRecords);
router.put("/records/:recordId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.updateVaccinationRecord);
router.delete("/records/:recordId", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), VaccinationController.deleteVaccinationRecord);

export default router;