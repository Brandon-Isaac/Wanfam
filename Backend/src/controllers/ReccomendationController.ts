import RecommendationService from "../services/ReccomendationSerrvice";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";

const recommendInvestments = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const recommendations = await RecommendationService.recommendInvestments(farmId);
    res.status(200).json(recommendations);
});

const recommendFeedingSchedules = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const schedules = await RecommendationService.recommendFeedingSchedules(farmId);
    res.status(200).json(schedules);
});

const recommendHealthChecks = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const recommendations = await RecommendationService.recommendHealthChecks(farmId);
    res.status(200).json(recommendations);
});
const recommendFarmImprovements = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const improvements = await RecommendationService.recommendFarmImprovements(farmId);
    res.status(200).json(improvements);
});

export const RecommendationController = {
    recommendInvestments,
    recommendFeedingSchedules,
    recommendHealthChecks,
    recommendFarmImprovements
};