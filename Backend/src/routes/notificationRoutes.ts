import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();
router.use(authenticate);

router.get("/", roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.getUserNotifications);
router.get("/unread-count", roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.getUnreadCount);
router.post("/", NotificationController.createNotification);
router.post("/task", NotificationController.createTaskNotification);
router.post("/treatment", NotificationController.createTreatmentNotification);
router.put("/mark-all-read", roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.markAllAsRead);
router.put("/:id/read", roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.markNotificationAsRead);
router.delete("/:id", roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.deleteNotification);
router.delete("/clear/all", roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), NotificationController.clearAllNotifications);

export default router;