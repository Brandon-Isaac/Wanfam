import { Investment } from "../models/Investment";
import { Wage } from "../models/Wages";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";

const createInvestment = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const { name, category, initialAmount, currency, date_invested, expectedReturnRate, riskLevel, status, description, notes } = req.body;
    const newInvestment = new Investment({
        farmId: farmSlug,
        name,
        category,
        initialAmount,
        currency,
        date_invested,
        expectedReturnRate,
        riskLevel,
        status,
        description,
        notes
    });
    await newInvestment.save();
    res.status(201).json({ message: "Investment created successfully" });
});

const updateInvestmentDetails = asyncHandler(async (req: Request, res: Response) => {
    const { investmentId } = req.params;
    const { expectedReturnRate, riskLevel, status, description, notes } = req.body;
    const investment = await Investment.findByIdAndUpdate(investmentId, { expectedReturnRate, riskLevel, status, description, notes }, { new: true });
    if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
    }
    await investment.save();
    res.status(200).json({ message: "Investment updated successfully", investment });
});

const deleteInvestment = asyncHandler(async (req: Request, res: Response) => {
    const { investmentId } = req.params;
    const investment = await Investment.findByIdAndDelete(investmentId);
    if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
    }
    await investment.deleteOne();
    res.status(200).json({ message: "Investment deleted successfully" });
});

const getInvestmentSummary = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const investments = await Investment.find({ farmId });
    const totalInvested = investments.reduce((total, inv) => total + inv.initialAmount, 0);
    res.status(200).json({ totalInvested });
});

const getWageSummary = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const wages = await Wage.find({ farmId });
    const totalWages = wages.reduce((total, wage) => total + wage.amount, 0);
    res.status(200).json({ totalWages });
});

const getOverallFinancialSummary = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const investments = await Investment.find({ farmId });
    const wages = await Wage.find({ farmId });  
    const totalInvested = investments.reduce((total, inv) => total + inv.initialAmount, 0);
    const totalWages = wages.reduce((total, wage) => total + wage.amount, 0);
    res.status(200).json({ totalInvested, totalWages });
});

export const CapitalController = {
    createInvestment,
    updateInvestmentDetails,
    deleteInvestment,
    getInvestmentSummary,
    getWageSummary,
    getOverallFinancialSummary
};