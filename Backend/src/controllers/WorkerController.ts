import { User } from "../models/User";
import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";
import { Response,Request } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Wage } from "../models/Wages";
import {Task} from "../models/Task";
import bcrypt from "bcryptjs";

const getWorkerTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const tasks = await Task.find({ assignedTo: { $in: [userId] } });
    res.json({ success: true, data: tasks });
});

const getAvailableWorkers = asyncHandler(async (req: Request, res: Response) => {
   const workers = await User.find({ role: 'worker', farmId: null }).select('-password');
   res.json({ success: true, data: workers });
});

const getAllWorkers = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const workers = await User.find({ farmId: farm._id, role: 'worker' }).select('-password');
    res.json({ success: true, data: workers });
});

const getWorkerById = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const workerId = req.params.workerId;
    const worker = await User.findOne({ _id: workerId, farmId: farm._id, role: 'worker' }).select('-password');
    if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
    }
    res.json({ success: true, data: worker });
});

const createWorker = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { firstName, lastName, email, phone, wages, password } = req.body;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newWorker = new User({ firstName, lastName, email, phone, farmId: farm._id, role: 'worker', password: hashedPassword, wages });
    await newWorker.save();
    res.status(201).json({ success: true, data: newWorker });
});

const updateWorker = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const workerId = req.params.workerId;
    const { firstName, lastName, email, phone, wages } = req.body;
    const worker = await User.findOne({ _id: workerId, farmId: farm._id, role: 'worker' });
    if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
    }
    worker.firstName = firstName || worker.firstName;
    worker.lastName = lastName || worker.lastName;
    worker.email = email || worker.email;
    worker.phone = phone || worker.phone;
    worker.wages = wages || worker.wages;
    await worker.save();
    res.json({ success: true, data: worker });
});

const deleteWorker = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const workerId = req.params.workerId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const worker = await User.findOne({ _id: workerId, farmId: farm._id, role: 'worker' });
    if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
    }
    await User.deleteOne({ _id: worker._id });
    res.json({ success: true, message: "Worker deleted successfully" });
});

const employWorker = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { workerId, wages } = req.body;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const worker = await User.findById(workerId);
    if (!worker) {
        return res.status(404).json({ message: "User not found" });
    }
    if (worker.farmId) {
        return res.status(400).json({ message: "Worker is already employed at another farm" });
    }
    worker.farmId = farm._id as any;
    worker.wages = wages;
    await worker.save();
    res.status(201).json({ success: true, data:{ farmId: farm._id, farmName: farm.name, workerName: worker.firstName, wages } });
});

const employWorkers = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { workerIds, wages } = req.body;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const workers = await User.find({ _id: { $in: workerIds }, farmId: farm._id, role: 'worker' }).select('-password');
    if (!workers || workers.length === 0) {
        return res.status(404).json({ message: "No workers found" });
    }
    res.status(201).json({ success: true, data:{ farmName: farm.name, workers: workers.map(worker => worker.firstName), wages } });
});

const dismissWorker = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const workerId = req.params.workerId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const worker = await User.findOne({ _id: workerId, role: 'worker' });
    if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
    }
    worker.farmId = null as any;
    worker.wages = 0;
    await worker.save();
    res.json({ success: true, message: "Worker dismissed" });
});

const createTotalFarmWages = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const workers = await User.find({ farmId: farm._id, role: 'worker' });
    const totalWages = workers.reduce((total, worker) => total + (worker.wages || 0), 0);
    await Wage.create({ farmId: farm._id, amount: totalWages, employees: ['FarmWorker'], currency: 'USD', paymentDate: new Date(), paymentMethod: 'bank_transfer', notes: 'Monthly wage payout' });
    res.json({ success: true, data: { totalWages } });
});

const assignWorkerToAnimal = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    const { workerId } = req.body;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    const worker = await User.findOne({ _id: workerId, farmId: farm._id, role: 'worker' });
    if (!worker) {
        return res.status(404).json({ message: "Worker not found" });
    }
    animal.assignedWorker = worker._id as any;
    await animal.save();
    res.json({ success: true, message: "Worker assigned to animal", data: animal });
});

export const WorkerController = { getAvailableWorkers, getAllWorkers, getWorkerById, employWorker, employWorkers, dismissWorker, assignWorkerToAnimal, createWorker, updateWorker, deleteWorker, createTotalFarmWages, getWorkerTasks };