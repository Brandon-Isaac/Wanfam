import { VetController } from "../controllers/VetControllers";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.use(authenticate);
router.get("/earnings/summary", roleHandler([UserRole.VETERINARY]), VetController.getVetEarnings);
router.get("/earnings/records", roleHandler([UserRole.VETERINARY]), VetController.getVetServiceRecords);
router.get("/available", roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.VETERINARY]), VetController.getVetsAvailable);
router.get("/:farmId", roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.VETERINARY]), VetController.getFarmVets);
router.post("/add-farm", roleHandler([UserRole.FARMER, UserRole.VETERINARY, UserRole.ADMIN]), VetController.addFarmToVet);
router.put("/update-availability", roleHandler([UserRole.VETERINARY]), VetController.updateVetAvailability);
router.post("/create-services", roleHandler([UserRole.VETERINARY]), VetController.createVetServices);
router.get("/salary/:farmId", roleHandler([UserRole.FARMER, UserRole.ADMIN]), VetController.getVetSalary);

export default router;