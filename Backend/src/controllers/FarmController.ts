import { Request, Response } from 'express';
import {asyncHandler} from '../middleware/AsyncHandler';
import { Farm } from '../models/Farm';
import { FarmWorker } from '../models/FarmWorker';
import { Veterinarian } from '../models/Veterinarian';
import { User } from '../models/User';
import { Animal } from '../models/Animal';

// Get farms
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

//Get All System Farms
const getAllFarms = asyncHandler(async (req: Request, res: Response) => {
    const farms = await Farm.find({ isActive: true })
        .populate('owner', 'firstName lastName email phone')
        .populate('workers', 'firstName lastName email phone')
        .populate('assignedVeterinarians', 'firstName lastName email phone licenseNumber specialization')
        .sort({ createdAt: -1 });
    res.json({
        success: true,
        count: farms.length,
        data: farms
    });
});

// Get analytics for a specific farm
const getFarmAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const farmerId = req.user?.id;
    const userRole = req.user?.role;

    // Verify farm exists and user has access
    let farm;
    if (userRole === 'admin') {
        farm = await Farm.findOne({ _id: farmId, isActive: true });
    } else {
        farm = await Farm.findOne({ _id: farmId, owner: farmerId, isActive: true });
    }

    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }

    // Get total animals for this farm (removed isActive check - Animal model doesn't have this field)
    const totalAnimals = await Animal.countDocuments({ farmId: farm._id });
    
    // Get animals by species
    const speciesData = await Animal.aggregate([
        { $match: { farmId: farm._id } },
        { $group: { _id: '$species', count: { $sum: 1 } } }
    ]);
    const animalsBySpecies: Record<string, number> = {};
    speciesData.forEach(item => {
        animalsBySpecies[item._id] = item.count;
    });

    // Get health distribution - properly categorize all health statuses
    const healthData = await Animal.aggregate([
        { $match: { farmId: farm._id } },
        { $group: { _id: '$healthStatus', count: { $sum: 1 } } }
    ]);
    const healthDistribution = {
        healthy: 0,
        sick: 0,
        critical: 0
    };
    healthData.forEach(item => {
        if (item._id === 'healthy') {
            healthDistribution.healthy = item.count;
        } else if (['sick', 'treatment', 'recovery'].includes(item._id)) {
            healthDistribution.sick += item.count;
        } else if (['critical', 'quarantined', 'deceased'].includes(item._id)) {
            healthDistribution.critical += item.count;
        }
    });

    // Get farm's land size
    const totalLand = farm.size?.value || 0;

    // Calculate average animals per acre
    const avgAnimalsPerFarm = totalLand > 0 ? (totalAnimals / totalLand) : 0;

    // Get top performing farms (for comparison)
    const topFarms = await Farm.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name location size');
    
    const topFarmsWithAnimals = await Promise.all(topFarms.map(async (f) => {
        const animalCount = await Animal.countDocuments({ farmId: f._id });
        return {
            _id: f._id,
            name: f.name,
            location: f.location?.county || 'Unknown',
            totalAnimals: animalCount,
            landSize: f.size?.value || 0
        };
    }));

    const analytics = {
        totalFarms: 1,
        activeFarms: 1,
        totalAnimals,
        totalLand,
        avgAnimalsPerFarm,
        topFarms: topFarmsWithAnimals,
        animalsBySpecies,
        healthDistribution
    };

    res.json({
        success: true,
        data: analytics
    });
});

//Get systems Farm analytics
const getAllSystemFarmAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const farms = await Farm.find({ isActive: true });
    const totalFarms = farms.length;
    const activeFarms = totalFarms;

    // Get total animals across all farms (removed isActive check)
    const totalAnimals = await Animal.countDocuments({});
    
    // Get animals by species (system-wide)
    const speciesData = await Animal.aggregate([
        { $group: { _id: '$species', count: { $sum: 1 } } }
    ]);
    const animalsBySpecies: Record<string, number> = {};
    speciesData.forEach(item => {
        animalsBySpecies[item._id] = item.count;
    });

    // Get total land size across all farms
    const landData = await Farm.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalSize: { $sum: '$size.value' } } }
    ]);
    const totalLand = landData.length > 0 ? landData[0].totalSize : 0;

    // Calculate average animals per farm
    const avgAnimalsPerFarm = totalFarms > 0 ? (totalAnimals / totalFarms) : 0;

    // Get health distribution (system-wide) - properly categorize all statuses
    const healthData = await Animal.aggregate([
        { $group: { _id: '$healthStatus', count: { $sum: 1 } } }
    ]);
    const healthDistribution = {
        healthy: 0,
        sick: 0,
        critical: 0
    };
    healthData.forEach(item => {
        if (item._id === 'healthy') {
            healthDistribution.healthy = item.count;
        } else if (['sick', 'treatment', 'recovery'].includes(item._id)) {
            healthDistribution.sick += item.count;
        } else if (['critical', 'quarantined', 'deceased'].includes(item._id)) {
            healthDistribution.critical += item.count;
        }
    });

    // Get top performing farms
    const topFarms = await Farm.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name location size');
    
    const topFarmsWithAnimals = await Promise.all(topFarms.map(async (farm) => {
        const animalCount = await Animal.countDocuments({ farmId: farm._id });
        return {
            _id: farm._id,
            name: farm.name,
            location: farm.location?.county || 'Unknown',
            totalAnimals: animalCount,
            landSize: farm.size?.value || 0
        };
    }));

    const analytics = {
        totalFarms,
        activeFarms,
        totalAnimals,
        totalLand,
        avgAnimalsPerFarm,
        topFarms: topFarmsWithAnimals,
        animalsBySpecies,
        healthDistribution
    };

    res.json({
        success: true,
        data: analytics
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
    await Farm.deleteOne({ _id: farmId });

    res.json({
        success: true,
        message: 'Farm permanently deleted'
    });
});

const farmController = {
    getFarms,
    getAllFarms,
    getFarmById,
    createFarm,
    updateFarm,
    deactivateFarm,
    deleteFarm,
    assignWorker,
    assignVeterinarian,
    getFarmWorkers,
    getFarmVeterinarians,
    getFarmAnalytics,
    getAllSystemFarmAnalytics
};

export default farmController;