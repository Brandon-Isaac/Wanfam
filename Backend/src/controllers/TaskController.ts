import { Task } from "../models/Task";
import { Farm } from "../models/Farm";
import { User } from "../models/User";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import notificationService from "../utils/notificationService";

const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const tasks = await Task.find({ farmId: farm._id });
    res.json({ success: true, data: tasks });
});

const getTaskById= asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const taskId = req.params.taskId;
    const task = await Task.findOne({ _id: taskId, farmId: farm._id })
        .populate('assignedTo', 'firstName lastName');
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    res.json({ success: true, data: task });
});

const createTask = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const userId= req.user?.id;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const createdBy = await User.findById(userId);
    if (!createdBy) {
        return res.status(404).json({ message: "User not found" });
    }
    const { title, description, assignedTo, dueDate, taskCategory, priority, status } = req.body;
    const newTask = new Task({ title, description, farmId: farm._id, createdBy: createdBy._id, assignedTo, dueDate, taskCategory, priority, status });
    await newTask.save();
    
    // Notify assigned worker(s) about new task
    try {
        if (assignedTo) {
            const workers = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
            for (const workerId of workers) {
                await notificationService.notifyTaskAssignment(
                    workerId,
                    title,
                    newTask._id.toString()
                );
            }
        }
    } catch (notifError) {
        console.error('Error sending task assignment notification:', notifError);
    }
    
    res.status(201).json({ success: true, data: newTask });
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const taskId = req.params.taskId;
    const task = await Task.findOne({ _id: taskId, farmId: farm._id });
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    const { title, description, assignedTo, dueDate, taskCategory, priority, status } = req.body;
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (dueDate) task.dueDate = dueDate;
    if (taskCategory) task.taskCategory = taskCategory;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    await task.save();
    res.json({ success: true, data: task });
});

const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    const { status } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    task.status = status;
    await task.save();
    res.json({ success: true, data: task });
});
    
const assignTasksToWorkers = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const { taskId, workerIds } = req.body;
    const task = await Task.findOne({ _id: taskId, farmId: farm._id });
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    const workers = await User.find({ _id: { $in: workerIds }, farmId: farm._id, role: 'worker' });
    if (!workers || workers.length === 0) {
        return res.status(404).json({ message: "No workers found" });
    }
    if (!task.assignedTo) {
        task.assignedTo = [];
    }
    task.assignedTo.push(...workers.map(worker => worker._id as any));
    await task.save();
    res.json({ success: true, data: task });
});

const markTaskAsCompleted = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId).populate('createdBy');
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    task.status = "Completed";
    await task.save();
    
    // Notify task creator about completion
    try {
        if (task.createdBy) {
            const completedBy = req.user?.firstName || 'A worker';
            await notificationService.notifyTaskCompletion(
                (task.createdBy as any)._id,
                task.title,
                completedBy,
                task._id.toString()
            );
        }
    } catch (notifError) {
        console.error('Error sending task completion notification:', notifError);
    }
    
    res.json({ success: true, data: task });
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const taskId = req.params.taskId;
    const task = await Task.findOne({ _id: taskId, farmId: farm._id });
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.json({ success: true, message: "Task deleted successfully" });
});

export const TaskController = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
        updateTaskStatus,
    deleteTask,
    assignTasksToWorkers,
    markTaskAsCompleted
};
