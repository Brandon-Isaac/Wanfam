import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();
router.use(authenticate);

router.get("/", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER, UserRole.ADMIN]), NotificationController.getUserNotifications);
router.post("/", roleHandler([UserRole.ADMIN]), NotificationController.createNotification);
router.post("/task", roleHandler([UserRole.ADMIN, UserRole.FARMER]), NotificationController.createTaskNotification);
router.post("/treatment", roleHandler([UserRole.ADMIN, UserRole.FARMER, UserRole.VETERINARY]), NotificationController.createTreatmentNotification);
router.put("/:id/read", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER, UserRole.ADMIN]), NotificationController.markNotificationAsRead);
router.delete("/:id", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER, UserRole.ADMIN]), NotificationController.deleteNotification);
router.delete("/clear/all", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER, UserRole.ADMIN]), NotificationController.clearAllNotifications);

export default router;