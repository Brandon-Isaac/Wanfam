import { TaskController } from "../controllers/TaskController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();

router.use(authenticate);

router.get("/:farmId", TaskController.getAllTasks, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]));
router.get("/:farmId/task/:taskId", TaskController.getTaskById, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]));
router.post("/:farmId", auditMiddleware('CREATE', 'Task'), TaskController.createTask, roleHandler([UserRole.FARMER, UserRole.ADMIN]));
router.put("/:farmId/task/:taskId",auditMiddleware('UPDATE', 'Task'), TaskController.updateTask, roleHandler([UserRole.FARMER, UserRole.ADMIN]));
router.put("/:taskId/status",auditMiddleware('UPDATE', 'Task'), TaskController.updateTaskStatus, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.WORKER]));
router.delete("/:farmId/task/:taskId", auditMiddleware('DELETE', 'Task'), TaskController.deleteTask, roleHandler([UserRole.FARMER, UserRole.ADMIN]));
router.post("/:farmId/task/:taskId/assign",auditMiddleware('UPDATE', 'Task'), TaskController.assignTasksToWorkers, roleHandler([UserRole.FARMER, UserRole.ADMIN]));

router.post("/:taskId/complete", auditMiddleware('UPDATE', 'Task'), TaskController.markTaskAsCompleted, roleHandler([UserRole.FARMER, UserRole.WORKER]));

export default router;