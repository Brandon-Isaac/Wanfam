import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/AsyncHandler';
import { Revenue } from '../models/Revenue';
import { Farm } from '../models/Farm';
import { notifyRevenueRecorded } from '../utils/notificationService';
import { AIService } from '../services/AIService';
// Create new revenue record
export const createRevenue = asyncHandler(async (req: Request, res: Response) => {
    const { farmId, source, category, amount, currency, date, description, animalId, productType, quantity, unit, pricePerUnit, buyer, paymentMethod, paymentStatus, invoiceNumber, receiptNumber, notes } = req.body;

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to add revenue to this farm' });
    }

    const revenue = await Revenue.create({
        farmId,
        source,
        category,
        amount,
        currency,
        date,
        description,
        animalId,
        productType,
        quantity,
        unit,
        pricePerUnit,
        buyer,
        paymentMethod,
        paymentStatus,
        invoiceNumber,
        receiptNumber,
        notes,
        recordedBy: req.user.id
    });
    
    // Notify farmer about revenue recorded
    await notifyRevenueRecorded(
        req.user.id,
        amount,
        source,
        revenue._id.toString()
    );

    res.status(201).json(revenue);
});

// Get all revenue records for a farm
export const getFarmRevenues = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const { startDate, endDate, source, category, paymentStatus } = req.query;

    // Verify farm access
    const farm = await Farm.findOne({ _id: farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to view this farm' });
    }

    const filter: any = { farmId };

    // Apply filters
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate as string);
        if (endDate) filter.date.$lte = new Date(endDate as string);
    }
    if (source) filter.source = source;
    if (category) filter.category = category;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const revenues = await Revenue.find(filter)
        .populate('animalId', 'tagId name species')
        .populate('recordedBy', 'firstName lastName username')
        .sort({ date: -1 });

    res.json({ success: true, data: revenues });
});

// Get single revenue record
export const getRevenue = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const revenue = await Revenue.findById(id)
        .populate('farmId', 'name')
        .populate('animalId', 'tagId name species')
        .populate('recordedBy', 'firstName lastName username');

    if (!revenue) {
        return res.status(404).json({ message: 'Revenue record not found' });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: revenue.farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to view this revenue record' });
    }

    res.json(revenue);
});

// Update revenue record
export const updateRevenue = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const revenue = await Revenue.findById(id);
    if (!revenue) {
        return res.status(404).json({ message: 'Revenue record not found' });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: revenue.farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to update this revenue record' });
    }

    const updatedRevenue = await Revenue.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.json(updatedRevenue);
});

// Delete revenue record
export const deleteRevenue = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const revenue = await Revenue.findById(id);
    if (!revenue) {
        return res.status(404).json({ message: 'Revenue record not found' });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: revenue.farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to delete this revenue record' });
    }

    await Revenue.findByIdAndDelete(id);
    res.json({ message: 'Revenue record deleted successfully' });
});

// Get revenue summary/statistics
export const getRevenueSummary = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify farm access
    const farm = await Farm.findOne({ _id: farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to view this farm' });
    }

    const matchFilter: any = { farmId };
    if (startDate || endDate) {
        matchFilter.date = {};
        if (startDate) matchFilter.date.$gte = new Date(startDate as string);
        if (endDate) matchFilter.date.$lte = new Date(endDate as string);
    }

    // Total revenue
    const totalRevenue = await Revenue.aggregate([
        { $match: matchFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Revenue by source
    const revenueBySource = await Revenue.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$source', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
    ]);

    // Revenue by category
    const revenueByCategory = await Revenue.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
    ]);

    // Revenue by month
    const revenueByMonth = await Revenue.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: { 
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Pending payments
    const pendingPayments = await Revenue.aggregate([
        { $match: { ...matchFilter, paymentStatus: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: '$paymentStatus', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueBySource,
        revenueByCategory,
        revenueByMonth,
        pendingPayments
    });
});

export const generateReccommendationsWithAi=asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { startDate, endDate, additionalContext } = req.body;
    
    // Verify farm access
    const farm = await Farm.findOne({ _id: farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to view this farm' });
    }

    // Set default date range (last 90 days if not provided)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

    const dateFilter = { farmId, date: { $gte: start, $lte: end } };

    // Gather comprehensive financial data
    const [revenues, expenses] = await Promise.all([
        Revenue.find(dateFilter).populate('animalId', 'tagId name species breed'),
        require('../models/Expense').Expense.find(dateFilter).populate('animalId', 'tagId name species')
    ]);

    // Calculate revenue analytics
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const revenueBySource = revenues.reduce((acc: any, r) => {
        acc[r.source] = (acc[r.source] || 0) + r.amount;
        return acc;
    }, {});
    const revenueByCategory = revenues.reduce((acc: any, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.amount;
        return acc;
    }, {});

    // Calculate expense analytics
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const expensesByCategory = expenses.reduce((acc: any, e: any) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});

    // Calculate profitability
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Identify trends
    const monthlyData = revenues.reduce((acc: any, r) => {
        const month = new Date(r.date).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = { revenue: 0, count: 0 };
        acc[month].revenue += r.amount;
        acc[month].count += 1;
        return acc;
    }, {});

    const monthlyExpenses = expenses.reduce((acc: any, e: any) => {
        const month = new Date(e.date).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month] += e.amount;
        return acc;
    }, {});

    // Get top performers
    const topRevenueSources = Object.entries(revenueBySource)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5);
    
    const topExpenseCategories = Object.entries(expensesByCategory)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5);

    // Prepare comprehensive context
    const comprehensiveContext = {
        farmInfo: {
            name: farm.name,
            size: farm.size,
            currency: 'KES'
        },
        analysisperiod: {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            daysAnalyzed: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        },
        financialSummary: {
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin: profitMargin.toFixed(2) + '%',
            revenueCount: revenues.length,
            expenseCount: expenses.length
        },
        revenueAnalysis: {
            totalRevenue,
            bySource: revenueBySource,
            byCategory: revenueByCategory,
            topSources: topRevenueSources,
            averageRevenuePerTransaction: revenues.length > 0 ? (totalRevenue / revenues.length).toFixed(2) : 0
        },
        expenseAnalysis: {
            totalExpenses,
            byCategory: expensesByCategory,
            topCategories: topExpenseCategories,
            averageExpensePerTransaction: expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : 0
        },
        trends: {
            monthlyRevenue: monthlyData,
            monthlyExpenses: monthlyExpenses
        },
        additionalContext: additionalContext || 'No additional context provided'
    };

    const aiService = new AIService();
    const recommendations = await aiService.getRevenueRecommendations(comprehensiveContext);
    
    res.json({ 
        success: true, 
        data: {
            recommendations,
            context: comprehensiveContext
        }
    });
});