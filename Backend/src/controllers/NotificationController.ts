import { Notification } from "../models/Notification";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { User } from "../models/User";
import { TreatmentSchedule } from "../models/TreatmentSchedule";
import { HealthRecord } from "../models/HealthRecord";
import { Farm } from "../models/Farm";
import { Task } from "../models/Task";
import { LoanApproval } from "../models/LoanApproval";
import { LoanRequest } from "../models/LoanRequest";

// Create a new notification
const createNotification = asyncHandler(async (req: Request, res: Response) => {
    const { userId, message, type, relatedEntityId, relatedEntityType } = req.body;
    if (!userId || !message) {
        return res.status(400).json({ message: "User ID and message are required" });
    }
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const notification = new Notification({
        userId,
        message,
        type,
        relatedEntityId,
        relatedEntityType
    });
    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
}
);

//Create task notification for farm worker once a task is assigned to them
const createTaskNotification = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.body;
    if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
    }
    const task = await Task.findById(taskId).populate('assignedTo');
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    if (!task.assignedTo) {
        return res.status(400).json({ message: "Task is not assigned to any worker" });
    }
    const notification = new Notification({
        userId: task.assignedTo,
        message: `You have been assigned a new task: ${task.title}`,
        type: "task",
        relatedEntityId: task._id,
        relatedEntityType: "task"
    });
    await notification.save();
    res.status(201).json({ message: "Task notification created", notification });
});

//Create a treatment notification for vet once a treatment is assigned to them
const createTreatmentNotification = asyncHandler(async (req: Request, res: Response) => {
    const { treatmentScheduleId } = req.body;
    if (!treatmentScheduleId) {
        return res.status(400).json({ message: "Treatment Schedule ID is required" });
    }
    const treatmentSchedule = await TreatmentSchedule.findById(treatmentScheduleId).populate('administeredBy');
    if (!treatmentSchedule) {
        return res.status(404).json({ message: "Treatment Schedule not found" });
    }
    const notification = new Notification({
        userId: treatmentSchedule.administeredBy,
        message: `A new treatment has been scheduled: ${treatmentSchedule.scheduleName}`,
        type: "treatment",
        relatedEntityId: treatmentSchedule._id,
        relatedEntityType: "treatment"
    });
    await notification.save();
    res.status(201).json({ message: "Treatment notification created", notification });
});

//Create a health record notification for vet once a health record is created
const createHealthRecordNotification = asyncHandler(async (req: Request, res: Response) => {
    const { healthRecordId } = req.body;
    if (!healthRecordId) {
        return res.status(400).json({ message: "Health Record ID is required" });
    }
    const healthRecord = await HealthRecord.findById(healthRecordId).populate('recordedBy');
    if (!healthRecord) {
        return res.status(404).json({ message: "Health Record not found" });
    }
    const notification = new Notification({
        userId: healthRecord.treatedBy,
        message: `A new health record has been created for animal ID: ${healthRecord.animalId}`,
        type: "health_record",
        relatedEntityId: healthRecord._id,
        relatedEntityType: "health_record"
    });
    await notification.save();
    res.status(201).json({ message: "Health record notification created", notification });
});

//Create a notification once ana animal is registered successfully
const createAnimalRegistrationNotification = asyncHandler(async (req: Request, res: Response) => {
    const { animalId, farmId } = req.body;
    if (!animalId || !farmId) {
        return res.status(400).json({ message: "Animal ID and Farm ID are required" });
    }
    const farm = await Farm.findById(farmId).populate('owner');
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const notification = new Notification({
        userId: farm.owner,
        message: `A new animal has been registered in your farm: ${animalId}`,
        type: "animal_registration",
        relatedEntityId: animalId,
        relatedEntityType: "animal"
    });
    await notification.save();
    res.status(201).json({ message: "Animal registration notification created", notification });
});

// Get notifications for a user
const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
});

// Mark a notification as read
const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notificationId = req.params.id;   
    if (!notificationId) {
        return res.status(400).json({ message: "Notification ID is required" });
    }
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as read", notification });
});

const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const notificationId = req.params.id;
    if (!notificationId) {
        return res.status(400).json({ message: "Notification ID is required" });
    }
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    await notification.deleteOne();
    res.status(200).json({ message: "Notification deleted successfully" });
});

const clearAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    await Notification.deleteMany({ userId });
    res.status(200).json({ message: "All notifications cleared" });
}
);

//notify farmer when their loan is approved
const createLoanApprovalNotification = asyncHandler(async (req: Request, res: Response) => {
    const { loanApprovalId } = req.body;
    if (!loanApprovalId) {
        return res.status(400).json({ message: "Loan approval ID is required" });
    }
    const loanApproval = await LoanApproval.findById(loanApprovalId).populate('loanRequestId');
    if (!loanApproval) {
        return res.status(404).json({ message: "Loan approval not found" });
    }
    if (!loanApproval.loanRequestId) {
        return res.status(400).json({ message: "Loan request not found for this approval" });
    }
    const loanRequest = await LoanRequest.findById(loanApproval.loanRequestId).populate('userId');
    if (!loanRequest) {
        return res.status(404).json({ message: "Loan request not found" });
    }
    if (!loanRequest.farmerId) {
        return res.status(400).json({ message: "User not found for this loan request" });
    }
    const notification = new Notification({
        userId: loanRequest.farmerId,
        message: `Your loan request ${loanRequest._id} has been approved`,
        type: "loan_approval",
        relatedEntityId: loanRequest._id,
        relatedEntityType: "loan_request"
    });
    await notification.save();
    res.status(201).json({ message: "Loan approval notification created", notification });
});

//loan request notification to loan officer when a farmer creates a loan request
const createLoanRequestNotification = asyncHandler(async (req: Request, res: Response) => {
    const { loanRequestId } = req.body;
    if (!loanRequestId) {
        return res.status(400).json({ message: "Loan request ID is required" });
    }
    const loanRequest = await LoanRequest.findById(loanRequestId).populate('loanOfficerId');
    if (!loanRequest) {
        return res.status(404).json({ message: "Loan request not found" });
    }
    if (!loanRequest.loanOfficerId) {
        return res.status(400).json({ message: "Loan officer not assigned for this request" });
    }   
    const notification = new Notification({
        userId: loanRequest.loanOfficerId,
        message: `A new loan request has been created by farmer ID: ${loanRequest.farmerId}`,
        type: "loan_request",
        relatedEntityId: loanRequest._id,
        relatedEntityType: "loan_request"
    });
    await notification.save();
    res.status(201).json({ message: "Loan request notification created", notification });
});

export const NotificationController = {
    getUserNotifications,
    createAnimalRegistrationNotification,
    createHealthRecordNotification,
    createLoanApprovalNotification,
    createLoanRequestNotification,
    createNotification,
    createTaskNotification,
    createTreatmentNotification,
    markNotificationAsRead,
    deleteNotification,
    clearAllNotifications
};