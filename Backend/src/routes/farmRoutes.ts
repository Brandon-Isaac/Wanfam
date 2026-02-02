import express from 'express';
import farmController from '../controllers/FarmController';
import { authenticate } from '../middleware/Auth';
import { roleHandler } from '../middleware/roleHandler';
import { UserRole } from '../models/UserRole';
import { auditMiddleware } from '../middleware/auditMiddleware';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Farm management routes (only farmers can manage their farms, admins can view all)
router.get('/', roleHandler([UserRole.FARMER, UserRole.ADMIN]), farmController.getFarms);
router.get('/:farmId', roleHandler([UserRole.FARMER, UserRole.ADMIN]), farmController.getFarmById);
router.post('/', auditMiddleware('CREATE', 'Farm'), roleHandler([UserRole.FARMER]), farmController.createFarm);
router.put('/:farmId', auditMiddleware('UPDATE', 'Farm'), roleHandler([UserRole.FARMER]), farmController.updateFarm);
router.patch('/:farmId/deactivate', auditMiddleware('DEACTIVATE', 'Farm'), roleHandler([UserRole.FARMER]), farmController.deactivateFarm);
router.delete('/:farmId', auditMiddleware('DELETE', 'Farm'), roleHandler([UserRole.FARMER]), farmController.deleteFarm);

// Worker management
router.post('/:farmId/workers', auditMiddleware('CREATE', 'FarmWorker'), roleHandler([UserRole.FARMER]), farmController.assignWorker);
router.get('/:farmId/workers', roleHandler([UserRole.FARMER]), farmController.getFarmWorkers);

// Veterinarian management
router.post('/:farmId/veterinarians', auditMiddleware('CREATE', 'Veterinarian'), roleHandler([UserRole.FARMER]), farmController.assignVeterinarian);
router.get('/:farmId/veterinarians', roleHandler([UserRole.FARMER]), farmController.getFarmVeterinarians);

export default router;