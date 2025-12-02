import { FeedingSchedule } from "../models/FeedingSchedule";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Request, Response } from "express";
import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import { User } from "../models/User";


const createFeedConsumptionSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalSlug = req.params.animalSlug;
    const animal = await Animal.findOne({ slug: animalSlug, farmId: farm._id });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const {scheduleName,feedType,quantity,unit,frequency,startDate,endDate,feedingTime,notes,reminders} = req.body;
    const newFeedingSchedule = new FeedingSchedule({
        farmId: farm._id,
        animalId: [animal._id],
        scheduleName,
        feedType,
        quantity,
        unit,
        frequency,
        startDate,
        endDate,
        feedingTime,
        notes,
        reminders
    });
    await newFeedingSchedule.save();
    res.status(201).json({ success: true, data: newFeedingSchedule });
});

const createFeedConsumptionScheduleForMultipleAnimals = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const { animalIds, scheduleName, feedType, quantity, unit, frequency, startDate, endDate, feedingTime, notes, reminders } = req.body;
    const validAnimalIds = await Animal.find({ _id: { $in: animalIds }, farmId: farm._id }).select('_id');
    if (validAnimalIds.length === 0) {
        return res.status(400).json({ message: "No valid animals found for the provided IDs" });
    }

    const feedingSchedules = new FeedingSchedule({
            farmId: farm._id,
            animalId: animalIds,
            scheduleName,
            feedType,
            quantity,
            unit,
            frequency,
            startDate,
            endDate,
            feedingTime,
            notes,
            reminders
    });

    await FeedingSchedule.insertMany(feedingSchedules);
    res.status(201).json({ success: true, data: feedingSchedules });
});

const getFeedingSchedulesForAnimal = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalSlug = req.params.animalSlug;
    const animal = await Animal.findOne({ slug: animalSlug, farmId: farm._id });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const schedules = await FeedingSchedule.find({ animalId: animal._id });
    res.json({ success: true, data: schedules });
});

const getFeedingSchedulesForFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const schedules = await FeedingSchedule.find({ farmId: farm._id });
    res.json({ success: true, data: schedules });
});

const updateFeedingSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const scheduleSlug = req.params.scheduleSlug;
    const schedule = await FeedingSchedule.findOne({ slug: scheduleSlug, farmId: farm._id });
    if (!schedule) {
        return res.status(404).json({ message: "Feeding schedule not found" });
    } 
    const { scheduleName, feedType, quantity, unit, frequency, startDate, endDate, feedingTime, notes, reminders } = req.body;
    schedule.scheduleName = scheduleName || schedule.scheduleName;
    schedule.feedType = feedType || schedule.feedType;
    schedule.quantity = quantity || schedule.quantity;
    schedule.unit = unit || schedule.unit;
    schedule.frequency = frequency || schedule.frequency;
    schedule.startDate = startDate || schedule.startDate;
    schedule.endDate = endDate || schedule.endDate;
    schedule.feedingTime = feedingTime || schedule.feedingTime;
    schedule.notes = notes || schedule.notes;
    schedule.reminders = reminders !== undefined ? reminders : schedule.reminders;
    await schedule.save();
    res.json({ success: true, data: schedule });
});

const deleteFeedingSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const scheduleSlug = req.params.scheduleSlug;
    const schedule = await FeedingSchedule.findOne({ slug: scheduleSlug, farmId: farm._id });
    if (!schedule) {
        return res.status(404).json({ message: "Feeding schedule not found" });
    }
    await schedule.deleteOne();
    res.json({ success: true, message: "Feeding schedule deleted successfully" });
});

const executeFeedingSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalSlug = req.params.animalSlug;
    const animal = await Animal.findOne({ slug: animalSlug, farmId: farm._id });    
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const scheduleSlug = req.params.scheduleSlug;
    const schedule = await FeedingSchedule.findOne({ slug: scheduleSlug, farmId: farm._id, animalId: animal._id });
    if (!schedule) {
        return res.status(404).json({ message: "Feeding schedule not found" });
    }
    const { actualQuantity, notes, completedBy } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Update the schedule with execution data
    if (!schedule.executionHistory) {
        schedule.executionHistory = [];
    }
    
    schedule.executionHistory.push({
        executedDate: new Date(),
        actualQuantity: actualQuantity || schedule.quantity,
        notes: notes || '',
        completedBy: completedBy || req.user?.id,
        status: 'completed'
    });
    
    // Update last executed date
    schedule.lastExecuted = new Date();
    
    await schedule.save();
    res.json({ success: true, message: "Feeding schedule executed successfully" });
});

export const feedScheduleController = {
    createFeedConsumptionSchedule,
    createFeedConsumptionScheduleForMultipleAnimals,
    getFeedingSchedulesForAnimal,
    getFeedingSchedulesForFarm,
    updateFeedingSchedule,
    deleteFeedingSchedule,
    executeFeedingSchedule
};
