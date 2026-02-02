import { TreatmentSchedule } from "../models/TreatmentSchedule";
import { TreatmentRecord } from "../models/TreatmentRecord";
import { Expense } from "../models/Expense";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";

const createTreatmentSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    if (!farmId) {
        return res.status(400).json({ message: "Farm ID is required" });
    }
    const { animalId, scheduleName, scheduleDate, veterinarianId, notes } = req.body;
    const newSchedule = new TreatmentSchedule({ farmId, animalId, scheduleName, scheduledDate: scheduleDate, administeredBy:veterinarianId, notes });
    await newSchedule.save();
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
    const {animalId, scheduleId, date, treatmentGiven, notes, healthStatus, status, cost } = req.body;
    const newRecord = new TreatmentRecord({ 
        animalId, 
        scheduleId, 
        treatmentDate: date, 
        treatmentGiven, 
        notes, 
        administeredBy, 
        healthStatus, 
        status,
        ...(cost && { cost: parseFloat(cost) })
    });
    await newRecord.save();
    
    if (scheduleId && status === 'treated') {
        await TreatmentSchedule.findByIdAndUpdate(scheduleId, { status: 'treated' });
    }
    
    // Update vet earnings if cost is provided
    if (cost && administeredBy) {
        const treatmentCost = parseFloat(cost);
        try {
            const User = require('../models/User').User;
            await User.findByIdAndUpdate(
                administeredBy,
                {
                    $inc: {
                        'earnings.totalEarnings': treatmentCost,
                        'earnings.treatmentEarnings': treatmentCost
                    },
                    $set: {
                        'earnings.lastUpdated': new Date()
                    }
                },
                { upsert: false }
            );
            
            // Create expense entry for the treatment
            const schedule = scheduleId ? await TreatmentSchedule.findById(scheduleId) : null;
            const expenseData = {
                farmId: schedule?.farmId,
                category: 'healthcare',
                subcategory: 'treatment',
                amount: treatmentCost,
                currency: 'KES',
                date: date || new Date(),
                description: `Treatment: ${treatmentGiven || 'Medical treatment'} for animal`,
                animalId: animalId,
                workerId: administeredBy,
                paymentStatus: 'completed',
                recordedBy: administeredBy
            };
            
            if (expenseData.farmId) {
                const expense = new Expense(expenseData);
                await expense.save();
            }
        } catch (updateError) {
            console.error('Error updating vet earnings or creating expense:', updateError);
        }
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
    // Explicitly exclude treated and missed schedules
    const schedules = await TreatmentSchedule.find({ 
        administeredBy: veterinarianId, 
        status: { $nin: ['treated', 'missed'] }
    })
    .populate('animalId', 'name species breed tagId')
    .populate('farmId', 'name location')
    .sort({ scheduledDate: 1 });
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