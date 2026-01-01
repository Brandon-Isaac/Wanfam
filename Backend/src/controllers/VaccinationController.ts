import { VaccinationRecord } from "../models/VaccinationRecord";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import { Request, Response } from "express";
import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";

const createVaccinationSchedule = async (req: Request, res: Response) => {
    try {
        const { farmId, animalId } = req.params;
        const { scheduleName, veterinarianId, veterinarianName, vaccinationTime, notes, status } = req.body;
        
        if (!veterinarianId && !veterinarianName) {
            return res.status(400).json({ message: "Either veterinarianId or veterinarianName must be provided" });
        }
        
        if (!scheduleName || !vaccinationTime) {
            return res.status(400).json({ message: "scheduleName and vaccinationTime are required fields" });
        }
        
        const vaccinationDate = new Date(vaccinationTime);
        if (isNaN(vaccinationDate.getTime())) {
            return res.status(400).json({ message: "vaccinationTime must be a valid date" });
        }
        
        const farm = await Farm.findById(farmId);
        if (!farm) {
            return res.status(404).json({ message: "Farm not found" });
        }
        const animal = await Animal.findOne({ _id: animalId, farmId });
        if (!animal) {
            return res.status(400).json({ message: "Animal not found in the specified farm" });
        }
        const newSchedule = new VaccinationSchedule({
            farmId,
            animalId,
            scheduleName,
            veterinarianId,
            veterinarianName,
            vaccinationTime,
            notes, 
            status,
        });
        await newSchedule.save();
        return res.status(201).json({ message: "Vaccination schedule created successfully", schedule: newSchedule });
    } catch (error) {
        console.error("Error creating vaccination schedule:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getVaccinationSchedules = async (req: Request, res: Response) => {
    try {
        const { farmId } = req.params;
        const schedules = await VaccinationSchedule.find({ farmId }).populate('animalId');
        return res.status(200).json({ schedules });
    } catch (error) {
        console.error("Error fetching vaccination schedules:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getVaccinationSchedulesByVeterinarian = async (req: Request, res: Response) => {
    try {
        const veterinarianId = req.user?.id;
        const schedules = await VaccinationSchedule.find({ veterinarianId }).populate('animalId');
        return res.status(200).json({ schedules });
    }
    catch (error) {
        console.error("Error fetching vaccination schedules by veterinarian:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const updateVaccinationSchedule = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params;
        const updates = req.body;
        const schedule = await VaccinationSchedule.findByIdAndUpdate(scheduleId, updates, { new: true });
        if (!schedule) {
            return res.status(404).json({ message: "Vaccination schedule not found" });
        }
        return res.status(200).json({ message: "Vaccination schedule updated successfully", schedule });
    } catch (error) {
        console.error("Error updating vaccination schedule:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteVaccinationSchedule = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params;
        const schedule = await VaccinationSchedule.findByIdAndDelete(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: "Vaccination schedule not found" });
        }
        return res.status(200).json({ message: "Vaccination schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting vaccination schedule:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getVaccinationRecords = async (req: Request, res: Response) => {
    try {
        const { farmId } = req.params;
        const records = await VaccinationRecord.find({ farmId }).populate('animalId');
        return res.status(200).json({ records });
    } catch (error) {
        console.error("Error fetching vaccination records:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const createVaccinationRecord = async (req: Request, res: Response) => {
    try {
        const administeredBy = req.user?.id;
        const {animalId} = req.params;
        const { farmId, vaccineName, vaccinationDate, administrationSite, notes, sideEffects } = req.body;
        const farm = await Farm.findById(farmId);
        if (!farm) {
            return res.status(404).json({ message: "Farm not found" });
        }
        const animal = await Animal.findOne({ _id: animalId, farmId });
        if (!animal) {
            return res.status(400).json({ message: "Animal not found in the specified farm" });
        }
        const newRecord = new VaccinationRecord({
            farmId,
            animalId,
            vaccineName,
            vaccinationDate,
            administrationSite,
            notes,
            administeredBy,
            sideEffects
        });
        await newRecord.save();
        return res.status(201).json({ message: "Vaccination record created successfully", record: newRecord });
    } catch (error) {
        console.error("Error creating vaccination record:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateVaccinationRecord = async (req: Request, res: Response) => {
    try {
        const { recordId } = req.params;
        const updates = req.body;
        const record = await VaccinationRecord.findByIdAndUpdate(recordId, updates, { new: true });
        if (!record) {
            return res.status(404).json({ message: "Vaccination record not found" });
        }
        return res.status(200).json({ message: "Vaccination record updated successfully", record });
    } catch (error) {
        console.error("Error updating vaccination record:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteVaccinationRecord = async (req: Request, res: Response) => {
    try {
        const { recordId } = req.params;
        const record = await VaccinationRecord.findByIdAndDelete(recordId);
        if (!record) {
            return res.status(404).json({ message: "Vaccination record not found" });
        }
        return res.status(200).json({ message: "Vaccination record deleted successfully" });
    } catch (error) {
        console.error("Error deleting vaccination record:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const VaccinationController = {
    createVaccinationSchedule,
    getVaccinationSchedules,
    getVaccinationSchedulesByVeterinarian,
    updateVaccinationSchedule,
    deleteVaccinationSchedule,
    getVaccinationRecords,
    createVaccinationRecord,
    updateVaccinationRecord,
    deleteVaccinationRecord
};