import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import { Veterinarian } from "../models/Veterinarian";
import { HealthRecord } from "../models/HealthRecord";
import { LoanRequest } from "../models/LoanRequest";
import mongoose from "mongoose";
import { LoanApproval } from "../models/LoanApproval";
import { VaccinationSchedule } from "../models/VaccinationSchedule";
import { VaccinationRecord } from "../models/VaccinationRecord";
import { DiseaseOutbreak } from "../models/DiseaseOutbreak";
import { FarmWorker } from "../models/FarmWorker";
import { AuditLog } from "../models/AuditLog";
import Inventory from "../models/Inventory";
import { Investment } from "../models/Investment";
import { Task } from "../models/Task";
import { Report } from "../models/Report";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Request, Response } from "express";
import { User } from "../models/User";
import { TreatmentSchedule } from "../models/TreatmentSchedule";
import { TreatmentRecord } from "../models/TreatmentRecord";
import { Revenue } from "../models/Revenue";
import { Expense } from "../models/Expense";

const farmerDashboardForFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmerId = req.user.id;

    const farmId= req.params.farmId;
    const farm = await Farm.findOne( { _id: farmId, owner: farmerId } );
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const farmName = farm.name;
    const totalAnimals = await Animal.countDocuments({ farmId });
    const totalVeterinarians = await Veterinarian.countDocuments({ farmId });
    const totalHealthRecords = await HealthRecord.countDocuments({ farmId });
    const sickAnimals = await Animal.countDocuments({ farmId, healthStatus: { $ne: 'healthy' } });
    const healthyLivestock = await Animal.countDocuments({ farmId, healthStatus: 'healthy' });
    const totalLoanRequests = await LoanRequest.countDocuments({ farmerId });
    const totalLoanApprovals = await LoanApproval.countDocuments({ farmerId });
    const totalVaccinationSchedules = await VaccinationSchedule.countDocuments({ farmId });
    const totalVaccinationRecords = await VaccinationRecord.countDocuments({ farmId });
    const totalDiseaseOutbreaks = await DiseaseOutbreak.countDocuments({ farmId });
    const totalFarmWorkers = await FarmWorker.countDocuments({ farmId });
    const totalInventoryItems = await Inventory.countDocuments({ farmId });
    const totalInvestments = await Investment.countDocuments({ farmId });
    const totalTasks = await Task.countDocuments({ farmId });
    const totalReports = await Report.countDocuments({ farmId });
    const pendingTasks = await Task.countDocuments({ farmId, status: { $ne: 'Complete' } });
    const upcomingCheckups = await VaccinationSchedule.find({ farmId, scheduledDate: { $gte: new Date() } }).limit(5).sort({ scheduledDate: 1 }) && await TreatmentSchedule.find({ farmId, scheduledDate: { $gte: new Date() } }).limit(5).sort({ scheduledDate: 1 });
    const upcomingCheckupsCount = (await VaccinationSchedule.countDocuments({ farmId, scheduledDate: { $gte: new Date() } })) + (await TreatmentSchedule.countDocuments({ farmId, scheduledDate: { $gte: new Date() } }));
    const recentActivity = await AuditLog.find({ farmId }).sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName username');
    const livestockSpeciesCount = await Animal.aggregate([
        { $match: { farmId } },
        { $group: { _id: "$species", count: { $sum: 1 } } }
    ]);

    // Financial data - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const farmObjectId = new mongoose.Types.ObjectId(farmId);

    const totalRevenue = await Revenue.aggregate([
        { $match: { farmId: farmObjectId, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Expense.aggregate([
        { $match: { farmId: farmObjectId, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueBySource = await Revenue.aggregate([
        { $match: { farmId: farmObjectId, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$source', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
    ]);

    const expensesByCategory = await Expense.aggregate([
        { $match: { farmId: farmObjectId, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
    ]);

    const netProfit = (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0);

    res.json({
        farmName,
        totalAnimals,
        healthyLivestock,
        totalVeterinarians,
        totalHealthRecords,
        totalLoanRequests,
        totalLoanApprovals,
        totalVaccinationSchedules,
        totalVaccinationRecords,
        totalDiseaseOutbreaks,
        totalFarmWorkers,
        totalInventoryItems,
        totalInvestments,
        totalTasks,
        totalReports,
        pendingTasks,
        sickAnimals,
        upcomingCheckups,
        recentActivity,
        livestockSpeciesCount,
        upcomingCheckupsCount,
        // Financial data
        totalRevenue: totalRevenue[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        netProfit,
        revenueBySource,
        expensesByCategory
    });
});

const farmerDashboard= asyncHandler(async (req: Request, res: Response) => {
    const farmerId = req.user.id;
    const farmIds = await Farm.find({ owner: farmerId }).select('_id');
    const totalFarms = await Farm.countDocuments({ owner: farmerId,isActive: true });
    const totalLoanRequests = await LoanRequest.countDocuments({ farmerId });
    const activity = await User.findById(farmerId).select('isActive createdAt updatedAt');
    const totalAnimals = await Animal.countDocuments( { farmId: { $in: farmIds } });
    const sickAnimals = await Animal.countDocuments({ farmId: { $in: farmIds }, healthStatus: { $ne: 'healthy' } });
    const healthyAnimals = await Animal.countDocuments({ farmId: { $in: farmIds }, healthStatus: 'healthy' });
    const recentActivity = await AuditLog.find({ userId: farmerId }).sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName username');
    const upcomingCheckups = await VaccinationSchedule.find({ 
       farmId: { $in: farmIds }, scheduledDate: { $gte: new Date()  } 
    });
    const upcomingCheckupsCount = await VaccinationSchedule.countDocuments({ 
        farmId: { $in: farmIds }, scheduledDate: { $gte: new Date() } 
    });
    const pendingTasks = await Task.countDocuments({ farmId: { $in: farmIds }, status: { $ne: 'Complete' } });

    // Financial data across all farms - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalRevenue = await Revenue.aggregate([
        { $match: { farmId: { $in: farmIds.map(f => f._id) }, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Expense.aggregate([
        { $match: { farmId: { $in: farmIds.map(f => f._id) }, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const netProfit = (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0);

    res.json({
        totalFarms,
        totalLoanRequests,
        activity,
        totalAnimals,
        sickAnimals,
        healthyAnimals,
        recentActivity,
        upcomingCheckups,
        upcomingCheckupsCount,
        pendingTasks,
        // Financial data
        totalRevenue: totalRevenue[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        netProfit
    });
        pendingTasks
    });

const vetDashboard = asyncHandler(async (req: Request, res: Response) => {
    const vetId = req.user?.id;
    const totalAssignedFarms = await User.countDocuments( {_id: vetId, role: 'veterinary', farmId: { $exists: true, $ne: [] } });
    const vaccinationCases = await VaccinationSchedule.countDocuments( { veterinarianId: vetId , status: 'scheduled' } );
    const totalVaccinationRecords = await VaccinationRecord.countDocuments( { veterinarianId: vetId } );
    const treatmentCases = await TreatmentSchedule.countDocuments( { administeredBy: vetId, status: 'scheduled' } );
    const totalTreatmentRecords = await TreatmentRecord.countDocuments( { administeredBy: vetId } );

    // Fetch vaccination appointments with farm and animal details
    const vaccinationAppointments = await VaccinationSchedule.find({ 
        veterinarianId: vetId, 
        scheduledDate: { $gte: new Date() },
        status: 'scheduled'
    })
    .populate('farmId', 'name')
    .populate('animalId', 'tagNumber')
    .limit(5)
    .sort({ scheduledDate: 1 });
    
    // Fetch treatment appointments with farm and animal details
    const treatmentAppointments = await TreatmentSchedule.find({ 
        administeredBy: vetId, 
        scheduledDate: { $gte: new Date() },
        status: 'scheduled'
    })
    .populate('farmId', 'name')
    .populate('animalId', 'tagId')
    .limit(5)
    .sort({ scheduledDate: 1 });
    
    // Combine and format appointments for frontend
    const upcomingAppointments = [
        ...vaccinationAppointments.map((apt: any) => ({
            farmName: apt.farmId?.name || 'N/A',
            animalId: apt.animalId.tagId,
            date: apt.scheduledDate,
            purpose: `Vaccination: ${apt.vaccineName || 'N/A'}`,
            type: 'vaccination'
        })),
        ...treatmentAppointments.map((apt: any) => ({
            farmName: apt.farmId?.name || 'N/A',
            animalId: apt.animalId.tagId,
            date: apt.scheduledDate,
            purpose: `Treatment: ${apt.scheduleName || 'N/A'}`,
            type: 'treatment'
        }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
    
    const todayAppointmentsCount = await VaccinationSchedule.countDocuments({ 
            veterinarianId: vetId, 
            status: 'scheduled',
            scheduledDate: { 
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            } 
    }) + await TreatmentSchedule.countDocuments({ 
            administeredBy: vetId,
            status: 'scheduled',
            scheduledDate: { 
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            } 
    });

    const upcomingAppointmentsCount = vaccinationCases + treatmentCases;
    
    res.json({
        totalAssignedFarms,
        vaccinationCases,
        totalVaccinationRecords,
        todayAppointmentsCount,
        treatmentCases,
        totalTreatmentRecords,
        upcomingAppointments,
        upcomingAppointmentsCount
    });
});

const workerDashboard = asyncHandler(async (req: Request, res: Response) => {
    const workerId = req.user.id;
    const totalAssignedFarms = await Farm.countDocuments( { workers: workerId } );
    const totalReports = await Report.countDocuments( { createdBy: workerId } );
    const assignedTasks = await Task.countDocuments( { assignedTo: workerId} );
    const completedTasks = await Task.countDocuments( { assignedTo: workerId, status: 'Completed' } );
    const pendingTasks = await Task.countDocuments( { assignedTo: workerId, status: 'Pending' } );
    const overdueTasks = await Task.countDocuments( { assignedTo: workerId, status: 'Overdue' } );
    const inprogressTasks = await Task.countDocuments( { assignedTo: workerId, status: 'In Progress' } );
    const ongoingTasksList = await Task.find( { assignedTo: workerId, status: { $ne: 'Completed' } } ).limit(5).sort({ dueDate: 1 });
    res.json({
        totalAssignedFarms,
        totalReports,
        assignedTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        inprogressTasks,
        ongoingTasksList
    });
});

const loanOfficerDashboard = asyncHandler(async (req: Request, res: Response) => {
    const officerId = req.user.id;
    const totalLoanRequests = await LoanRequest.countDocuments({ loanOfficerId: officerId });
    const totalLoanApprovals = await LoanApproval.countDocuments({ approvedBy: officerId });
    
    const pendingApplications = await LoanRequest.countDocuments({ loanOfficerId: officerId, status: 'pending' });
    const approvedLoans = await LoanRequest.countDocuments({ loanOfficerId: officerId, status: 'approved' });
    const disbursedLoans = await LoanApproval.countDocuments({ approvedBy: officerId, status: 'disbursed' });
    const closedLoans = await LoanRequest.countDocuments({ loanOfficerId: officerId, status: 'closed' });
    
    const pendingApplicationsList = await LoanRequest.find({ loanOfficerId: officerId, status: 'pending' })
        .populate('farmerId', 'firstName lastName email')
        .limit(5)
        .sort({ createdAt: -1 });
    
    const approvedThisMonth = await LoanApproval.countDocuments({ 
        approvedBy: officerId,
        createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
    });
    
    const rejectedThisMonth = await LoanRequest.countDocuments({ 
        loanOfficerId: officerId,
        status: 'rejected',
        createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
    });

    const totalLoanValue = await LoanApproval.aggregate([
        { $match: { approvedBy: officerId } },
        { $group: { _id: null, totalAmount: { $sum: "$approvedAmount" } } }
    ]);

    res.json({
        totalLoanRequests,
        totalLoanApprovals,
        pendingApplications,
        approvedLoans,
        disbursedLoans,
        closedLoans,
        pendingApplicationsList,
        approvedThisMonth,
        rejectedThisMonth,
        totalLoanValue: totalLoanValue[0]?.totalAmount || 0
    });
});

const adminDashboard = asyncHandler(async (req: Request, res: Response) => {
    const totalFarms = await Farm.countDocuments();
    const activeFarms = await Farm.countDocuments( { isActive: true });
    const totalAnimals = await Animal.countDocuments();
    const totalVeterinarians = await Veterinarian.countDocuments();
    const totalFarmWorkers = await FarmWorker.countDocuments();
    const totalAuditLogs = await AuditLog.countDocuments();
    const totalUsers = await User.countDocuments();
    const systemDetails = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
    };
    const systemHealth = (systemDetails.memoryUsage.heapUsed / systemDetails.memoryUsage.heapTotal < 0.8) ? 'Good' : 'Poor';
    const userActivity = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
    res.json({
        totalFarms,
        activeFarms,
        totalAnimals,
        totalVeterinarians,
        totalFarmWorkers,
        totalAuditLogs,
        totalUsers,
        systemDetails,
        systemHealth,
        userActivity
    });
});
const getSystemMetrics = asyncHandler(async (req: Request, res: Response) => {
    const performanceMetrics = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        eventLoopDelay: require('perf_hooks').performance.now()
    };
    res.json({ performanceMetrics });
});


export const DashboardController = {
    farmerDashboardForFarm,
    farmerDashboard,
    vetDashboard,
    workerDashboard,
    loanOfficerDashboard,
    adminDashboard,
    getSystemMetrics
};