import { VaccinationRecord } from "../models/VaccinationRecord";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import { Request, Response } from "express";
import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";
import { User } from "../models/User";
import { Expense } from "../models/Expense";
import * as notificationService from "../utils/notificationService";

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

        // Notify farm owner about the vaccination schedule
        try {
            const farmPopulated = await Farm.findById(farmId).populate('owner');
            if (farmPopulated && farmPopulated.owner) {
                await notificationService.notifyVaccinationScheduled(
                    (farmPopulated.owner as any)._id,
                    animal.tagId || animal.name || 'Unknown',
                    vaccineName,
                    scheduledDate,
                    newSchedule._id.toString()
                );
            }
        } catch (notifError) {
            console.error('Error sending vaccination schedule notification:', notifError);
        }

        // Notify veterinarian about the vaccination assignment
        if (veterinarianId) {
            try {
                await notificationService.notifyVetVaccinationAssignment(
                    veterinarianId,
                    animal.tagId || animal.name || 'Unknown',
                    vaccineName,
                    scheduledDate,
                    newSchedule._id.toString()
                );
            } catch (notifError) {
                console.error('Error sending vet vaccination assignment notification:', notifError);
            }
        }

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
        const query: any = { farmId, animalId };
        if (status) {
            query.status = status;
        }
        const schedules = await VaccinationSchedule.find(query).populate('veterinarianId', 'firstName lastName');
        return res.status(200).json({ schedules });
    } catch (error) {
        console.error("Error fetching animal vaccination schedules:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getVeterinarianSchedules = async (req: Request, res: Response) => {
    try {
        // Get all schedules assigned to this veterinarian (excluding completed ones)
        const schedules = await VaccinationSchedule.find({ 
            veterinarianId: req.user.id,
            status: { $ne: 'completed' }
        })
            .populate('animalId', 'name tagId species')
            .populate('farmId', 'name location')
            .sort({ scheduledDate: 1 });
        
        // Transform the data to match frontend expectations
        const transformedSchedules = schedules.map(schedule => {
            const scheduleObj = schedule.toObject();
            // Since animalId is an array, get the first animal
            const animal = Array.isArray(scheduleObj.animalId) && scheduleObj.animalId.length > 0
                ? scheduleObj.animalId[0]
                : scheduleObj.animalId;
            
            return {
                ...scheduleObj,
                animalId: animal,
                scheduleName: scheduleObj.vaccineName,
                vaccinationTime: scheduleObj.scheduledDate
            };
        });
        
        return res.status(200).json({ schedules: transformedSchedules });
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
        const { notes } = req.body;

        // Find the schedule by ID
        const schedule = await VaccinationSchedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: "Vaccination schedule not found" });
        }

        // Get the first animal ID from the array
        const animalIdValue = Array.isArray(schedule.animalId) ? schedule.animalId[0] : schedule.animalId;
        
        // Get animal details
        const animal = await Animal.findById(animalIdValue);

        // Create vaccination record using details from the schedule
        const record = new VaccinationRecord({
            farmId: schedule.farmId,
            animalId: animalIdValue,
            vaccineName: schedule.vaccineName,
            administeredBy: schedule.veterinarianId,
            scheduledDate: schedule.scheduledDate,
            notes: notes || schedule.notes
        });
        await record.save();

        // Update schedule status to completed
        schedule.status = 'completed';
        await schedule.save();

        // Notify farm owner about the vaccination completion
        try {
            const farmPopulated = await Farm.findById(schedule.farmId).populate('owner');
            if (farmPopulated && farmPopulated.owner) {
                await notificationService.notifyVaccinationRecorded(
                    (farmPopulated.owner as any)._id,
                    animal?.tagId || animal?.name || 'Unknown',
                    schedule.vaccineName,
                    record._id.toString()
                );
            }
        } catch (notifError) {
            console.error('Error sending vaccination completion notification:', notifError);
        }

        return res.status(200).json({ message: "Vaccination completed successfully", record });
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
            ...(veterinarianId && { administeredBy: veterinarianId }),
            ...(veterinarianName && { veterinarianName }),
            vaccineName,
            dose,
            unit,
            scheduledDate,
            cost: vaccination_cost,
            notes
        });
        await newRecord.save();

        // Notify farm owner about the vaccination record
        try {
            const farmPopulated = await Farm.findById(farmId).populate('owner');
            if (farmPopulated && farmPopulated.owner) {
                await notificationService.notifyVaccinationRecorded(
                    (farmPopulated.owner as any)._id,
                    animal.tagId || animal.name || 'Unknown',
                    vaccineName,
                    newRecord._id.toString()
                );
            }
        } catch (notifError) {
            console.error('Error sending vaccination record notification:', notifError);
        }

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

// Create vaccination record with animalId from URL params (used by vets)
const createVaccinationRecordForAnimal = async (req: Request, res: Response) => {
    try {
        const { animalId } = req.params;
        const { farmId, vaccineName, dose, unit, vaccination_cost, scheduledDate, notes, veterinarianId, veterinarianName } = req.body;
        
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
            ...(veterinarianId && { administeredBy: veterinarianId }),
            ...(veterinarianName && { veterinarianName }),
            vaccineName,
            dose,
            unit,
            scheduledDate,
            cost: vaccination_cost,
            notes
        });
        await newRecord.save();

        // Update vet earnings if cost is provided and veterinarianId exists
        if (vaccination_cost && (veterinarianId || req.user?.id)) {
            const vetId = veterinarianId || req.user?.id;
            const cost = parseFloat(vaccination_cost);
            
            try {
                await User.findByIdAndUpdate(
                    vetId,
                    {
                        $inc: {
                            'earnings.totalEarnings': cost,
                            'earnings.vaccinationEarnings': cost
                        },
                        $set: {
                            'earnings.lastUpdated': new Date()
                        }
                    },
                    { upsert: false }
                );
                
                // Create expense entry for the vaccination
                const expenseData = {
                    farmId,
                    category: 'healthcare',
                    subcategory: 'vaccination',
                    amount: cost,
                    currency: 'KES',
                    date: scheduledDate || new Date(),
                    description: `Vaccination: ${vaccineName} for animal ${animal.tagId || animal.name}`,
                    animalId: animalId,
                    workerId: vetId,
                    paymentStatus: 'completed',
                    recordedBy: req.user?.id
                };
                
                const expense = new Expense(expenseData);
                await expense.save();
            } catch (updateError) {
                console.error('Error updating vet earnings or creating expense:', updateError);
            }
        }

        // Notify farm owner about the vaccination record
        try {
            const farmPopulated = await Farm.findById(farmId).populate('owner');
            if (farmPopulated && farmPopulated.owner) {
                await notificationService.notifyVaccinationRecorded(
                    (farmPopulated.owner as any)._id,
                    animal.tagId || animal.name || 'Unknown',
                    vaccineName,
                    newRecord._id.toString()
                );
            }
        } catch (notifError) {
            console.error('Error sending vaccination record notification:', notifError);
        }

        return res.status(201).json({ message: "Vaccination record created successfully", record: newRecord });
    } catch (error) {
        console.error("Error creating vaccination record:", error);
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
    createVaccinationRecordForAnimal,
    updateVaccinationRecord,
    deleteVaccinationRecord
};