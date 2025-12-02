import { Request, Response } from "express";
import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import {HealthRecord } from "../models/HealthRecord";
import { asyncHandler } from "../middleware/AsyncHandler";
import { User } from "../models/User";

const createHealthRecord = (asyncHandler(async(req: Request, res: Response) => {
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
    const UserId=req.user._id;
    const { recordType, description, diagnosis, treatment, medication, treatmentDate, recoveryDate, outcome, notes } = req.body;
    const user = await User.findById(UserId, 'firstName');
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const treatedBy = user.firstName;
    if (!recordType || !description) {
        return res.status(400).json({ message: "recordType and description are required" });
    }
    const newRecord = new HealthRecord({ farmId: farm._id, animalId: animal._id, recordType, description, diagnosis, treatment, medication, treatedBy, treatmentDate, recoveryDate, outcome, notes });
    await newRecord.save();
    const animalHealthStatus = await Animal.findById(animal._id);
    if (recordType.toLowerCase() === 'illness' || recordType.toLowerCase() === 'injury' || recordType.toLowerCase() === 'surgery') {
        animal.healthStatus = 'sick';
    }
    if (recordType.toLowerCase() === 'recovery' || recordType.toLowerCase() === 'completed') {
        animal.healthStatus = 'healthy';
    }
    await animalHealthStatus?.save();
    res.status(201).json({ success: true, data: newRecord });
}));

const updateWeightRecord = (asyncHandler(async(req: Request, res: Response) => {
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
    const healthRecordId = req.params.id;
    const healthRecord = await HealthRecord.findOne({ _id: healthRecordId, farmId: farm._id, animalId: animal._id });
    if (!healthRecord) {
        return res.status(404).json({ message: "Health record not found" });
    }
    const { weight } = req.body;
    if (!weight || !weight.amount || !weight.unit) {
        return res.status(400).json({ message: "Weight with amount and unit is required" });
    }
    healthRecord.weight = weight;
    await healthRecord.save();
    res.status(200).json({ success: true, data: healthRecord });
}));

const getHealthRecords = (asyncHandler(async(req: Request, res: Response) => {
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
    const healthRecords = await HealthRecord.find({ farmId: farm._id, animalId: animal._id });
    res.status(200).json({ success: true, data: healthRecords });
}));

const getHealthRecordById = (asyncHandler(async(req: Request, res: Response) => {
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
    const healthRecordId = req.params.id;
    const healthRecord = await HealthRecord.findOne({ _id: healthRecordId, farmId: farm._id, animalId: animal._id });
    if (!healthRecord) {
        return res.status(404).json({ message: "Health record not found" });
    }
    res.status(200).json({ success: true, data: healthRecord });
}));

const getFarmHealthRecords = (asyncHandler(async(req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const healthRecords = await HealthRecord.find({ farmId: farm._id });
    res.status(200).json({ success: true, data: healthRecords });
}));

const updateHealthRecord = (asyncHandler(async(req: Request, res: Response) => {
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
    const healthRecordSlug = req.params.id;
    const healthRecord = await HealthRecord.findOne({ slug: healthRecordSlug, farmId: farm._id, animalId: animal._id });
    if (!healthRecord) {
        return res.status(404).json({ message: "Health record not found" });
    }
    const { recordType, description, diagnosis, treatment, medication, treatmentDate, recoveryDate, outcome, notes } = req.body;
    if (recordType) healthRecord.recordType = recordType;
    if (description) healthRecord.description = description;
    if (diagnosis) healthRecord.diagnosis = diagnosis;
    if (treatment) healthRecord.treatment = treatment;
    if (medication) healthRecord.medication = medication;
    if (treatmentDate) healthRecord.treatmentDate = treatmentDate;
    if (recoveryDate) healthRecord.recoveryDate = recoveryDate;
    if (outcome) healthRecord.outcome = outcome;
    if (notes) healthRecord.notes = notes;
    await healthRecord.save();
    const animalHealthStatus = await Animal.findById(animal._id);
    if (recordType?.toLowerCase() === 'illness' || recordType?.toLowerCase() === 'injury' || recordType?.toLowerCase() === 'surgery') {
        animal.healthStatus = 'sick';
    }
    if (recordType?.toLowerCase() === 'recovery' || recordType?.toLowerCase() === 'completed') {
        animal.healthStatus = 'healthy';
    }
    await animalHealthStatus?.save();
    res.status(200).json({ success: true, data: healthRecord });
}));

const deleteHealthRecord = (asyncHandler(async(req: Request, res: Response) => {
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
    const healthRecordSlug = req.params.id;
    const healthRecord = await HealthRecord.findOne({ slug: healthRecordSlug, farmId: farm._id, animalId: animal._id });
    if (!healthRecord) {
        return res.status(404).json({ message: "Health record not found" });
    }
    await healthRecord.deleteOne();
    res.status(204).json({ success: true });
}));

export const healthController = {
    createHealthRecord,
    getHealthRecords,
    getHealthRecordById,
    getFarmHealthRecords,
    updateHealthRecord,
    deleteHealthRecord,
    updateWeightRecord
};