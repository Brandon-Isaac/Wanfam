import { VaccinationRecord } from "../models/VaccinationRecord";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import { Request, Response } from "express";
import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";

const createVaccinationSchedule = async (req: Request, res: Response) => {
    try {
        const { farmSlug } = req.params;
        const farmId = await Farm.findOne({ slug: farmSlug }).then(farm => farm?._id);
        if (!farmId) {
            return res.status(404).json({ message: "Farm not found" });
        }
        const { animalSlug } = req.params;
        const animalId = await Animal.find({ slug: { $in: animalSlug }, farmId }).then(animals => animals.map(a => a._id));
        if (animalId.length === 0) {
            return res.status(400).json({ message: "One or more animals not found in the specified farm" });
        }
        const {  scheduleName, vaccineName, dose, unit, frequency, startDate, endDate, vaccinationTime, notes, reminders } = req.body;
        const farm = await Farm.findOne({ slug: farmSlug });
        if (!farm) {
            return res.status(404).json({ message: "Farm not found" });
        }
        const animals = await Animal.find({ slug: { $in: animalSlug }, farmId: farm._id });
        if (animals.length !== animalSlug.length) {
            return res.status(400).json({ message: "One or more animals not found in the specified farm" });
        }
        const newSchedule = new VaccinationSchedule({
            farmId,
            animalId,
            scheduleName,
            vaccineName,
            dose,
            unit,
            frequency,
            startDate,
            endDate,
            vaccinationTime,
            notes,
            reminders
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
        const { scheduleSlug } = req.params;
        const schedule = await VaccinationSchedule.findOne({ slug: scheduleSlug });
        if (!schedule) {
            return res.status(404).json({ message: "Vaccination schedule not found" });
        }
        const records = await Promise.all(schedule.animalId.map(async (animalId) => {
            const record = new VaccinationRecord({
                farmId: schedule.farmId,
                animalId,
                vaccineName: schedule.vaccineName,
                dose: schedule.dose,
                unit: schedule.unit,
                vaccinationTime: schedule.vaccinationTime,
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
        const { farmSlug } = req.params;
        const records = await VaccinationRecord.find({ farmSlug }).populate('animalId');
        return res.status(200).json({ records });
    } catch (error) {
        console.error("Error fetching vaccination records:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const createVaccinationRecord = async (req: Request, res: Response) => {
    try {
        const { farmId, animalId, vaccineName, dose, unit, vaccinationTime, notes } = req.body;
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
            dose,
            unit,
            vaccinationTime,
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