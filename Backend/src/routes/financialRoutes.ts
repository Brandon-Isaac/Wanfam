import { Router } from 'express';
import { authenticate } from '../middleware/Auth';
import {
    getFinancialOverview,
    getProfitLossStatement,
    getCashFlow
} from '../controllers/FinancialController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Financial reports
router.get('/farm/:farmId/overview', getFinancialOverview);
router.get('/farm/:farmId/profit-loss', getProfitLossStatement);
router.get('/farm/:farmId/cashflow', getCashFlow);

export default router;
