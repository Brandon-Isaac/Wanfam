import { Request, Response } from 'express';
import {asyncHandler} from '../middleware/AsyncHandler';
import { Farm } from '../models/Farm';
import { FarmWorker } from '../models/FarmWorker';
import { Veterinarian } from '../models/Veterinarian';
import { User } from '../models/User';
import { Animal } from '../models/Animal';

// Get all farms
const getFarms = asyncHandler(async (req: Request, res: Response) => {
    const farmerId = req.user?.id;
    
    const farms = await Farm.find({ owner: farmerId, isActive: true })
        .populate('workers', 'firstName lastName email phone')
        .populate('assignedVeterinarians', 'firstName lastName email phone licenseNumber specialization')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: farms.length,
        data: farms
    });
});

// Get single farm
const getFarmById = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const farmerId = req.user?.id;

    const farm = await Farm.findOne({ _id: farmId, owner: farmerId, isActive: true })
        .populate('workers', 'firstName lastName email phone')
        .populate('assignedVeterinarians', 'firstName lastName email phone licenseNumber specialization');

    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }
    // Get farm statistics
    const [totalLivestock, species, totalWorkers, totalVets] = await Promise.all([
        Animal.countDocuments({ farm: farmId }),
        Animal.aggregate([
            { $match: { farm: farmId } },
            { $group: { _id: '$species', count: { $sum: 1 } } }
        ]),
        FarmWorker.countDocuments({ farm: farmId, isActive: true }),
        Veterinarian.countDocuments({ farm: farmId, isActive: true })
    ]);

    res.json({
        success: true,
        data: {
            ...farm.toObject(),
            statistics: {
                totalLivestock,
                species,
                totalWorkers,
                totalVets,
            }
        }
    });
});

// Create new farm
const createFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmerId = req.user?.id;
    
    // Clean up coordinates if they're empty strings or invalid
    if (req.body.location?.coordinates) {
        const { latitude, longitude } = req.body.location.coordinates;
        
        // If coordinates are empty strings or not numbers, remove them
        if (!latitude || !longitude || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
            delete req.body.location.coordinates;
        } else {
            // Convert to numbers if they're valid
            req.body.location.coordinates.latitude = Number(latitude);
            req.body.location.coordinates.longitude = Number(longitude);
        }
    }
    
    const farmData = {
        ...req.body,
        owner: farmerId
    };

    const farm = new Farm(farmData);
    await farm.save();

    res.status(201).json({
        success: true,
        message: 'Farm created successfully',
        data: farm
    });
});

// Update farm
const updateFarm = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const farmerId = req.user?.id;

    // Clean up coordinates if they're empty strings or invalid
    if (req.body.location?.coordinates) {
        const { latitude, longitude } = req.body.location.coordinates;
        
        // If coordinates are empty strings or not numbers, remove them
        if (!latitude || !longitude || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
            delete req.body.location.coordinates;
        } else {
            // Convert to numbers if they're valid
            req.body.location.coordinates.latitude = Number(latitude);
            req.body.location.coordinates.longitude = Number(longitude);
        }
    }

    const farm = await Farm.findOneAndUpdate(
        { _id: farmId, owner: farmerId, isActive: true },
        req.body,
        { new: true, runValidators: true }
    );

    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }

    res.json({
        success: true,
        message: 'Farm updated successfully',
        data: farm
    });
});

// Assign worker to farm
const assignWorker = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const { workerId, role, permissions, salary, workSchedule } = req.body;
    const farmerId = req.user?.id;

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: farmerId, isActive: true });
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }

    // Verify worker exists and has correct role
    const worker = await User.findOne({ _id: workerId, role: 'worker' });
    if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
    }

    // Check if worker is already assigned to this farm
    const existingAssignment = await FarmWorker.findOne({ user: workerId, farm: farmId });
    if (existingAssignment) {
        return res.status(400).json({ message: 'Worker is already assigned to this farm' });
    }

    // Create farm worker assignment
    const farmWorker = new FarmWorker({
        user: workerId,
        farm: farmId,
        assignedBy: farmerId,
        role,
        permissions,
        salary,
        workSchedule
    });

    await farmWorker.save();

    // Add worker to farm's worker array
    farm.workers.push(workerId);
    await farm.save();

    await farmWorker.populate('user', 'firstName lastName email phone');

    res.status(201).json({
        success: true,
        message: 'Worker assigned successfully',
        data: farmWorker
    });
});

