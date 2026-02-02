import { FeedingSchedule } from "../models/FeedingSchedule";
import {FeedingRecord} from "../models/FeedingRecord";
import { Farm } from "../models/Farm";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Animal } from "../models/Animal";
import { ProductivityRecord } from "../models/ProductivityRecord";
import { User } from "../models/User";

const recordFeedConsumption = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    const { date, feedType, quantity, unit, notes } = req.body;
    const newRecord = new FeedingRecord({ farmId, animalId, date, feedType, quantity, unit, notes });
    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord });
});

const recordFeedConsumptionByMultipleAnimals = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { animalIds, date, feedType, quantity, unit, notes } = req.body;
    const records = [];
    for (const animalId of animalIds) {
        const newRecord = new FeedingRecord({ farmId, animalId, date, feedType, quantity, unit, notes });
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

export const FeedConsumptionController = {
    recordFeedConsumption,
    recordFeedConsumptionByMultipleAnimals,
    getFeedConsumptionByAnimal,
    getConsumptionByFarm,
    updateFeedConsumption,
    deleteFeedConsumption
};