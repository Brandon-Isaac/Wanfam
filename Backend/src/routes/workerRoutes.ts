import { WorkerController } from "../controllers/WorkerController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.use(authenticate);
router.get("/available", roleHandler([UserRole.FARMER]), WorkerController.getAvailableWorkers);
router.get("/tasks", roleHandler([UserRole.WORKER]), WorkerController.getWorkerTasks);
router.get("/:farmId", roleHandler([UserRole.FARMER]), WorkerController.getAllWorkers);
router.get("/:farmId/:workerId", roleHandler([UserRole.FARMER]), WorkerController.getWorkerById);
router.post("/:farmId", roleHandler([UserRole.FARMER]), WorkerController.createWorker);
router.put("/:farmId/:workerId", roleHandler([UserRole.FARMER]), WorkerController.updateWorker);
router.delete("/:farmId/:workerId", roleHandler([UserRole.FARMER]), WorkerController.deleteWorker);

router.post("/:farmId/employ", roleHandler([UserRole.FARMER]), WorkerController.employWorker);
router.post("/:farmId/employ-multiple", roleHandler([UserRole.FARMER]), WorkerController.employWorkers);
router.put("/:farmId/:workerId/dismiss", roleHandler([UserRole.FARMER]), WorkerController.dismissWorker);

export default router;