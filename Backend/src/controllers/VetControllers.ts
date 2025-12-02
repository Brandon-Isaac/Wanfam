import { Veterinarian } from "../models/Veterinarian";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler"; 
import { Wage } from "../models/Wages";
import { User } from "../models/User";
import { Farm } from "../models/Farm";

const getFarmVets = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const veterinarians = await User.find({ role: 'veterinary', farmId: { $in: [farmId] } }).select('-password');
    res.json({ success: true, data: veterinarians });
});

const getVetsAvailable = asyncHandler(async (req: Request, res: Response) => {
    const veterinarians = await User.find({ role: 'veterinary', farmId: { $in: [null, []] } }).select('-password');
    res.json({ success: true, data: veterinarians });
});


const addFarmToVet = asyncHandler(async (req: Request, res: Response) => {
    const {vetId, farmId} = req.body;
    const veterinarian = await User.findOne({ _id: vetId, role: 'veterinary' });
    if (!veterinarian) {
        return res.status(404).json({ message: "Veterinarian not found" });
    }
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    if (!farm.assignedVeterinarians?.includes(vetId)) {
        farm.assignedVeterinarians?.push(vetId);
        await farm.save();
    }
    if (veterinarian.farmId && veterinarian.farmId.includes(farmId)) {
        return res.status(400).json({ message: "Farm already assigned to this veterinarian" });
    }
    veterinarian.farmId?.push(farmId);
    await veterinarian.save();
    res.status(200).json({ message: "Farm added to veterinarian", veterinarian });
});

const updateVetAvailability = asyncHandler(async (req: Request, res: Response) => {
    const vetId = req.user?.id;
    const { availability } = req.body;
    const veterinarian = await Veterinarian.findOne({ vetId });
    if (!veterinarian) {
        return res.status(404).json({ message: "Veterinarian not found" });
    }
    veterinarian.availability = availability;
    await veterinarian.save();
    res.status(200).json({ message: "Availability updated", veterinarian });
});

const createVetServices = asyncHandler(async (req: Request, res: Response) => {
    const vetId = req.user?.id;
    const { generalCheckup, emergencyCare, surgery, vaccination, healthMonitoring, nutritionAdvisory, otherServices } = req.body;
    const veterinarian = await Veterinarian.findOne({ vetId });
    if (!veterinarian) {
        return res.status(404).json({ message: "Veterinarian not found" });
    }
    veterinarian.services = {
        generalCheckup,
        emergencyCare,
        surgery,
        vaccination,
        healthMonitoring,
        nutritionAdvisory,
        otherServices
    };
    await veterinarian.save();
    res.status(200).json({ message: "Services updated", veterinarian });
});

const getVetSalary = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const vetId = req.params.vetId;
    const veterinarian = await Veterinarian.findOne({ vetId, farmId: farmSlug });
    if (!veterinarian) {
        return res.status(404).json({ message: "Veterinarian not found" });
    }
    const vetSalary = veterinarian.salary.amount;
    res.status(200).json({ vetSalary });
});

const getTotalVetsWages = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const veterinarians = await Veterinarian.find({ farmId: farmSlug });
    const totalWages = veterinarians.reduce((acc, vet) => acc + vet.salary.amount, 0);
    Wage.create({ farmId: farmSlug, amount: totalWages, employees: ['Veterinarian'], currency: 'USD', paymentDate: new Date(), paymentMethod: 'bank_transfer', notes: 'Monthly veterinarian wage payout' });
    res.status(200).json({ totalWages });
});

export const VetController = { getFarmVets, getVetSalary, getTotalVetsWages, updateVetAvailability, createVetServices, addFarmToVet, getVetsAvailable };