// Assign veterinarian to farm
const assignVeterinarian = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const { veterinarianId, contractType, services, availability, rates } = req.body;
    const farmerId = req.user?.id;

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: farmerId, isActive: true });
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }

    // Verify veterinarian exists and has correct role
    const veterinarian = await User.findOne({ _id: veterinarianId, role: 'veterinary' });
    if (!veterinarian) {
        return res.status(404).json({ message: 'Veterinarian not found' });
    }

    // Check if veterinarian is already assigned to this farm
    const existingAssignment = await Veterinarian.findOne({ 
        veterinarian: veterinarianId, 
        farm: farmId,
        isActive: true 
    });
    if (existingAssignment) {
        return res.status(400).json({ message: 'Veterinarian is already assigned to this farm' });
    }

    // Create veterinarian assignment
    const vetAssignment = new Veterinarian({
        veterinarian: veterinarianId,
        farm: farmId,
        assignedBy: farmerId,
        contractType,
        services,
        availability,
        rates
    });

    await vetAssignment.save();

    // Add veterinarian to farm's assigned veterinarians array
    farm.assignedVeterinarians.push(veterinarianId);
    await farm.save();

    await vetAssignment.populate('veterinarian', 'firstName lastName email phone licenseNumber specialization');

    res.status(201).json({
        success: true,
        message: 'Veterinarian assigned successfully',
        data: vetAssignment
    });
});

// Get farm workers
const getFarmWorkers = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const farmerId = req.user?.id;

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: farmerId, isActive: true });
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }

    const workers = await FarmWorker.find({ farm: farmId, isActive: true })
        .populate('user', 'firstName lastName email phone')
        .sort({ assignedDate: -1 });

    res.json({
        success: true,
        count: workers.length,
        data: workers
    });
});

// Get farm veterinarians
const getFarmVeterinarians = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const farmerId = req.user?.id;

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: farmerId, isActive: true });
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }

    const veterinarians = await Veterinarian.find({ farm: farmId, isActive: true })
        .populate('veterinarian', 'firstName lastName email phone licenseNumber specialization')
        .sort({ assignedDate: -1 });

    res.json({
        success: true,
        count: veterinarians.length,
        data: veterinarians
    });
});

// Deactivate farm (soft delete)
const deactivateFarm = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const farmerId = req.user?.id;

    // Find farm and verify ownership
    const farm = await Farm.findOne({ _id: farmId, owner: farmerId });
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found or you do not have permission to deactivate this farm' });
    }

    // Soft delete by setting isActive to false
    farm.isActive = false;
    await farm.save();

    // Optional: You can also deactivate related records
    // await FarmWorker.updateMany({ farm: farmId }, { isActive: false });
    // await Animal.updateMany({ farmId: farmId }, { isActive: false });

    res.json({
        success: true,
        message: 'Farm deactivated successfully'
    });
});

// Delete farm (permanent delete)
const deleteFarm = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const farmerId = req.user?.id;

    // Find farm and verify ownership
    const farm = await Farm.findOne({ _id: farmId, owner: farmerId });
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found or you do not have permission to delete this farm' });
    }

    // Permanently delete the farm
    await Farm.deleteOne({ _id: farmId });

    // Optional: Delete related records
    // await FarmWorker.deleteMany({ farm: farmId });
    // await Animal.deleteMany({ farmId: farmId });
    // await Notification.deleteMany({ farmId: farmId });

    res.json({
        success: true,
        message: 'Farm permanently deleted'
    });
});

const farmController = {
    getFarms,
    getFarmById,
    createFarm,
    updateFarm,
    deactivateFarm,
    deleteFarm,
    assignWorker,
    assignVeterinarian,
    getFarmWorkers,
    getFarmVeterinarians
};

export default farmController;