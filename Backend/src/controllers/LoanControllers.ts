import { LoanApproval } from "../models/LoanApproval";
import { LoanOfficer } from "../models/Loan.Officer";
import { LoanRequest } from "../models/LoanRequest";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { User } from "../models/User";
import { Revenue } from "../models/Revenue";
import { Notification } from "../models/Notification";

// Update Loan Officer Details
const updateLoanOfficerDetails = asyncHandler(async (req: Request, res: Response) => {
   const officerId = req.params.officerId;
   const { bankName, ratePerAnnum } = req.body;

   const loanOfficer = await LoanOfficer.findOne({ _id: officerId });
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
    const { userId, farmId, amountRequested, purpose, repaymentPeriod, employmentStatus, collateralDetails, businessPlan, loanOfficerId } = req.body;
    
    if (!userId || !farmId || !amountRequested || !purpose || !repaymentPeriod || !employmentStatus || !collateralDetails || !businessPlan || !loanOfficerId) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'farmer') {
        return res.status(400).json({ message: "Loan requests can only be made by farmers" });
    }
    
    const loanOfficer = await User.findById(loanOfficerId);
    if (!loanOfficer || loanOfficer.role !== 'loan_officer') {
        return res.status(400).json({ message: "Invalid loan officer" });
    }
    
    const loanRequest = new LoanRequest({
        farmerId: userId,
        farmId,
        loanOfficerId,
        amount: amountRequested,
        purpose,
        repaymentTerm: repaymentPeriod,
        employmentStatus,
        collateralDetails,
        businessPlan
    });
    
    await loanRequest.save();
    
    // Send notification to loan officer
    await Notification.create({
        userId: loanOfficerId,
        message: `New loan request of ${amountRequested} KES from ${user.firstName} ${user.lastName} for ${purpose}. Request ID: ${loanRequest._id}`,
        type: 'loan_request',
        relatedEntityId: loanRequest._id,
        relatedEntityType: 'LoanRequest'
    });
    
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
    
    // Create loan approval record
    const loanApproval = new LoanApproval({
        loanRequestId,
        approvedBy,
        approvedAmount,
        interestRate,
        repaymentSchedule
    });
    await loanApproval.save();
    
    // Update loan request status
    loanRequest.status = 'approved';
    await loanRequest.save();
    
    // Create revenue record for the approved loan
    const revenue = new Revenue({
        farmId: loanRequest.farmId,
        source: 'loan',
        category: 'loan_disbursement',
        amount: approvedAmount,
        currency: 'KES', // Default currency, can be made dynamic
        date: new Date(),
        description: `Loan disbursement - ${loanRequest.purpose}`,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'completed',
        receiptNumber: loanApproval.loanSlug,
        recordedBy: approvedBy,
        notes: `Approved loan with ${interestRate}% interest rate, ${repaymentSchedule} repayment schedule`
    });
    await revenue.save();
    
    // Assign the approved loan to the loan officer
    const officerRecord = await LoanOfficer.findOne({ userId: approvedBy });
    if (officerRecord) {
        officerRecord.approvedLoans.push(loanApproval.loanRequestId);
        await officerRecord.save();
    }
    
    // Send notification to farmer about loan approval and revenue addition
    await Notification.create({
        userId: loanRequest.farmerId,
        message: `Your loan request for ${approvedAmount} KES has been approved and added to your farm revenue. Loan ID: ${loanApproval.loanSlug}`,
        type: 'loan_approval',
        relatedEntityId: loanApproval._id,
        relatedEntityType: 'LoanApproval'
    });
    
    // Send notification about revenue addition
    await Notification.create({
        userId: loanRequest.farmerId,
        message: `Revenue of ${approvedAmount} KES from loan disbursement has been added to your farm records.`,
        type: 'revenue',
        relatedEntityId: revenue._id,
        relatedEntityType: 'Revenue'
    });
    
    res.status(201).json({ 
        message: "Loan request approved successfully and revenue recorded", 
        loanApproval,
        revenue 
    });
});

//get Loan Requests
const getLoanRequests = asyncHandler(async (req: Request, res: Response) => {
    const loanRequests = await LoanRequest.find().populate('farmerId', 'name email').populate('loanOfficerId', 'name email');
    res.status(200).json({ loanRequests });
});

//get loan officers
const getLoanOfficers = asyncHandler(async (req: Request, res: Response) => {
    // Get all users with loan_officer role
    const loanOfficers = await User.find({ role: 'loan_officer' }).select('firstName lastName email phoneNumber');
    
    res.status(200).json({ loanOfficers });
});

//get Approved Loans by Officer
const getApprovedLoansByOfficer = asyncHandler(async (req: Request, res: Response) => {
    const officerId = req.params.officerId;
    const loanOfficer = await LoanOfficer.findOne({ _id: officerId }).populate({
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
    const { loanRequestId, rejectedBy, rejectionReason } = req.body;
    
    if (!loanRequestId || !rejectedBy || !rejectionReason) {
        return res.status(400).json({ message: "All fields are required" });
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
    
    // Update loan request status
    loanRequest.status = 'rejected';
    await loanRequest.save();
    
    // Send notification to farmer about loan rejection
    await Notification.create({
        userId: loanRequest.farmerId,
        message: `Your loan request for ${loanRequest.amount} KES has been rejected. Reason: ${rejectionReason}`,
        type: 'loan_rejection',
        relatedEntityId: loanRequest._id,
        relatedEntityType: 'LoanRequest'
    });
    
    res.status(200).json({ 
        message: "Loan request rejected successfully", 
        loanRequest
    });
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