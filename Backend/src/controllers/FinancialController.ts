import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/AsyncHandler';
import { Revenue } from '../models/Revenue';
import { Expense } from '../models/Expense';
import { Farm } from '../models/Farm';

// Get comprehensive financial overview for a farm
export const getFinancialOverview = asyncHandler(async (req: Request, res: Response) => {
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

    // Get total revenue
    const totalRevenue = await Revenue.aggregate([
        { $match: matchFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get total expenses
    const totalExpenses = await Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const netProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0;

    // Revenue breakdown
    const revenueBySource = await Revenue.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$source', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
    ]);

    const revenueByCategory = await Revenue.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
    ]);

    // Expense breakdown
    const expensesByCategory = await Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
    ]);

    // Monthly trends
    const monthlyTrends = await Promise.all([
        Revenue.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { 
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        Expense.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { 
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    expenses: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
    ]);

    // Combine monthly data
    const monthlyData: any = {};
    monthlyTrends[0].forEach((item: any) => {
        const key = `${item._id.year}-${item._id.month}`;
        monthlyData[key] = { ...item._id, revenue: item.revenue, expenses: 0 };
    });
    monthlyTrends[1].forEach((item: any) => {
        const key = `${item._id.year}-${item._id.month}`;
        if (monthlyData[key]) {
            monthlyData[key].expenses = item.expenses;
        } else {
            monthlyData[key] = { ...item._id, revenue: 0, expenses: item.expenses };
        }
    });

    const monthlyFinancials = Object.values(monthlyData).map((item: any) => ({
        year: item.year,
        month: item.month,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.revenue - item.expenses
    }));

    // Payment status
    const pendingRevenue = await Revenue.aggregate([
        { $match: { ...matchFilter, paymentStatus: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: '$paymentStatus', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const pendingExpenses = await Expense.aggregate([
        { $match: { ...matchFilter, paymentStatus: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: '$paymentStatus', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Recent transactions
    const recentRevenue = await Revenue.find(matchFilter)
        .sort({ date: -1 })
        .limit(5)
        .populate('animalId', 'tagId name')
        .populate('recordedBy', 'firstName lastName');

    const recentExpenses = await Expense.find(matchFilter)
        .sort({ date: -1 })
        .limit(5)
        .populate('animalId', 'tagId name')
        .populate('recordedBy', 'firstName lastName');

    res.json({
        summary: {
            totalRevenue: revenue,
            totalExpenses: expenses,
            netProfit,
            profitMargin: parseFloat(profitMargin as string)
        },
        revenue: {
            total: revenue,
            bySource: revenueBySource,
            byCategory: revenueByCategory,
            pending: pendingRevenue
        },
        expenses: {
            total: expenses,
            byCategory: expensesByCategory,
            pending: pendingExpenses
        },
        monthlyTrends: monthlyFinancials,
        recentTransactions: {
            revenue: recentRevenue,
            expenses: recentExpenses
        }
    });
});

// Get profit/loss statement
export const getProfitLossStatement = asyncHandler(async (req: Request, res: Response) => {
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

    // Revenue details by category
    const revenueByCategory = await Revenue.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
    ]);

    const totalRevenue = revenueByCategory.reduce((sum, item) => sum + item.total, 0);

    // Expense details by category
    const expensesByCategory = await Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
    ]);

    const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.total, 0);

    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = grossProfit; // Can add more adjustments here

    res.json({
        period: {
            startDate: startDate || 'All time',
            endDate: endDate || 'Present'
        },
        revenue: {
            breakdown: revenueByCategory,
            total: totalRevenue
        },
        expenses: {
            breakdown: expensesByCategory,
            total: totalExpenses
        },
        profit: {
            gross: grossProfit,
            net: netProfit,
            margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
        }
    });
});

// Get cash flow statement
export const getCashFlow = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify farm access
    const farm = await Farm.findOne({ _id: farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to view this farm' });
    }

    const matchFilter: any = { farmId, paymentStatus: 'completed' };
    if (startDate || endDate) {
        matchFilter.date = {};
        if (startDate) matchFilter.date.$gte = new Date(startDate as string);
        if (endDate) matchFilter.date.$lte = new Date(endDate as string);
    }

    // Cash inflows
    const cashInflows = await Revenue.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                total: { $sum: '$amount' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Cash outflows
    const cashOutflows = await Expense.aggregate([
        { $match: matchFilter },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                total: { $sum: '$amount' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Calculate net cash flow by month
    const cashFlowByMonth: any = {};
    cashInflows.forEach(item => {
        cashFlowByMonth[item._id] = { month: item._id, inflow: item.total, outflow: 0 };
    });
    cashOutflows.forEach(item => {
        if (cashFlowByMonth[item._id]) {
            cashFlowByMonth[item._id].outflow = item.total;
        } else {
            cashFlowByMonth[item._id] = { month: item._id, inflow: 0, outflow: item.total };
        }
    });

    const cashFlow = Object.values(cashFlowByMonth).map((item: any) => ({
        ...item,
        netCashFlow: item.inflow - item.outflow
    }));

    const totalCashInflow = cashInflows.reduce((sum, item) => sum + item.total, 0);
    const totalCashOutflow = cashOutflows.reduce((sum, item) => sum + item.total, 0);

    res.json({
        period: {
            startDate: startDate || 'All time',
            endDate: endDate || 'Present'
        },
        summary: {
            totalInflow: totalCashInflow,
            totalOutflow: totalCashOutflow,
            netCashFlow: totalCashInflow - totalCashOutflow
        },
        monthlyBreakdown: cashFlow
    });
});
