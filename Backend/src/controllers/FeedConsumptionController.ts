import {FeedingRecord} from "../models/FeedingRecord";
import {FeedingSchedule} from "../models/FeedingSchedule";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";

const recordFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    const { date, feedingScheduleId, quantity, unit, feedingTime, notes } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    
    const newRecord = new FeedingRecord({ 
        farmId, 
        animalId, 
        feedingScheduleId,
        fedBy: req.user.id,
        date: date ? new Date(date) : new Date(), 
        quantity, 
        unit,
        feedingTime: feedingTime ? new Date(feedingTime) : new Date(),
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
            feedingTime: feedingTime ? new Date(feedingTime) : new Date(),
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
    const schedule = await FeedingSchedule.findById(scheduleId);
    if (!schedule) {
        return res.status(404).json({ message: "Feeding Schedule not found" });
    }
    
    // Check if schedule has already been executed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingRecords = await FeedingRecord.findOne({
        feedingScheduleId: scheduleId,
        date: { $gte: today, $lt: tomorrow }
    });
    
    if (existingRecords) {
        return res.status(400).json({ 
            message: "This feeding schedule has already been executed today. It can only be executed once per day.",
            alreadyExecuted: true
        });
    }
    
    const currentTime = new Date();
    const currentHour = currentTime.getHours().toString().padStart(2, '0');
    const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;
    
    const records = [];
    for (const animalId of schedule.animalIds) {
        const newRecord = new FeedingRecord({
            farmId: schedule.farmId,
            animalId,
            feedingScheduleId: schedule._id,
            fedBy: req.user.id,
            date: new Date(),
            quantity: schedule.quantity,
            unit: schedule.unit,
            feedingTime: schedule.feedingTimes && schedule.feedingTimes.length > 0 ? schedule.feedingTimes[0] : currentTimeString,
            notes: `Automated record from schedule: ${schedule.scheduleName}`
        });
        await newRecord.save();
        records.push(newRecord);
    }
    const totalAmountFed = records.reduce((sum, record) => sum + record.quantity, 0);
    console.log(`Total amount fed for schedule ${scheduleId}: ${totalAmountFed} ${schedule.unit}`);
    
    res.status(201).json({ success: true, data: records, totalAmountFed });
});

export const FeedConsumptionController = {
    recordFeedConsumption,
    recordFeedConsumptionByMultipleAnimals,
    getFeedConsumptionByAnimal,
    getConsumptionByFarm,
    updateFeedConsumption,
    deleteFeedConsumption,
    executeTodaysFeedSchedule,
    executeFeedingSchedule
};