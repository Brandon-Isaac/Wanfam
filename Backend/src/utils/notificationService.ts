import { Notification } from "../models/Notification";
import { Schema } from "mongoose";

//  Centralized Notification Service
//  Handles automatic notification creation for various system events
interface NotificationData {
    userId: Schema.Types.ObjectId | string;
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success' | 'task' | 'treatment' | 'health_record' | 'animal_registration' | 'loan_approval' | 'loan_request' | 'loan_rejection' | 'revenue' | 'expense' | 'vaccination' | 'checkup_reminder';
    relatedEntityId?: Schema.Types.ObjectId | string;
    relatedEntityType?: string;
}

//  Create a notification
export const createNotification = async (data: NotificationData) => {
    try {
        const notification = new Notification({
            userId: data.userId,
            message: data.message,
            type: data.type,
            relatedEntityId: data.relatedEntityId,
            relatedEntityType: data.relatedEntityType
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

//  Create bulk notifications for multiple users
export const createBulkNotifications = async (notifications: NotificationData[]) => {
    try {
        const notificationDocs = notifications.map(data => ({
            userId: data.userId,
            message: data.message,
            type: data.type,
            relatedEntityId: data.relatedEntityId,
            relatedEntityType: data.relatedEntityType,
            isRead: false
        }));
        await Notification.insertMany(notificationDocs);
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        throw error;
    }
};

// Notify when a task is assigned
export const notifyTaskAssignment = async (
    workerId: Schema.Types.ObjectId | string,
    taskTitle: string,
    taskId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: workerId,
        message: `You have been assigned a new task: ${taskTitle}`,
        type: 'task',
        relatedEntityId: taskId,
        relatedEntityType: 'task'
    });
};

// Notify when a task is completed
export const notifyTaskCompletion = async (
    farmerId: Schema.Types.ObjectId | string,
    taskTitle: string,
    workerName: string,
    taskId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Task "${taskTitle}" has been completed by ${workerName}`,
        type: 'success',
        relatedEntityId: taskId,
        relatedEntityType: 'task'
    });
};


// Notify when an animal is registered
export const notifyAnimalRegistration = async (
    farmerId: Schema.Types.ObjectId | string,
    animalTag: string,
    species: string,
    animalId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `New ${species} registered successfully (Tag: ${animalTag})`,
        type: 'animal_registration',
        relatedEntityId: animalId,
        relatedEntityType: 'animal'
    });
};


// Notify when an animal's health status changes
export const notifyHealthStatusChange = async (
    farmerId: Schema.Types.ObjectId | string,
    animalTag: string,
    newStatus: string,
    animalId: Schema.Types.ObjectId | string
) => {
    const type = newStatus === 'sick' ? 'alert' : 'info';
    const message = newStatus === 'sick' 
        ? `Animal ${animalTag} is now sick. Immediate attention required!`
        : `Animal ${animalTag} health status updated to: ${newStatus}`;
    
    return createNotification({
        userId: farmerId,
        message,
        type,
        relatedEntityId: animalId,
        relatedEntityType: 'animal'
    });
};

// Notify when a treatment is scheduled
export const notifyTreatmentSchedule = async (
    vetId: Schema.Types.ObjectId | string,
    animalTag: string,
    scheduleName: string,
    scheduleId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: vetId,
        message: `Treatment scheduled for animal ${animalTag}: ${scheduleName}`,
        type: 'treatment',
        relatedEntityId: scheduleId,
        relatedEntityType: 'treatment_schedule'
    });
};

// Notify when a vaccination is due
export const notifyVaccinationDue = async (
    farmerId: Schema.Types.ObjectId | string,
    animalTag: string,
    vaccineName: string,
    dueDate: Date,
    scheduleId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Vaccination due for animal ${animalTag}: ${vaccineName} on ${dueDate.toLocaleDateString()}`,
        type: 'vaccination',
        relatedEntityId: scheduleId,
        relatedEntityType: 'vaccination_schedule'
    });
};

 // Notify when a checkup is approaching
export const notifyCheckupReminder = async (
    farmerId: Schema.Types.ObjectId | string,
    animalTag: string,
    checkupDate: Date,
    animalId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Upcoming checkup for animal ${animalTag} on ${checkupDate.toLocaleDateString()}`,
        type: 'checkup_reminder',
        relatedEntityId: animalId,
        relatedEntityType: 'animal'
    });
};

// Notify farmer when loan is approved
export const notifyLoanApproval = async (
    farmerId: Schema.Types.ObjectId | string,
    approvedAmount: number,
    loanId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Your loan application has been approved! Amount: KES ${approvedAmount.toLocaleString()}`,
        type: 'loan_approval',
        relatedEntityId: loanId,
        relatedEntityType: 'loan_approval'
    });
};
// Notify farmer when loan is rejected
export const notifyLoanRejection = async (
    farmerId: Schema.Types.ObjectId | string,
    loanRequestId: Schema.Types.ObjectId | string,
    reason?: string
) => {
    const message = reason 
        ? `Your loan application has been rejected. Reason: ${reason}`
        : `Your loan application has been rejected. Please contact your loan officer for details.`;
    
    return createNotification({
        userId: farmerId,
        message,
        type: 'loan_rejection',
        relatedEntityId: loanRequestId,
        relatedEntityType: 'loan_request'
    });
};

