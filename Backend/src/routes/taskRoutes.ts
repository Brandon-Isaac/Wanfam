import { TaskController } from "../controllers/TaskController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();

router.get("/:farmId",authenticate, TaskController.getAllTasks, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]));
router.get("/:farmId/task/:taskId", authenticate, TaskController.getTaskById, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]));
router.post("/:farmId", authenticate, auditMiddleware('CREATE', 'Task'), TaskController.createTask, roleHandler([UserRole.FARMER, UserRole.ADMIN]));
router.put("/:farmId/task/:taskId", authenticate, auditMiddleware('UPDATE', 'Task'), TaskController.updateTask, roleHandler([UserRole.FARMER, UserRole.ADMIN]));
router.put("/:taskId/status", authenticate, auditMiddleware('UPDATE', 'Task'), TaskController.updateTaskStatus, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]));
router.delete("/:farmId/task/:taskId", authenticate, auditMiddleware('DELETE', 'Task'), TaskController.deleteTask, roleHandler([UserRole.FARMER, UserRole.ADMIN]));
router.post("/:farmId/task/:taskId/assign", authenticate, auditMiddleware('UPDATE', 'Task'), TaskController.assignTasksToWorkers, roleHandler([UserRole.FARMER, UserRole.ADMIN]));

router.post("/:taskId/complete", authenticate, auditMiddleware('UPDATE', 'Task'), TaskController.markTaskAsCompleted, roleHandler([UserRole.FARMER, UserRole.WORKER]));

export default router;