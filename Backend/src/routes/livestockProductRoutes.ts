import { LivestockProductsController } from "../controllers/LivestockProductsController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();

router.post("/:animalId/milk", auditMiddleware('CREATE', 'MilkProduction'), authenticate, roleHandler([UserRole.ADMIN,UserRole.WORKER, UserRole.FARMER]), LivestockProductsController.milkProduced);
router.get("/:animalId/milk/today", authenticate, roleHandler([UserRole.ADMIN, UserRole.WORKER, UserRole.FARMER]), LivestockProductsController.getMilkProducedTodayByAnimalId);
router.get("/:farmId", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getAnimalProductsByFarm);
router.get("/:farmId/:animalId/monthly-milk", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getMonthlyMilkProductionPerAnimal);
router.get("/:farmId/milk", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getTodayFarmMilkProduction);
// router.post("/:farmSlug/:animalSlug/eggs", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.eggsProduced);
// router.post("/:farmSlug/:animalSlug/wool", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.woolProduced);
// router.post("/:farmSlug/:animalSlug/meat", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.meatProduced);
// router.post("/:farmSlug/:animalSlug/leather", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.leatherProduced);
// router.post("/:farmSlug/:animalSlug/fiber", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.fiberProduced);
// router.post("/:farmSlug/:animalSlug/bacon", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.baconProduced);
// router.post("/:farmSlug/:animalSlug/ham", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.hamProduced);
// router.get("/:farmSlug/:animalSlug/production-records", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getProductionRecordsByAnimal);
// router.get("/:farmSlug/production-records", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getProductionRecordsByFarm);
// router.get("/:farmSlug/:animalSlug/production-summary", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getProductionSummaryByAnimal);
// router.get("/:farmSlug/production-summary", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getProductionSummaryByFarm);
// router.get("/:farmSlug/:animalSlug/average-production", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getAverageProductionByAnimal);
// router.get("/:farmSlug/average-production", authenticate, roleHandler([UserRole.ADMIN, UserRole.FARMER]), LivestockProductsController.getAverageProductionByFarm);

export default router;