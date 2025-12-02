import { Router } from "express";
import { TreatmentController } from "../controllers/TreatmentController";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.post("/:farmId/schedule", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.createTreatmentSchedule);
router.get("/schedules/assigned", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.getTreatmentSchedulesAssignedByVet);
router.get("/schedules/:scheduleId", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.getTreatmentScheduleById);
router.get("/schedules/animal/:animalId", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.getTreatmentSchedulesByAnimal);
router.post("/record", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.recordTreatment);
router.post("/record/unscheduled", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.recordUnscheduledTreatment);
router.get("/records/animal/:animalId", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.getTreatmentRecordsByAnimal);
router.get("/schedules/vet/:veterinarianId", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.getTreatmentSchedulesByVet);
router.put("/schedules/:scheduleId", authenticate, roleHandler([UserRole.VETERINARY, UserRole.FARMER, UserRole.ADMIN]), TreatmentController.updateTreatmentSchedule);

export default router;