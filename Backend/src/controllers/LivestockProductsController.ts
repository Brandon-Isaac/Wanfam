import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";
import { ProductivityRecord } from "../models/ProductivityRecord";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";

const getAnimalProductsByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findOne({ _id: farmId });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animals = await Animal.find({ farmId: farm._id });
    const products = animals.map(animal => {
        let animalProducts: string[] = [];
        if (animal.species === 'cattle') {
            animalProducts.push('milk', 'meat', 'leather');
        } else if (animal.species === 'sheep') {
            animalProducts.push('wool', 'meat');
        } else if (animal.species === 'goat') {
            animalProducts.push('milk', 'meat', 'fiber');
        } else if (animal.species === 'pig') {
            animalProducts.push('bacon', 'ham', 'leather');
        } else if (animal.species === 'poultry') {
            animalProducts.push('eggs', 'meat', 'feathers');
        } else {
            animalProducts.push('unknown');
        }
        return {
            species: animal.species,
            products: animalProducts
        };
    });
    res.json({ success: true, data: products });
});

const milkProduced = (asyncHandler(async(req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const animal = await Animal.findOne({ _id: animalId});
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const farm = await Farm.findById(animal.farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const {timeOfDay, amount, unit} = req.body;
    const time = timeOfDay.toLowerCase();
    if (!['morning', 'afternoon', 'evening'].includes(timeOfDay)) {
        return res.status(400).json({ message: "Invalid time of day. Must be 'morning', 'afternoon', or 'evening'." });
    }
    const unitLower = unit.toLowerCase();
    if (!['liters', 'gallons'].includes(unit)) {
        return res.status(400).json({ message: "Invalid unit. Must be 'liters' or 'gallons'." });
    }
    const newRecord = new ProductivityRecord({ farmId: farm._id, animalId: animal._id, date: new Date(), milkYield: { amount, unit: unitLower, timeOfDay:time } });
    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord });
}));

const getMilkProducedTodayByAnimalId = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const animal = await Animal.findOne({ _id: animalId });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const today = new Date();
    const records = await ProductivityRecord.find({ animalId: animal._id });
    const todayRecords = records.filter(record => {   
        const recordDate = new Date(record.date);
        return recordDate.getDate() === today.getDate() &&
               recordDate.getMonth() === today.getMonth() &&
               recordDate.getFullYear() === today.getFullYear();
    });
    const totalMilk = todayRecords.reduce((acc, record) => acc + (record.milkYield?.amount || 0), 0);

    res.json({ 
        success: true, 
        data: {
            records: todayRecords,
            totalMilk: { amount: totalMilk, unit: 'liters' }
        }
    });
});

const getMonthlyMilkProductionPerAnimal = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findOne({ _id: farmId });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalId = req.params.animalId;
    const animal = await Animal.findOne({ _id: animalId, farmId: farm._id });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const records = await ProductivityRecord.find({ animalId: animal._id });
    const monthlyProduction = records.reduce((acc, record) => {
        const month = record.date.getMonth() + 1;
        if (!acc[month]) {
            acc[month] = { milkYield: 0, weightGain: 0 };
        }
        acc[month].milkYield += record.milkYield?.amount || 0;
        return acc;
    }, {} as Record<number, { milkYield: number; weightGain: number }>);

    res.json({ success: true, data: monthlyProduction });
});

const getTodayFarmMilkProduction = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findOne({ _id: farmId });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const records = await ProductivityRecord.find({ farmId: farm._id });
    const today = new Date();
    const farmProduction = records.filter(record => {   
        const recordDate = new Date(record.date);
        return recordDate.getDate() === today.getDate() &&
               recordDate.getMonth() === today.getMonth() &&
               recordDate.getFullYear() === today.getFullYear();
    });
    const totalMilk = farmProduction.reduce((acc, record) => acc + (record.milkYield?.amount || 0), 0);

    res.json({ 
        success: true, 
        data: {
            records: farmProduction,
            totalMilk: { amount: totalMilk, unit: 'liters' }
        }
    });
});

export const LivestockProductsController = {
    getAnimalProductsByFarm,
    milkProduced,
    getMonthlyMilkProductionPerAnimal,
    getTodayFarmMilkProduction,
    getMilkProducedTodayByAnimalId
};
