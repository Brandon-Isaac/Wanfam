import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";
import { auditMiddleware } from "../middleware/auditMiddleware";

const router = Router();
router.use(authenticate);
router.use(roleHandler([UserRole.ADMIN]));

router.get("/:farmId", roleHandler([UserRole.FARMER]), ReviewController.getTimeOffRequests);
router.get("/:farmId/:id", roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.getReviewById);
router.post("/", auditMiddleware('CREATE','FARM_WORKER'), roleHandler([UserRole.VETERINARY,UserRole.WORKER]), ReviewController.createTimeOffRequests);
router.put("/:farmId/:id/approve",auditMiddleware('UPDATE','FARM_WORKER'), roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.approveTimeOffRequest);
router.put("/:farmId/:id/deny",auditMiddleware('UPDATE','FARM_WORKER'), roleHandler([UserRole.FARMER, UserRole.VETERINARY,UserRole.WORKER,UserRole.LOAN_OFFICER]), ReviewController.denyTimeOffRequest);
export default router;