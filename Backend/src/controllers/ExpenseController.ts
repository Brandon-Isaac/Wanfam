import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/AsyncHandler';
import { Expense } from '../models/Expense';
import { Farm } from '../models/Farm';
import { notifyLargeExpense } from '../utils/notificationService';

// Create new expense record
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
    const { farmId, category, subcategory, amount, currency, date, description, animalId, workerId, inventoryId, vendor, paymentMethod, paymentStatus, isRecurring, recurringFrequency, invoiceNumber, receiptNumber, notes } = req.body;

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to add expense to this farm' });
    }

    const expense = await Expense.create({
        farmId,
        category,
        subcategory,
        amount,
        currency,
        date,
        description,
        animalId,
        workerId,
        inventoryId,
        vendor,
        paymentMethod,
        paymentStatus,
        isRecurring,
        recurringFrequency,
        invoiceNumber,
        receiptNumber,
        notes,
        recordedBy: req.user.id
    });
    
    // Notify farmer about large expenses (over 50,000)
    if (amount > 50000) {
        await notifyLargeExpense(
            req.user.id,
            amount,
            category,
            expense._id.toString()
        );
    }

    res.status(201).json(expense);
});

// Get all expense records for a farm
export const getFarmExpenses = asyncHandler(async (req: Request, res: Response) => {
    const { farmId } = req.params;
    const { startDate, endDate, category, paymentStatus, isRecurring } = req.query;

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
    if (category) filter.category = category;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (isRecurring !== undefined) filter.isRecurring = isRecurring === 'true';

    const expenses = await Expense.find(filter)
        .populate('animalId', 'tagId name species')
        .populate('workerId', 'firstName lastName username')
        .populate('recordedBy', 'firstName lastName username')
        .sort({ date: -1 });

    res.json(expenses);
});

// Get single expense record
export const getExpense = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const expense = await Expense.findById(id)
        .populate('farmId', 'name')
        .populate('animalId', 'tagId name species')
        .populate('workerId', 'firstName lastName username')
        .populate('recordedBy', 'firstName lastName username');

    if (!expense) {
        return res.status(404).json({ message: 'Expense record not found' });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: expense.farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to view this expense record' });
    }

    res.json(expense);
});

// Update expense record
export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
        return res.status(404).json({ message: 'Expense record not found' });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: expense.farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to update this expense record' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.json(updatedExpense);
});

// Delete expense record
export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
        return res.status(404).json({ message: 'Expense record not found' });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: expense.farmId, owner: req.user.id });
    if (!farm) {
        return res.status(403).json({ message: 'Not authorized to delete this expense record' });
    }

    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense record deleted successfully' });
});

// Get expense summary/statistics
export const getExpenseSummary = asyncHandler(async (req: Request, res: Response) => {
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

    // Total expenses
    const totalExpenses = await Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Expenses by category
    const expensesByCategory = await Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
    ]);

    // Expenses by month
    const expensesByMonth = await Expense.aggregate([
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

    // Recurring expenses
    const recurringExpenses = await Expense.aggregate([
        { $match: { ...matchFilter, isRecurring: true } },
        { $group: { _id: '$recurringFrequency', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Pending payments
    const pendingPayments = await Expense.aggregate([
        { $match: { ...matchFilter, paymentStatus: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: '$paymentStatus', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
        totalExpenses: totalExpenses[0]?.total || 0,
        expensesByCategory,
        expensesByMonth,
        recurringExpenses,
        pendingPayments
    });
});
