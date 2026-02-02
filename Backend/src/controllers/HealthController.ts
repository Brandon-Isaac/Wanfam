import { Request, Response } from "express";
import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import { HealthRecord } from "../models/HealthRecord";
import { VaccinationRecord } from "../models/VaccinationRecord";
import { TreatmentRecord } from "../models/TreatmentRecord";
import { asyncHandler } from "../middleware/AsyncHandler";
import { User } from "../models/User";

const getAnimalHealthRecords = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    
    // Get all health-related records
    const [healthRecords, vaccinationRecords, treatmentRecords] = await Promise.all([
        HealthRecord.find({ animalId }),
        VaccinationRecord.find({ animalId }),
        TreatmentRecord.find({ animalId })
    ]);
    
    // Combine all records
    const allRecords = [
        ...healthRecords.map(r => ({
            ...r.toObject(),
            recordType: r.recordType || 'general',
            date: r.date
        })),
        ...vaccinationRecords.map(r => ({
            ...r.toObject(),
            recordType: 'vaccination',
            date: r.scheduledDate,
            diagnosis: r.vaccineName
        })),
        ...treatmentRecords.map(r => ({
            ...r.toObject(),
            recordType: 'treatment',
            date: r.treatmentDate,
            diagnosis: r.treatmentGiven
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json({ success: true, data: allRecords });
});

const getAllFarmHealthRecords = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animals = await Animal.find({ farmId });
    const animalIds = animals.map(a => a._id);
    
    // Get all health-related records for farm animals
    const [healthRecords, vaccinationRecords, treatmentRecords] = await Promise.all([
        HealthRecord.find({ animalId: { $in: animalIds } }).populate('animalId', 'name species breed'),
        VaccinationRecord.find({ animalId: { $in: animalIds } }).populate('animalId', 'name species breed'),
        TreatmentRecord.find({ animalId: { $in: animalIds } }).populate('animalId', 'name species breed')
    ]);
    
    // Combine all records
    const allRecords = [
        ...healthRecords.map(r => ({
            ...r.toObject(),
            recordType: r.recordType || 'general',
            date: r.date
        })),
        ...vaccinationRecords.map(r => ({
            ...r.toObject(),
            recordType: 'vaccination',
            date: r.scheduledDate,
            diagnosis: r.vaccineName
        })),
        ...treatmentRecords.map(r => ({
            ...r.toObject(),
            recordType: 'treatment',
            date: r.treatmentDate,
            diagnosis: r.treatmentGiven
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json({ success: true, data: allRecords });
});

const getAllSystemHealthRecords = asyncHandler(async (req: Request, res: Response) => {
    // Get all health-related records across the system
    const [healthRecords, vaccinationRecords, treatmentRecords] = await Promise.all([
        HealthRecord.find().populate('animalId', 'name species breed'),
        VaccinationRecord.find().populate('animalId', 'name species breed'),
        TreatmentRecord.find().populate('animalId', 'name species breed')
    ]);
    
    // Combine all records
    const allRecords = [
        ...healthRecords.map(r => ({
            ...r.toObject(),
            recordType: r.recordType || 'general',
            date: r.date
        })),
        ...vaccinationRecords.map(r => ({
            ...r.toObject(),
            recordType: 'vaccination',
            date: r.scheduledDate,
            diagnosis: r.vaccineName,
            healthStatus: 'vaccination'
        })),
        ...treatmentRecords.map(r => ({
            ...r.toObject(),
            recordType: 'treatment',
            date: r.treatmentDate,
            diagnosis: r.treatmentGiven,
            healthStatus: r.healthStatus || 'treatment'
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json({ success: true, data: allRecords });
});

export const healthController = {
    getAnimalHealthRecords,
    getAllFarmHealthRecords,
    getAllSystemHealthRecords
};