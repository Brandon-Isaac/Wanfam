import { TreatmentSchedule } from "../models/TreatmentSchedule";
import { TreatmentRecord } from "../models/TreatmentRecord";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import notificationService from "../utils/notificationService";

const createTreatmentSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    if (!farmId) {
        return res.status(400).json({ message: "Farm ID is required" });
    }
    const { animalId, scheduleName, scheduleDate, veterinarianId, notes } = req.body;
    const newSchedule = new TreatmentSchedule({ farmId, animalId, scheduleName, scheduledDate: scheduleDate, administeredBy:veterinarianId, notes });
    await newSchedule.save();
    
    // Notify farm owner about new treatment schedule
    try {
        const [farm, animal] = await Promise.all([
            Farm.findById(farmId).populate('owner'),
            Animal.findById(animalId)
        ]);
        
        if (farm && farm.owner && animal) {
            await notificationService.notifyTreatmentSchedule(
                (farm.owner as any)._id,
                animal.tagId || animal.name || 'Unknown',
                scheduleName,
                newSchedule._id.toString()
            );
        }
    } catch (notifError) {
        console.error('Error sending treatment schedule notification:', notifError);
    }
    
    res.status(201).json({ success: true, data: newSchedule });
});

const getTreatmentScheduleById = asyncHandler(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId;
    const schedule = await TreatmentSchedule.findById(scheduleId)
    .populate('animalId', 'name species breed')
    if (!schedule) {
        return res.status(404).json({ message: "Treatment Schedule not found" });
    }
    res.json({ success: true, data: schedule });
});

const getTreatmentSchedulesByAnimal = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const schedules = await TreatmentSchedule.find({ animalId });
    res.json({ success: true, data: schedules });
});

const recordTreatment = asyncHandler(async (req: Request, res: Response) => {
    const administeredBy = req.user?.id;
    const {animalId, scheduleId, date, treatmentGiven, notes, healthStatus,status } = req.body;
    const newRecord = new TreatmentRecord({ animalId, scheduleId, treatmentDate:date, treatmentGiven, notes, administeredBy, healthStatus, status });
    await newRecord.save();
    if (scheduleId && status === 'treated') {
        await TreatmentSchedule.findByIdAndUpdate(scheduleId, { status: 'treated' });
    }
    
    // Notify farm owner about completed treatment
    try {
        const animal = await Animal.findById(animalId);
        if (animal) {
            const farm = await Farm.findById(animal.farmId).populate('owner');
            if (farm && farm.owner) {
                await notificationService.createNotification({
                    userId: (farm.owner as any)._id,
                    message: `Treatment "${treatmentGiven || 'treatment'}" has been administered to ${animal.tagId || animal.name || 'an animal'}.`,
                    type: 'treatment',
                    relatedEntityId: newRecord._id.toString(),
                    relatedEntityType: 'treatment_record'
                });
            }
        }
    } catch (notifError) {
        console.error('Error sending treatment completion notification:', notifError);
    }
    
    res.status(201).json({ success: true, data: newRecord });
});

const recordUnscheduledTreatment = asyncHandler(async (req: Request, res: Response) => {
    const { animalId,  date, notes, administeredBy } = req.body;
    const newRecord = new TreatmentRecord({ animalId,  treatmentDate:date, notes, administeredBy, isUnscheduled: true });
    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord });
});

const getTreatmentRecordsByAnimal = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const records = await TreatmentRecord.find({ animalId });
    res.json({ success: true, data: records });
});

const getTreatmentSchedulesByVet = asyncHandler(async (req: Request, res: Response) => {
    const veterinarianId = req.params.veterinarianId;
    const schedules = await TreatmentSchedule.find({ veterinarianId, status: 'scheduled' });
    res.json({ success: true, data: schedules });
});

const getTreatmentSchedulesAssignedByVet = asyncHandler(async (req: Request, res: Response) => {
    const veterinarianId = req.user?.id;
    const schedules = await TreatmentSchedule.find({ administeredBy: veterinarianId, status: 'scheduled' })
    .populate('animalId', 'name species breed');
    res.json({ success: true, data: schedules });
});

const updateTreatmentSchedule = asyncHandler(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId;
    const updates = req.body;
    const updatedSchedule = await TreatmentSchedule.findByIdAndUpdate(scheduleId, updates, { new: true });
    if (!updatedSchedule) {
        return res.status(404).json({ message: "Treatment Schedule not found" });
    }
    res.json({ success: true, data: updatedSchedule });
});

export const TreatmentController = {
    createTreatmentSchedule,
    getTreatmentScheduleById,
    getTreatmentSchedulesByAnimal,
    recordTreatment,
    recordUnscheduledTreatment,
    getTreatmentRecordsByAnimal,
    getTreatmentSchedulesByVet,
    getTreatmentSchedulesAssignedByVet,
    updateTreatmentSchedule
};