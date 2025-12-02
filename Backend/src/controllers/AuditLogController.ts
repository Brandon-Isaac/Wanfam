import { AuditLog } from "../models/AuditLog";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";

const getRecentAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(Number(limit));
    res.status(200).json(logs);
});

const addLogEntry = asyncHandler(async (req: Request, res: Response) => {
    const { userId, action, entityType, entityId, details } = req.body;
    const newLog = new AuditLog({ userId, action, entityType, entityId, details });
    await newLog.save();
    res.status(201).json(newLog);
});


export const AuditLogController = {
    getRecentAuditLogs,
    addLogEntry
};