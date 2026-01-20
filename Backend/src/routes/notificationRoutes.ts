import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();
router.use(authenticate);
router.use(roleHandler([UserRole.ADMIN]));

router.get("/", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.getUserNotifications);
router.post("/", NotificationController.createNotification);
router.post("/task", NotificationController.createTaskNotification);
router.post("/treatment", NotificationController.createTreatmentNotification);
router.put("/:id/read", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.markNotificationAsRead);
router.delete("/:id", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.deleteNotification);
router.delete("/clear/all", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.clearAllNotifications);

export default router;