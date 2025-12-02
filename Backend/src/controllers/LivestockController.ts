import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";
import { Request, Response } from "express";
import { User } from "../models/User";
import { asyncHandler } from "../middleware/AsyncHandler";
    
const getAnimalsByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animals = await Animal.find({ farmId: farm._id })
    .populate('assignedWorker', 'firstName lastName');
    res.json({ success: true, data: animals });
});

const getFarmAnimalById = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalId = req.params.animalId;
    const animal = await Animal.findOne({ _id: animalId, farmId: farm._id })
    .populate('assignedWorker', 'firstName lastName');
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    res.json({ success: true, data: animal });
}
);
const getSickAnimalsByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animals = await Animal.find({ farmId: farm._id, healthStatus: "sick" });
    res.json({ success: true, data: animals });
});

const updateHealthStatus = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const { healthStatus } = req.body;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    animal.healthStatus = healthStatus;
    await animal.save();
    res.json({ success: true, data: animal });
});

const addAnimalToFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { name, species, dateOfBirth, dateOfPurchase,breed,gender } = req.body;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const age = dateOfBirth ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : undefined;
    const newAnimal = new Animal({ name, species, farmId: farm.id, dateOfBirth, dateOfPurchase, age, breed, gender });
    await newAnimal.save();
    res.status(201).json({ success: true, data: newAnimal });
});

const updateAnimal = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalId = req.params.animalId;
    const { name, species, dateOfBirth, dateOfPurchase, notes, breed, gender, healthStatus, weight, assignedWorker } = req.body;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const age = dateOfBirth ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : undefined;
    animal.name = name;
    animal.species = species;
    animal.dateOfBirth = dateOfBirth;
    animal.dateOfPurchase = dateOfPurchase;
    animal.age = age;
    animal.notes = notes;
    animal.breed = breed;
    animal.gender = gender;
    animal.weight = weight;
    animal.healthStatus = healthStatus;
    animal.assignedWorker = assignedWorker;
    await animal.save();
    res.json({ success: true, data: animal, tagId: animal.tagId });
});


const deleteFarmAnimal = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalId = req.params.animalId;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    await animal.deleteOne();
    res.json({ success: true, message: "Animal deleted successfully" });
});

const getAllAnimals = asyncHandler(async (req: Request, res: Response) => {
    const animals = await Animal.find();
    res.json({ success: true, data: animals });
});
const getAnimalById = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    res.json({ success: true, data: animal });
});
const deleteAnimal = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    await animal.deleteOne();
    res.json({ success: true, message: "Animal deleted successfully" });
});

const getAnimalByWorkerAssigned = asyncHandler(async (req: Request, res: Response) => {
    const userId= req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const animals = await Animal.find({ assignedWorker: user._id });
    res.json({ success: true, data: animals });
});

const updateAnimalByWorkerAssigned = asyncHandler(async (req: Request, res: Response) => {
    const userId= req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const animalId = req.params.animalId;
    const animal = await Animal.findOne({ _id: animalId, assignedWorker: user._id });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found or not assigned to you" });
    }
    const { notes, healthStatus, weight } = req.body;
    animal.notes = notes || animal.notes;
    animal.healthStatus = healthStatus || animal.healthStatus;
    animal.weight = weight || animal.weight;
    await animal.save();
    res.json({ success: true, data: animal });
});

export const LivestockController = {
    getAnimalsByFarm,
    getSickAnimalsByFarm,
    addAnimalToFarm,
    updateAnimal,
    updateHealthStatus,
    deleteAnimal,
    getAllAnimals,
    getAnimalById,
    deleteFarmAnimal,
    getFarmAnimalById,
    getAnimalByWorkerAssigned,
    updateAnimalByWorkerAssigned
};