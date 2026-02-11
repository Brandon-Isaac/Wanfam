import { LoanController } from "../controllers/LoanControllers";
import Router from "express";
import { authenticate } from "../middleware/Auth";
import { UserRole } from "../models/UserRole";
import { roleHandler } from "../middleware/roleHandler";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create loan request - Farmers only
router.post(
    '/create', 
    roleHandler([UserRole.FARMER]), 
    LoanController.createLoanRequest
);

// Get all loan officers - Available to farmers and loan officers
router.get(
    '/loan-officers', 
    roleHandler([UserRole.FARMER, UserRole.LOAN_OFFICER, UserRole.ADMIN]), 
    LoanController.getLoanOfficers
);

// Get all loan requests - Loan officers and admins
router.get(
    '/requests', 
    roleHandler([UserRole.LOAN_OFFICER, UserRole.ADMIN]), 
    LoanController.getLoanRequests
);

// Approve loan request - Loan officers only
router.post(
    '/approve', 
    roleHandler([UserRole.LOAN_OFFICER]), 
    LoanController.approveLoanRequest
);

// Reject loan request - Loan officers only
router.post(
    '/reject', 
    roleHandler([UserRole.LOAN_OFFICER]), 
    LoanController.rejectLoanRequest
);

// Get approved loans for a specific officer
router.get(
    '/officer/:officerId/approved', 
    roleHandler([UserRole.LOAN_OFFICER, UserRole.ADMIN]), 
    LoanController.getApprovedLoansByOfficer
);

// Get approved loans for the authenticated farmer
router.get(
    '/farmer/approved', 
    roleHandler([UserRole.FARMER]), 
    LoanController.getApprovedLoansByFarmer
);

// Update loan officer details
router.put(
    '/officer/:officerId', 
    roleHandler([UserRole.LOAN_OFFICER, UserRole.ADMIN]), 
    LoanController.updateLoanOfficerDetails
);

export default router;
