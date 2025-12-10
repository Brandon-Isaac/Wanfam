import { ReportController } from "../controllers/ReportController";
import Router from "express";
import { UserRole } from "../models/UserRole";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";

const router = Router();

router.post("/", authenticate, roleHandler([UserRole.FARMER]), ReportController.createReport);
router.get("/:farmId/reports", authenticate, roleHandler([UserRole.FARMER, UserRole.ADMIN, UserRole.LOAN_OFFICER]), ReportController.getReportsByFarm);
router.put("/:id", authenticate, roleHandler([UserRole.FARMER]), ReportController.updateReport);

export default router;