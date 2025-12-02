import { Router } from "express";
import { LivestockController } from "../controllers/LivestockController";
import { roleHandler } from "../middleware/roleHandler";
import { authenticate } from "../middleware/Auth";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();

router.get("/:farmId",authenticate,roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.getAnimalsByFarm);
router.get("/:animalId",authenticate,roleHandler([UserRole.WORKER, UserRole.ADMIN]), LivestockController.getAnimalById);
router.get("/:farmId/sick-animals",authenticate,roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.getSickAnimalsByFarm);
router.put("/:animalId/health-status",auditMiddleware('UPDATE', 'Animal'), authenticate,roleHandler([UserRole.FARMER,UserRole.VETERINARY, UserRole.ADMIN]), LivestockController.updateHealthStatus);
router.get("/:farmId/animals/:animalId",authenticate,roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.getFarmAnimalById);
router.post("/:farmId",auditMiddleware('CREATE', 'Animal'), authenticate,roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.addAnimalToFarm);
router.put("/:farmId/animals/:animalId",auditMiddleware('UPDATE', 'Animal'), authenticate,roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.updateAnimal);
router.delete("/:farmId/animals/:animalId",auditMiddleware('DELETE', 'Animal'), authenticate,roleHandler([UserRole.FARMER, UserRole.ADMIN]), LivestockController.deleteFarmAnimal);
router.get("/assigned",authenticate,roleHandler([UserRole.WORKER]), LivestockController.getAnimalByWorkerAssigned);
router.put("/:animalId",auditMiddleware('UPDATE', 'Animal'), authenticate,roleHandler([UserRole.WORKER]), LivestockController.updateAnimalByWorkerAssigned);
router.get("/animals",authenticate,roleHandler([UserRole.ADMIN]), LivestockController.getAllAnimals);
router.delete("/:animalId",auditMiddleware('DELETE', 'Animal'), authenticate,roleHandler([UserRole.ADMIN]), LivestockController.deleteAnimal);


export default router;