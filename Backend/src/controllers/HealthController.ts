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
        HealthRecord.find({ animalId: { $in: animalIds } }).populate('animalId', 'name species breed tagId').populate('treatedBy', 'firstName lastName'),
        VaccinationRecord.find({ animalId: { $in: animalIds } }).populate('animalId', 'name species breed tagId').populate('administeredBy', 'firstName lastName'),
        TreatmentRecord.find({ animalId: { $in: animalIds } }).populate('animalId', 'name species breed tagId').populate('administeredBy', 'firstName lastName')
    ]);
    
    // Combine all records
    const allRecords = [
        ...healthRecords.map(r => ({
            ...r.toObject(),
            recordType: r.recordType || 'general',
            date: r.date
        })),
        ...vaccinationRecords.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                recordType: 'vaccination',
                date: r.scheduledDate,
                diagnosis: r.vaccineName,
                treatedBy: obj.administeredBy
            };
        }),
        ...treatmentRecords.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                recordType: 'treatment',
                date: r.treatmentDate,
                diagnosis: r.treatmentGiven,
                treatedBy: obj.administeredBy
            };
        })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json({ success: true, data: allRecords });
});

const getAllSystemHealthRecords = asyncHandler(async (req: Request, res: Response) => {
    // Get all health-related records across the system
    const [healthRecords, vaccinationRecords, treatmentRecords] = await Promise.all([
        HealthRecord.find().populate('animalId', 'name species breed tagId').populate('treatedBy', 'firstName lastName'),
        VaccinationRecord.find().populate('animalId', 'name species breed tagId').populate('administeredBy', 'firstName lastName'),
        TreatmentRecord.find().populate('animalId', 'name species breed tagId').populate('administeredBy', 'firstName lastName')
    ]);
    
    // Combine all records
    const allRecords = [
        ...healthRecords.map(r => ({
            ...r.toObject(),
            recordType: r.recordType || 'general',
            date: r.date
        })),
        ...vaccinationRecords.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                recordType: 'vaccination',
                date: r.scheduledDate,
                diagnosis: r.vaccineName,
                healthStatus: 'vaccination',
                treatedBy: obj.administeredBy // Map administeredBy to treatedBy
            };
        }),
        ...treatmentRecords.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                recordType: 'treatment',
                date: r.treatmentDate,
                diagnosis: r.treatmentGiven,
                healthStatus: r.healthStatus || 'treatment',
                treatedBy: obj.administeredBy // Map administeredBy to treatedBy
            };
        })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json({ success: true, data: allRecords });
});

const getHealthRecordById = asyncHandler(async (req: Request, res: Response) => {
    const recordId = req.params.id;
    
    // Try to find in HealthRecord first
    let record = await HealthRecord.findById(recordId)
        .populate('animalId', 'name species breed tagId')
        .populate('treatedBy', 'firstName lastName')
        .populate('recordedBy', 'firstName lastName');
    
    if (record) {
        return res.json({ success: true, data: record });
    }
    
    // Try VaccinationRecord
    const vaccinationRecord = await VaccinationRecord.findById(recordId)
        .populate('animalId', 'name species breed tagId')
        .populate('administeredBy', 'firstName lastName');
    
    if (vaccinationRecord) {
        const obj = vaccinationRecord.toObject();
        return res.json({
            success: true,
            data: {
                ...obj,
                recordType: 'vaccination',
                date: obj.scheduledDate,
                diagnosis: obj.vaccineName,
                treatedBy: obj.administeredBy
            }
        });
    }
    
    // Try TreatmentRecord
    const treatmentRecord = await TreatmentRecord.findById(recordId)
        .populate('animalId', 'name species breed tagId')
        .populate('administeredBy', 'firstName lastName');
    
    if (treatmentRecord) {
        const obj = treatmentRecord.toObject();
        return res.json({
            success: true,
            data: {
                ...obj,
                recordType: 'treatment',
                date: obj.treatmentDate,
                diagnosis: obj.treatmentGiven,
                treatedBy: obj.administeredBy
            }
        });
    }
    
    return res.status(404).json({ success: false, message: "Health record not found" });
});

export const healthController = {
    getAnimalHealthRecords,
    getAllFarmHealthRecords,
    getAllSystemHealthRecords,
    getHealthRecordById
};