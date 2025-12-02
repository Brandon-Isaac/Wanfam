import { DiseaseOutbreakController } from "../controllers/DiseaseOutbreakController";
import Router from "express";
import { UserRole } from "../models/UserRole";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";

const router = Router();

router.post("/", authenticate, roleHandler([UserRole.FARMER]), DiseaseOutbreakController.createDiseaseOutbreak);
router.post("/preventive-measures", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), DiseaseOutbreakController.generatDiseaseOutbreakPreventiveMeasures);
router.get("/:diseaseOutbreakId/report", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY]), DiseaseOutbreakController.generateDiseaseOutbreakReport);
router.get("/:farmSlug/disease-outbreaks", authenticate, roleHandler([UserRole.FARMER, UserRole.VETERINARY, UserRole.ADMIN]), DiseaseOutbreakController.getDiseaseOutbreaksByFarm);
router.put("/:id", authenticate, roleHandler([UserRole.FARMER]), DiseaseOutbreakController.updateDiseaseOutbreak);
router.delete("/:id", authenticate, roleHandler([UserRole.FARMER]), DiseaseOutbreakController.deleteDiseaseOutbreak);

export default router;