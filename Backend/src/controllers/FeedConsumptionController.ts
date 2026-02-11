import {FeedingRecord} from "../models/FeedingRecord";
import {FeedingSchedule} from "../models/FeedingSchedule";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Notification } from "../models/Notification";
import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import { Task } from "../models/Task";
import { User } from "../models/User";

const recordFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    const { date, feedingScheduleId, quantity, unit, feedingTime, notes } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Generate current time string if not provided
    const currentTime = new Date();
    const currentTimeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    const newRecord = new FeedingRecord({ 
        farmId, 
        animalId, 
        feedingScheduleId,
        fedBy: req.user.id,
        date: date ? new Date(date) : new Date(), 
        quantity, 
        unit,
        feedingTime: feedingTime || currentTimeString,
        notes 
    });
    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord });
});

const recordFeedConsumptionByMultipleAnimals = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { animalIds, date, feedingScheduleId, quantity, unit, feedingTime, notes } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Generate current time string if not provided
    const currentTime = new Date();
    const currentTimeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    const records = [];
    for (const animalId of animalIds) {
        const newRecord = new FeedingRecord({ 
            farmId, 
            animalId, 
            feedingScheduleId,
            fedBy: req.user.id,
            date: date ? new Date(date) : new Date(), 
            quantity, 
            unit,
            feedingTime: feedingTime || currentTimeString,
            notes 
        });
        await newRecord.save();
        records.push(newRecord);
    }
    res.status(201).json({ success: true, data: records });
});

const getFeedConsumptionByAnimal = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    const records = await FeedingRecord.find({ farmId, animalId });
    res.json({ success: true, data: records });
});

const getConsumptionByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const records = await FeedingRecord.find({ farmId });
    res.json({ success: true, data: records });
});

const updateFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    const recordId = req.params.recordId;
    const updateData = req.body;
    const record = await FeedingRecord.findOneAndUpdate({ _id: recordId, farmId, animalId }, updateData, { new: true, runValidators: true });
    if (!record) {
        return res.status(404).json({ message: "Feeding Record not found" });
    }
    res.json({ success: true, data: record });
});

const deleteFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    const recordId = req.params.recordId;
    const record = await FeedingRecord.findOneAndDelete({ _id: recordId, farmId, animalId });
    if (!record) {
        return res.status(404).json({ message: "Feeding Record not found" });
    }
    res.json({ success: true, data: record });
});

const executeTodaysFeedSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const schedules = await FeedingSchedule.find({ farmId });
    const records = [];
    const currentTime = new Date();
    const currentHour = currentTime.getHours().toString().padStart(2, '0');
    const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;
    
    for (const schedule of schedules) {
        for (const animalId of schedule.animalIds) {
            const newRecord = new FeedingRecord({
                farmId,
                animalId,
                feedingScheduleId: schedule._id,
                fedBy: req.user.id,
                date: today,
                quantity: schedule.quantity,
                unit: schedule.unit,
                feedingTime: schedule.feedingTimes && schedule.feedingTimes.length > 0 ? schedule.feedingTimes[0] : currentTimeString,
                notes: `Automated record from schedule: ${schedule.scheduleName}`
            });
            await newRecord.save();
            records.push(newRecord);
        }
    }
    const totalAmountFed = records.reduce((sum, record) => sum + record.quantity, 0);
    console.log(`Total amount fed today for farm ${farmId}: ${totalAmountFed}`);
    res.status(201).json({ success: true, data: records, totalAmountFed });
});