// Notify loan officer about new loan request
export const notifyLoanRequest = async (
    loanOfficerId: Schema.Types.ObjectId | string,
    farmerName: string,
    amount: number,
    loanRequestId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: loanOfficerId,
        message: `New loan request from ${farmerName} for KES ${amount.toLocaleString()}`,
        type: 'loan_request',
        relatedEntityId: loanRequestId,
        relatedEntityType: 'loan_request'
    });
};

// Notify when revenue is recorded
export const notifyRevenueRecorded = async (
    farmerId: Schema.Types.ObjectId | string,
    amount: number,
    source: string,
    revenueId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Revenue recorded: KES ${amount.toLocaleString()} from ${source}`,
        type: 'success',
        relatedEntityId: revenueId,
        relatedEntityType: 'revenue'
    });
};

// Notify when a large expense is recorded
export const notifyLargeExpense = async (
    farmerId: Schema.Types.ObjectId | string,
    amount: number,
    category: string,
    expenseId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Large expense recorded: KES ${amount.toLocaleString()} for ${category}`,
        type: 'warning',
        relatedEntityId: expenseId,
        relatedEntityType: 'expense'
    });
};

// Notify when inventory is low
export const notifyLowInventory = async (
    farmerId: Schema.Types.ObjectId | string,
    itemName: string,
    currentQuantity: number,
    inventoryId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Low inventory alert: ${itemName} (${currentQuantity} remaining)`,
        type: 'warning',
        relatedEntityId: inventoryId,
        relatedEntityType: 'inventory'
    });
};

// Notify when feed consumption is unusually high
export const notifyHighFeedConsumption = async (
    farmerId: Schema.Types.ObjectId | string,
    consumptionAmount: number,
    date: Date
) => {
    return createNotification({
        userId: farmerId,
        message: `High feed consumption detected: ${consumptionAmount} kg on ${date.toLocaleDateString()}`,
        type: 'warning',
        relatedEntityId: undefined,
        relatedEntityType: 'feed_consumption'
    });
};

// Notify when wage payment is processed
export const notifyWagePayment = async (
    workerId: Schema.Types.ObjectId | string,
    amount: number,
    period: string,
    wageId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: workerId,
        message: `Wage payment processed: KES ${amount.toLocaleString()} for ${period}`,
        type: 'success',
        relatedEntityId: wageId,
        relatedEntityType: 'wage'
    });
};

// Notify about upcoming task
export const notifyUpcomingTask = async (
    workerId: Schema.Types.ObjectId | string,
    taskTitle: string,
    dueDate: Date,
    taskId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: workerId,
        message: `Reminder: Task "${taskTitle}" is due on ${dueDate.toLocaleDateString()}`,
        type: 'info',
        relatedEntityId: taskId,
        relatedEntityType: 'task'
    });
};

// Notify about animal death
export const notifyAnimalDeath = async (
    farmerId: Schema.Types.ObjectId | string,
    animalTag: string,
    species: string,
    animalId: Schema.Types.ObjectId | string
) => {
    return createNotification({
        userId: farmerId,
        message: `Animal death recorded: ${species} (Tag: ${animalTag})`,
        type: 'alert',
        relatedEntityId: animalId,
        relatedEntityType: 'animal'
    });
};

// Notify all farm workers about a general event
export const notifyAllFarmWorkers = async (
    workerIds: (Schema.Types.ObjectId | string)[],
    message: string,
    farmId: Schema.Types.ObjectId | string
) => {
    const notifications = workerIds.map(workerId => ({
        userId: workerId,
        message,
        type: 'info' as const,
        relatedEntityId: farmId,
        relatedEntityType: 'farm'
    }));
    
    return createBulkNotifications(notifications);
};

export default {
    createNotification,
    createBulkNotifications,
    notifyTaskAssignment,
    notifyTaskCompletion,
    notifyAnimalRegistration,
    notifyHealthStatusChange,
    notifyTreatmentSchedule,
    notifyVaccinationDue,
    notifyCheckupReminder,
    notifyLoanApproval,
    notifyLoanRejection,
    notifyLoanRequest,
    notifyRevenueRecorded,
    notifyLargeExpense,
    notifyLowInventory,
    notifyHighFeedConsumption,
    notifyWagePayment,
    notifyUpcomingTask,
    notifyAnimalDeath,
    notifyAllFarmWorkers
};
