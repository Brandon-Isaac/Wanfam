import { CapitalController } from "../controllers/CapitalController";
import Router from "express";
import { authenticate } from "../middleware/Auth";
import { UserRole } from "../models/UserRole";
import { roleHandler } from "../middleware/roleHandler";

const router = Router();

// All routes here require authentication
router.use(authenticate);
router.use(roleHandler([UserRole.FARMER, UserRole.ADMIN]));

// Create a new investment
router.post('/farms/:farmId/investments', CapitalController.createInvestment);
// Update investment details
router.put('/investments/:investmentId', CapitalController.updateInvestmentDetails);
// Delete an investment
router.delete('/investments/:investmentId', CapitalController.deleteInvestment);
// Get investment summary for a farm
router.get('/farms/:farmId/investments/summary', CapitalController.getInvestmentSummary);
// Get wage summary for a farm
router.get('/farms/:farmId/wages/summary', CapitalController.getWageSummary);
// Get overall financial summary for a farm
router.get('/farms/:farmId/financial-summary', CapitalController.getOverallFinancialSummary);


export default router;