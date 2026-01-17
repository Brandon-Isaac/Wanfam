import { LoanApproval } from "../models/LoanApproval";
import { LoanOfficer } from "../models/Loan.Officer";
import { LoanRequest } from "../models/LoanRequest";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { User } from "../models/User";
import { notifyLoanApproval, notifyLoanRejection, notifyLoanRequest } from "../utils/notificationService";

// Update Loan Officer Details
const updateLoanOfficerDetails = asyncHandler(async (req: Request, res: Response) => {
   const officerSlug = req.params.officerSlug;
   const { bankName, ratePerAnnum } = req.body;

   const loanOfficer = await LoanOfficer.findOne({ officerSlug });
   if (!loanOfficer) {
       return res.status(404).json({ message: "Loan officer not found" });
   }

   loanOfficer.bankName = bankName;
   loanOfficer.ratePerAnnum = ratePerAnnum;

   await loanOfficer.save();

   res.status(200).json({ message: "Loan officer updated successfully", loanOfficer });
});

//Create Loan Request
const createLoanRequest = asyncHandler(async (req: Request, res: Response) => {
    const { userId, amountRequested, purpose, repaymentPeriod } = req.body;
    if (!userId || !amountRequested || !purpose || !repaymentPeriod) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'farmer') {
        return res.status(400).json({ message: "Loan requests can only be made by farmers" });
    }
    // Find an available loan officer to assign
    const loanOfficers = await LoanOfficer.find();
    const assignedOfficer = loanOfficers.length > 0 ? loanOfficers[0].userId : null;
    
    const loanRequest = new LoanRequest({
        userId,
        amountRequested,
        purpose,
        repaymentPeriod,
        loanOfficerId: assignedOfficer
    });
    await loanRequest.save();
    
    // Notify assigned loan officer about new request
    if (loanRequest.loanOfficerId) {
        await notifyLoanRequest(
            loanRequest.loanOfficerId,
            `${user.firstName} ${user.lastName}`,
            amountRequested,
            loanRequest._id.toString()
        );
    }
    
    res.status(201).json({ message: "Loan request created successfully", loanRequest });
});

// Approve Loan Request
const approveLoanRequest = asyncHandler(async (req: Request, res: Response) => {
    const { loanRequestId, approvedBy, approvedAmount, interestRate, repaymentSchedule } = req.body;
    if (!loanRequestId || !approvedBy || !approvedAmount || !interestRate || !repaymentSchedule) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) {
        return res.status(404).json({ message: "Loan request not found" });
    }
    if (loanRequest.status !== 'pending') {
        return res.status(400).json({ message: "Only pending loan requests can be approved" });
    }
    const loanOfficer = await User.findById(approvedBy);
    if (!loanOfficer || loanOfficer.role !== 'loan_officer') {
        return res.status(400).json({ message: "Approver must be a valid loan officer" });
    }
    const loanApproval = new LoanApproval({
        loanRequestId,
        approvedBy,
        approvedAmount,
        interestRate,
        repaymentSchedule
    });
    await loanApproval.save();
    loanRequest.status = 'approved';
    await loanRequest.save();
    
    // Assign the approved loan to the loan officer
    const officerRecord = await LoanOfficer.findOne({ userId: approvedBy });
    if (officerRecord) {
        officerRecord.approvedLoans.push(loanApproval.loanRequestId);
        await officerRecord.save();
    }
    
    // Notify farmer about loan approval
    await notifyLoanApproval(
        loanRequest.farmerId,
        approvedAmount,
        loanApproval._id.toString()
    );
    
    res.status(201).json({ message: "Loan request approved successfully", loanApproval });
});

//get Loan Requests
const getLoanRequests = asyncHandler(async (req: Request, res: Response) => {
    const loanRequests = await LoanRequest.find().populate('farmerId', 'name email').populate('loanOfficerId', 'name email');
    res.status(200).json({ loanRequests });
});

//get loan officers
const getLoanOfficers = asyncHandler(async (req: Request, res: Response) => {
    const loanOfficers = await LoanOfficer.find().populate('userId', 'name email bankName branch');
    res.status(200).json({ loanOfficers });
});

//get Approved Loans by Officer
const getApprovedLoansByOfficer = asyncHandler(async (req: Request, res: Response) => {
    const officerSlug = req.params.officerSlug;
    const loanOfficer = await LoanOfficer.findOne({ officerSlug }).populate({
        path: 'approvedLoans',
        populate: { path: 'loanRequestId', populate: { path: 'userId', select: 'name email' } }
    });
    if (!loanOfficer) {
        return res.status(404).json({ message: "Loan officer not found" });
    }
    res.status(200).json({ approvedLoans: loanOfficer.approvedLoans });
}
);

//get approved Loans by Farmer
const getApprovedLoansByFarmer = asyncHandler(async (req: Request, res: Response) => {
    const farmerId= req.user?._id;
    if (!farmerId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const loanRequests = await LoanRequest.find({ userId: farmerId, status: 'approved' }).populate('loanOfficerId', 'name email');
    res.status(200).json({ approvedLoans: loanRequests });
});

// Reject Loan Request
const rejectLoanRequest = asyncHandler(async (req: Request, res: Response) => {
    const { loanRequestId, rejectedBy, reason } = req.body;
    if (!loanRequestId || !rejectedBy) {
        return res.status(400).json({ message: "Loan request ID and rejector ID are required" });
    }
    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) {
        return res.status(404).json({ message: "Loan request not found" });
    }
    if (loanRequest.status !== 'pending') {
        return res.status(400).json({ message: "Only pending loan requests can be rejected" });
    }
    const loanOfficer = await User.findById(rejectedBy);
    if (!loanOfficer || loanOfficer.role !== 'loan_officer') {
        return res.status(400).json({ message: "Rejector must be a valid loan officer" });
    }
    
    loanRequest.status = 'rejected';
    await loanRequest.save();
    
    // Notify farmer about loan rejection
    await notifyLoanRejection(
        loanRequest.farmerId,
        loanRequest._id.toString(),
        reason
    );
    
    res.status(200).json({ message: "Loan request rejected successfully", loanRequest });
});



export const LoanController = {
    updateLoanOfficerDetails,
    createLoanRequest,
    approveLoanRequest,
    rejectLoanRequest,
    getLoanRequests,
    getLoanOfficers,
    getApprovedLoansByOfficer,
    getApprovedLoansByFarmer
};