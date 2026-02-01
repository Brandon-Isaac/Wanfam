import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";
import { Expense } from "../models/Expense";
import { Request, Response } from "express";
import { User } from "../models/User";
import { asyncHandler } from "../middleware/AsyncHandler";
import notificationService from "../utils/notificationService";
    
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
    const animals = await Animal.find({ farmId: farm._id, healthStatus: { $in: ['sick', 'treatment', 'recovery', 'quarantined', 'deceased'] } });
    res.json({ success: true, data: animals });
});

const updateHealthStatus = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const { healthStatus } = req.body;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const previousStatus = animal.healthStatus;
    animal.healthStatus = healthStatus;
    await animal.save();
    
    // Notify farm owner about health status change
    try {
        const farm = await Farm.findById(animal.farmId).populate('owner');
        if (farm && farm.owner && previousStatus !== healthStatus) {
            await notificationService.notifyHealthStatusChange(
                (farm.owner as any)._id,
                animal.tagId || animal.name || 'Unknown',
                healthStatus,
                animal._id.toString()
            );
        }
    } catch (notifError) {
        console.error('Error sending health status notification:', notifError);
    }
    
    res.json({ success: true, data: animal });
});

const addAnimalToFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { name, species, dateOfBirth, dateOfPurchase, purchasePrice, breed, gender, notes, assignedWorker } = req.body;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const age = dateOfBirth ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : undefined;
    const newAnimal = new Animal({ 
        name, 
        species, 
        farmId: farm.id, 
        dateOfBirth, 
        dateOfPurchase, 
        purchasePrice,
        age, 
        breed, 
        gender,
        notes,
        assignedWorker: assignedWorker && assignedWorker !== '' ? assignedWorker : undefined
    });
    await newAnimal.save();

    // Create expense record if purchase price is provided
    if (purchasePrice && dateOfPurchase) {
        const expense = new Expense({
            farmId: farm._id,
            category: 'other',
            subcategory: 'Livestock Purchase',
            amount: purchasePrice,
            currency: 'KES',
            date: dateOfPurchase,
            description: `Purchase of ${species} - ${name || newAnimal.tagId}`,
            animalId: newAnimal._id,
            paymentStatus: 'completed',
            recordedBy: req.user?.id,
            notes: `Automatic expense record for livestock purchase`
        });
        await expense.save();
    }

    // Notify farm owner about new animal registration
    try {
        const farmPopulated = await Farm.findById(farmId).populate('owner');
        if (farmPopulated && farmPopulated.owner) {
            await notificationService.notifyAnimalRegistration(
                (farmPopulated.owner as any)._id,
                newAnimal.tagId || name || 'Unknown',
                species,
                newAnimal._id.toString()
            );
        }
    } catch (notifError) {
        console.error('Error sending animal registration notification:', notifError);
    }

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
    animal.assignedWorker = assignedWorker && assignedWorker !== '' ? assignedWorker : undefined;
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

const getAllAnimalsForFarmer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    // Get all farms belonging to this farmer - Farm model uses 'owner' field
    const farms = await Farm.find({ owner: userId });
    
    if (!farms || farms.length === 0) {
        return res.json({ success: true, data: [] });
    }
    
    const farmIds = farms.map(farm => farm._id);
    
    // Build query with optional filters
    const query: any = { farmId: { $in: farmIds } };
    
    // Apply filters from query parameters
    if (req.query.healthStatus && req.query.healthStatus !== 'all') {
        // Special handling for 'sick' filter - show all unhealthy animals but exclude deceased
        if (req.query.healthStatus === 'sick') {
            query.healthStatus = { $in: ['sick', 'treatment', 'recovery', 'quarantined'] };
        } else {
            query.healthStatus = req.query.healthStatus;
        }
    }
    
    if (req.query.species && req.query.species !== 'all') {
        query.species = new RegExp(req.query.species as string, 'i');
    }
    
    if (req.query.search) {
        const searchTerm = req.query.search as string;
        query.$or = [
            { name: new RegExp(searchTerm, 'i') },
            { tagId: new RegExp(searchTerm, 'i') },
            { species: new RegExp(searchTerm, 'i') },
            { breed: new RegExp(searchTerm, 'i') }
        ];
    }
    
    // Fetch animals with farm and worker details
    const animals = await Animal.find(query)
        .populate('farmId', 'name location')
        .populate('assignedWorker', 'firstName lastName')
        .sort({ createdAt: -1 });
    
    res.json({ success: true, data: animals });
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
    updateAnimalByWorkerAssigned,
    getAllAnimalsForFarmer
};