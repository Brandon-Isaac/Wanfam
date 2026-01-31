import { VaccinationRecord } from "../models/VaccinationRecord";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import { Request, Response } from "express";
import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";
import { get } from "http";

const createVaccinationSchedule = async (req: Request, res: Response) => {
    try {
        const { farmId, animalId } = req.params;
        const { vaccineName, veterinarianId, scheduledDate, notes } = req.body;
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
            vaccineName,
            veterinarianId,
            scheduledDate,
            status: 'scheduled',
            notes
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

const getAnimalVaccinationSchedules = async (req: Request, res: Response) => {
    try {
        const { farmId, animalId } = req.params;
        const { status } = req.query;
        const schedules = await VaccinationSchedule.find({ farmId, animalId, status });
        return res.status(200).json({ schedules });
    } catch (error) {
        console.error("Error fetching animal vaccination schedules:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getVeterinarianSchedules = async (req: Request, res: Response) => {
    try {
        // Get all schedules assigned to this veterinarian
        const schedules = await VaccinationSchedule.find({ veterinarianId: req.user.id })
            .populate('animalId', 'name tagId species')
            .populate('farmId', 'name location')
            .sort({ startDate: 1 });
        
        return res.status(200).json({ schedules });
    } catch (error) {
        console.error("Error fetching veterinarian schedules:", error);
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
        const { scheduleSlug } = req.params;
        const schedule = await VaccinationSchedule.findOneAndDelete({ slug: scheduleSlug });
        if (!schedule) {
            return res.status(404).json({ message: "Vaccination schedule not found" });
        }
        return res.status(200).json({ message: "Vaccination schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting vaccination schedule:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const executeVaccinationSchedule = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params;
        const schedule = await VaccinationSchedule.findOne({ _id: scheduleId });
        if (!schedule) {
            return res.status(404).json({ message: "Vaccination schedule not found" });
        }
        const records = await Promise.all(schedule.animalId.map(async (animalId) => {
            const record = new VaccinationRecord({
                farmId: schedule.farmId,
                animalId,
                vaccineName: schedule.vaccineName,
                veterinarianId: schedule.veterinarianId,
                scheduledDate: schedule.scheduledDate,
                notes: schedule.notes
            });
            await record.save();
            return record;
        }));
        return res.status(200).json({ message: "Vaccination schedule executed successfully", records });
    } catch (error) {
        console.error("Error executing vaccination schedule:", error);
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
        const { farmId, animalId, vaccineName, dose, unit, vaccination_cost, scheduledDate, notes, veterinarianId, veterinarianName } = req.body;
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
            ...(veterinarianId && { veterinarianId }),
            ...(veterinarianName && { veterinarianName }),
            vaccineName,
            dose,
            unit,
            scheduledDate,
            cost: vaccination_cost,
            notes
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
    getAnimalVaccinationSchedules,
    getVaccinationSchedules,
    getVeterinarianSchedules,
    updateVaccinationSchedule,
    deleteVaccinationSchedule,
    executeVaccinationSchedule,
    getVaccinationRecords,
    createVaccinationRecord,
    updateVaccinationRecord,
    deleteVaccinationRecord
};