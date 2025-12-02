import { FeedingSchedule } from "../models/FeedingSchedule";
import {FeedingRecord} from "../models/FeedingRecord";
import { Farm } from "../models/Farm";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Animal } from "../models/Animal";
import { ProductivityRecord } from "../models/ProductivityRecord";
import { User } from "../models/User";

const getFeedConsumptionByAnimal = asyncHandler(async (req: Request, res: Response) => {
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
    const records = await FeedingRecord.find({ animalId: animal._id });
    const totalFeed = records.reduce((acc, record) => acc + (record.quantity || 0), 0);
    res.json({ success: true, data: { totalFeed: { amount: totalFeed, unit: 'kg' } } });
});

const getConsumptionByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const records = await FeedingRecord.find({ farmId: farm._id });
    const totalFeed = records.reduce((acc, record) => acc + (record.quantity || 0), 0);
    res.json({ success: true, data: { totalFeed: { amount: totalFeed, unit: 'kg' } } });
});

const recordFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
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
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user= await User.findOne({ _id: userId });
    const { feedType, amount } = req.body;
    const newRecord = new FeedingRecord({ farmId: farm._id, animalId: animal._id, feedType, amount, fedBy: user?.firstName, date: new Date() });
    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord });
});

const recordFeedConsumptionByMultipleAnimals = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const { animalIds, feedType, amount } = req.body;
    const validAnimalIds = await Animal.find({ _id: { $in: animalIds }, farmId: farm._id }).select('_id');
    if (validAnimalIds.length === 0) {
        return res.status(400).json({ message: "No valid animals found for the provided IDs" });
    }

    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ _id: userId });

    const feedingRecords = validAnimalIds.map(animalId => {
        return new FeedingRecord({ farmId: farm._id, animalId: animalId._id, feedType, amount, fedBy: user?.firstName, date: new Date() });
    });

    await FeedingRecord.insertMany(feedingRecords);
    res.status(201).json({ success: true, data: feedingRecords });
});

const recordFeedConsumptionScheduled = asyncHandler(async (req: Request, res: Response) => {
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
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user= await User.findOne({ _id: userId });
    const { quantity, unit, feedingTime, feedCondition, animalResponse, weather, notes } = req.body;
    const newRecord = new FeedingRecord({ farmId: farm._id, animalId: schedule.animalId, feedingScheduleId: schedule._id, fedBy: user?.firstName, quantity, unit, feedingTime, feedCondition, animalResponse, weather, notes });
    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord });
});

const updateFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
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
    const recordSlug = req.params.recordSlug;
    const record = await FeedingRecord.findOne({ slug: recordSlug, animalId: animal._id });
    if (!record) {
        return res.status(404).json({ message: "Feeding record not found" });
    }   
    const { quantity, unit } = req.body;
    if (quantity !== undefined) record.quantity = quantity;
    if (unit !== undefined) record.unit = unit;
    await record.save();
    res.json({ success: true, data: record });
});

const deleteFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne
({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalSlug = req.params.animalSlug;
    const animal = await Animal.findOne({ slug: animalSlug, farmId: farm._id });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const recordSlug = req.params.recordSlug;
    const record = await FeedingRecord.findOne({ slug: recordSlug, animalId: animal._id });
    if (!record) {
        return res.status(404).json({ message: "Feeding record not found" });
    }
    await record.deleteOne();
    res.json({ success: true, message: "Feeding record deleted" });
});


export const feedConsumptionController = {
    getFeedConsumptionByAnimal,
    recordFeedConsumption,
    recordFeedConsumptionScheduled,
    recordFeedConsumptionByMultipleAnimals,
    getConsumptionByFarm,
    updateFeedConsumption,
    deleteFeedConsumption
};