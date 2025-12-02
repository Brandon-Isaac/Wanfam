import { AuditLogController } from "../controllers/AuditLogController";
import {Router} from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply role-based access control
router.use(roleHandler([UserRole.ADMIN]));

// Define routes
router.get("/", AuditLogController.getRecentAuditLogs);
router.post("/", AuditLogController.addLogEntry);

export default router;