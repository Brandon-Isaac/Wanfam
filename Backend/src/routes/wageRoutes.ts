import { WageController } from "../controllers/WageController";
import { Router } from "express";
import { authenticate } from "../middleware/Auth";
import { roleHandler } from "../middleware/roleHandler";
import { UserRole } from "../models/UserRole";

const router = Router();

router.get('/farm/:farmId', authenticate, roleHandler([UserRole.FARMER, UserRole.ADMIN]), WageController.getWagesForFarm);

export default router;