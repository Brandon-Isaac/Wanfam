import { Router } from 'express';
import { authenticate } from '../middleware/Auth';
import {
    createRevenue,
    getFarmRevenues,
    getRevenue,
    updateRevenue,
    deleteRevenue,
    getRevenueSummary,
    generateReccommendationsWithAi
} from '../controllers/RevenueController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Revenue CRUD
router.post('/', createRevenue);
router.get('/farm/:farmId', getFarmRevenues);
router.get('/farm/:farmId/summary', getRevenueSummary);
router.post('/:farmId/recommendations', generateReccommendationsWithAi);
router.get('/:id', getRevenue);
router.put('/:id', updateRevenue);
router.delete('/:id', deleteRevenue);

export default router;
