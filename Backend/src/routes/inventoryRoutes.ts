import Router from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate } from '../middleware/Auth';
import { roleHandler } from '../middleware/roleHandler';
import { UserRole } from '../models/UserRole';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply role-based access control
router.use(roleHandler([UserRole.ADMIN, UserRole.FARMER]));

// Define routes
router.get('/:farmId/', InventoryController.getAllInventoryItems);
router.get('/:farmId/:id', InventoryController.getInventoryItemById);
router.post('/:farmId', InventoryController.createInventoryItem);
router.put('/:farmId/:id', InventoryController.updateInventoryItem);
router.delete('/:farmId/:id', InventoryController.deleteInventoryItem);

export default router;