const executeFeedingSchedule = asyncHandler(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    
    const schedule = await FeedingSchedule.findById(scheduleId);
    if (!schedule) {
        return res.status(404).json({ message: "Feeding Schedule not found" });
    }
    
    // Check if schedule has already been executed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if tasks already exist for this schedule today
    const existingTasks = await Task.findOne({
        feedingScheduleId: scheduleId,
        createdAt: { $gte: today, $lt: tomorrow }
    });
    
    if (existingTasks) {
        return res.status(400).json({ 
            message: "Feeding tasks for this schedule have already been created today.",
            alreadyExecuted: true
        });
    }
    
    const currentTime = new Date();
    const currentHour = currentTime.getHours().toString().padStart(2, '0');
    const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;
    
    // Get farm and animals details
    const farm = await Farm.findById(schedule.farmId).populate('owner');
    const animals = await Animal.find({ _id: { $in: schedule.animalIds } }).populate('assignedWorker', 'firstName lastName');
    
    if (animals.length === 0) {
        return res.status(404).json({ message: "No animals found for this schedule" });
    }
    
    const tasks = [];
    const notifications = [];
    const unassignedAnimals = [];
    
    // Create a task for each animal assigned to a worker
    for (const animal of animals) {
        if (!animal.assignedWorker) {
            unassignedAnimals.push(animal.name || animal.tagId);
            continue;
        }
        
        const worker = animal.assignedWorker as any;
        const feedingTime = schedule.feedingTimes && schedule.feedingTimes.length > 0 ? schedule.feedingTimes[0] : currentTimeString;
        
        // Create feeding task
        const task = new Task({
            farmId: schedule.farmId,
            title: `Feed ${animal.name || animal.tagId}`,
            description: `Feed ${animal.name || animal.tagId} (${animal.species}) with ${schedule.quantity} ${schedule.unit} of ${schedule.feedType}`,
            assignedTo: [animal.assignedWorker],
            dueDate: new Date(),
            taskCategory: 'Feeding',
            status: 'Pending',
            priority: 'High',
            createdBy: req.user.id,
            animalId: animal._id,
            feedingScheduleId: schedule._id,
            feedingDetails: {
                feedType: schedule.feedType,
                quantity: schedule.quantity,
                unit: schedule.unit,
                feedingTime: feedingTime
            }
        });
        
        await task.save();
        tasks.push(task);
        
        // Create notification for the worker
        const workerNotification = new Notification({
            userId: animal.assignedWorker,
            message: `New feeding task assigned: Feed ${animal.name || animal.tagId} with ${schedule.quantity} ${schedule.unit} of ${schedule.feedType} at ${feedingTime}`,
            type: 'task',
            relatedEntityId: task._id,
            relatedEntityType: 'Task'
        });
        
        await workerNotification.save();
        notifications.push({
            worker: `${worker.firstName} ${worker.lastName}`,
            animal: animal.name || animal.tagId
        });
    }
    
    // Create notification for the farmer
    if (farm && farm.owner) {
        const taskSummary = notifications.map(n => `${n.animal} assigned to ${n.worker}`).join(', ');
        
        const farmerNotification = new Notification({
            userId: farm.owner,
            message: `Feeding schedule "${schedule.scheduleName}" has been assigned. Tasks created: ${taskSummary}${unassignedAnimals.length > 0 ? `. Warning: ${unassignedAnimals.join(', ')} have no assigned worker.` : ''}`,
            type: 'info',
            relatedEntityId: schedule._id,
            relatedEntityType: 'FeedingSchedule'
        });
        
        await farmerNotification.save();
    }
    
    res.status(201).json({ 
        success: true, 
        data: tasks,
        tasksCreated: tasks.length,
        notifications: notifications,
        unassignedAnimals: unassignedAnimals
    });
});

const completeFeedingTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Find the task
    const task = await Task.findById(taskId)
        .populate('animalId', 'name tagId species')
        .populate('feedingScheduleId');
    
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    
    // Verify the worker is assigned to this task
    const isAssigned = task.assignedTo?.some(userId => userId.toString() === req.user?.id);
    if (!isAssigned) {
        return res.status(403).json({ message: "You are not assigned to this task" });
    }
    
    // Check if task is already completed
    if (task.status === 'Completed') {
        return res.status(400).json({ message: "Task is already completed" });
    }
    
    const { actualQuantity, notes, feedCondition, animalResponse, weather } = req.body;
    
    // Create a feeding record
    const currentTime = new Date();
    const currentHour = currentTime.getHours().toString().padStart(2, '0');
    const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;
    
    const feedingRecord = new FeedingRecord({
        farmId: task.farmId,
        animalId: task.animalId,
        feedingScheduleId: task.feedingScheduleId,
        fedBy: req.user.id,
        date: new Date(),
        quantity: actualQuantity || task.feedingDetails?.quantity || 0,
        unit: task.feedingDetails?.unit || 'kg',
        feedingTime: task.feedingDetails?.feedingTime || currentTimeString,
        feedCondition: feedCondition || 'normal',
        animalResponse: animalResponse || 'neutral',
        weather: weather || 'normal',
        notes: notes || `Completed task: ${task.title}`
    });
    
    await feedingRecord.save();
    
    // Update task status to completed
    task.status = 'Completed';
    task.updatedAt = new Date();
    await task.save();
    
    // Get farm details and create notification for farmer
    const farm = await Farm.findById(task.farmId).populate('owner');
    const animal = task.animalId as any;
    const worker = await User.findById(req.user.id);
    
    if (farm && farm.owner) {
        const farmerNotification = new Notification({
            userId: farm.owner,
            message: `${animal.name || animal.tagId} has been fed by ${worker?.firstName} ${worker?.lastName}. ${actualQuantity || task.feedingDetails?.quantity} ${task.feedingDetails?.unit} of ${task.feedingDetails?.feedType} administered.`,
            type: 'success',
            relatedEntityId: feedingRecord._id,
            relatedEntityType: 'FeedingRecord'
        });
        
        await farmerNotification.save();
    }
    
    // Create confirmation notification for worker
    const workerNotification = new Notification({
        userId: req.user.id,
        message: `Feeding task completed successfully! ${animal.name || animal.tagId} has been marked as fed.`,
        type: 'success',
        relatedEntityId: task._id,
        relatedEntityType: 'Task'
    });
    
    await workerNotification.save();
    
    res.status(200).json({ 
        success: true, 
        message: "Feeding task completed successfully",
        data: {
            task,
            feedingRecord
        }
    });
});

export const FeedConsumptionController = {
    recordFeedConsumption,
    recordFeedConsumptionByMultipleAnimals,
    getFeedConsumptionByAnimal,
    getConsumptionByFarm,
    updateFeedConsumption,
    deleteFeedConsumption,
    executeTodaysFeedSchedule,
    executeFeedingSchedule,
    completeFeedingTask
};