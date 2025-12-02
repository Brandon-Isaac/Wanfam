import { Wage } from "../models/Wages";
import { FarmWorker } from "../models/FarmWorker";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";

const getWagesForFarm = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const wages = await Wage.find({ farmId });
    res.status(200).json(wages);
});

export const WageController = { getWagesForFarm };