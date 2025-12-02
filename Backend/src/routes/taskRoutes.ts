import { TaskController } from "../controllers/TaskController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();
router.use(authenticate);

router.get("/:farmId", roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]), TaskController.getAllTasks);
router.get("/:farmId/task/:taskId", roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]), TaskController.getTaskById);
router.post("/:farmId", auditMiddleware('CREATE', 'Task'), roleHandler([UserRole.FARMER, UserRole.ADMIN]), TaskController.createTask);
router.put("/:farmId/task/:taskId", auditMiddleware('UPDATE', 'Task'), roleHandler([UserRole.FARMER, UserRole.ADMIN]), TaskController.updateTask);
router.put("/:taskId/status", auditMiddleware('UPDATE', 'Task'), roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]), TaskController.updateTaskStatus);
router.delete("/:farmId/task/:taskId", auditMiddleware('DELETE', 'Task'), roleHandler([UserRole.FARMER, UserRole.ADMIN]), TaskController.deleteTask);
router.post("/:farmId/task/:taskId/assign", auditMiddleware('UPDATE', 'Task'), roleHandler([UserRole.FARMER, UserRole.ADMIN]), TaskController.assignTasksToWorkers);

router.post("/:taskId/complete", auditMiddleware('UPDATE', 'Task'), roleHandler([UserRole.FARMER, UserRole.WORKER]), TaskController.markTaskAsCompleted);

export default router;