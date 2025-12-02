import { Report } from '../models/Report';
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/AsyncHandler';
import {AIService} from "../services/AIService";
import { Farm } from '../models/Farm';

// Create a new report
const createReport = asyncHandler(async (req: Request, res: Response) => {
    const { farmId, reportType, reportDuration, generatedAt, generatedBy, contentSummary, fileUrl, notes } = req.body;
    if (!farmId || !reportType || !generatedAt || !generatedBy || !contentSummary) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const report = new Report({
        farmId,
        reportType,
        reportDuration,
        generatedAt,
        generatedBy,
        contentSummary,
        fileUrl,
        notes
    });

    await report.save();

    return res.status(201).json(report);
});

// Get reports for a specific farm with optional filters
const getReportsByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({slug: farmSlug});
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }
    const { reportType, startDate, endDate } = req.query;
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }
    const filter: any = { farmId: farm._id };
    if (reportType) {
        filter.reportType = reportType;
    }
    if (startDate || endDate) {
        filter.generatedAt = {};
        if (startDate) {
            filter.generatedAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
            filter.generatedAt.$lte = new Date(endDate as string);
        }
    }

    const reports = await Report.find(filter);
    return res.status(200).json(reports);
});

const generateReportWithAi = asyncHandler(async (req: Request, res: Response) => {
    const { farmId, reportType, reportDuration, generatedBy, contentSummary, notes } = req.body;
    if (!farmId || !reportType || !generatedBy || !contentSummary) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
    }

    const aiService = new AIService();
    const reportData = await aiService.generateTextStream({
        farmId,
        reportType,
        reportDuration,
        generatedBy,
        contentSummary,
        notes
    });

    return res.status(200).json(reportData);
});

const updateReport = asyncHandler(async (req: Request, res: Response) => {
    const reportId = req.params.id;
    const { reportType, reportDuration, contentSummary, fileUrl, notes } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
        return res.status(404).json({ message: 'Report not found' });
    }

    report.reportType = reportType || report.reportType;
    report.reportDuration = reportDuration || report.reportDuration;
    report.contentSummary = contentSummary || report.contentSummary;
    report.fileUrl = fileUrl || report.fileUrl;
    report.notes = notes || report.notes;

    await report.save();

    return res.status(200).json(report);
});

export const ReportController = {
    createReport,
    getReportsByFarm,
    generateReportWithAi,
    updateReport
};