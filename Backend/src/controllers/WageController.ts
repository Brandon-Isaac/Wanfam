import { Wage } from "../models/Wages";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { notifyWagePayment } from "../utils/notificationService";

const getWagesForFarm = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const wages = await Wage.find({ farmId });
    res.status(200).json(wages);
});

const createWagePayment = asyncHandler(async (req: Request, res: Response) => {
    const { farmId, workerId, amount, paymentDate, paymentMethod, period } = req.body;
    
    if (!farmId || !workerId || !amount || !paymentDate || !paymentMethod) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    const newWage = new Wage({
        farmId,
        workerId,
        amount,
        paymentDate,
        paymentMethod,
        period
    });
    
    await newWage.save();
    
    // Notify worker about wage payment
    await notifyWagePayment(
        workerId,
        amount,
        period || 'current period',
        newWage._id.toString()
    );
    
    res.status(201).json({ success: true, data: newWage });
});

export const WageController = { getWagesForFarm, createWagePayment };