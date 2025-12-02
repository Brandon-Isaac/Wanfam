import Router from 'express';
import { DashboardController} from '../controllers/DashboardController';
import { authenticate } from '../middleware/Auth';
import { UserRole } from '../models/UserRole';
import { roleHandler } from '../middleware/roleHandler';

const router = Router();
router.use(authenticate);

router.get('/farmer-dashboard/:farmId', roleHandler([UserRole.FARMER]), DashboardController.farmerDashboardForFarm);
router.get('/farmer-dashboard', roleHandler([UserRole.FARMER]), DashboardController.farmerDashboard);
router.get('/admin-dashboard', roleHandler([UserRole.ADMIN]), DashboardController.adminDashboard);
router.get('/veterinary-dashboard', roleHandler([UserRole.VETERINARY]), DashboardController.vetDashboard);
router.get('/worker-dashboard', roleHandler([UserRole.WORKER]), DashboardController.workerDashboard);
router.get('/officer-dashboard', roleHandler([UserRole.LOAN_OFFICER]), DashboardController.loanOfficerDashboard);

export default router;