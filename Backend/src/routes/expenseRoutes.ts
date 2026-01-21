import { Router } from 'express';
import { authenticate } from '../middleware/Auth';
import {
    createExpense,
    getFarmExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary
} from '../controllers/ExpenseController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Expense CRUD
router.post('/', createExpense);
router.get('/farm/:farmId', getFarmExpenses);
router.get('/farm/:farmId/summary', getExpenseSummary);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
