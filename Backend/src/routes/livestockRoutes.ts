import { Router } from "express";
import { LivestockController } from "../controllers/LivestockController";
import { roleHandler } from "../middleware/roleHandler";
import { authenticate } from "../middleware/Auth";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();
router.use(authenticate);

// Static routes first
router.get("/farmer/all-animals", roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.getAllAnimalsForFarmer);
router.get("/assigned", roleHandler([UserRole.WORKER, UserRole.FARMER, UserRole.ADMIN]), LivestockController.getAnimalByWorkerAssigned);
router.get("/animals", roleHandler([UserRole.ADMIN]), LivestockController.getAllAnimals);

// More specific routes before generic ones
router.get("/:farmId/sick-animals", roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.getSickAnimalsByFarm);
router.get("/:farmId/animals", roleHandler([UserRole.WORKER, UserRole.FARMER, UserRole.ADMIN]), LivestockController.getAnimalsByFarm);
router.get("/:farmId/animals/:animalId", roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.getFarmAnimalById);
router.put("/:farmId/animals/:animalId",auditMiddleware('UPDATE', 'Animal'), roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.updateAnimal);
router.delete("/:farmId/animals/:animalId",auditMiddleware('DELETE', 'Animal'), roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.deleteFarmAnimal);
router.put("/:animalId/health-status",auditMiddleware('UPDATE', 'Animal'), roleHandler([UserRole.FARMER, UserRole.VETERINARY, UserRole.ADMIN]), LivestockController.updateHealthStatus);

// Generic routes last
router.post("/:farmId",auditMiddleware('CREATE', 'Animal'), roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.addAnimalToFarm);
router.get("/:animalId", roleHandler([UserRole.WORKER, UserRole.FARMER, UserRole.ADMIN]), LivestockController.getAnimalById);
router.put("/:animalId",auditMiddleware('UPDATE', 'Animal'),  roleHandler([UserRole.WORKER]), LivestockController.updateAnimalByWorkerAssigned);
router.delete("/:animalId",auditMiddleware('DELETE', 'Animal'), roleHandler([UserRole.ADMIN]), LivestockController.deleteAnimal);


export default router;