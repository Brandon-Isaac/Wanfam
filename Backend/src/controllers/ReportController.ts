import { Report } from '../models/Report';
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/AsyncHandler';
import {AIService} from "../services/AIService";
import { Farm } from '../models/Farm';
import { Animal } from '../models/Animal';
import { HealthRecord } from '../models/HealthRecord';
import { TreatmentRecord } from '../models/TreatmentRecord';
import { VaccinationRecord } from '../models/VaccinationRecord';

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
    
    // Populate the saved report before returning
    await report.populate([
        { path: 'farmId', select: 'name location' },
        { path: 'generatedBy', select: 'firstName lastName email' }
    ]);

    return res.status(201).json({
        success: true,
        report
    });
});

// Get reports for a specific farm with optional filters
const getReportsByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const farm = await Farm.findById(farmId);
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

    const reports = await Report.find(filter)
        .populate('farmId', 'name location')
        .populate('generatedBy', 'firstName lastName email')
        .sort({ generatedAt: -1 })
        .lean();
    
    return res.status(200).json({
        success: true,
        count: reports.length,
        reports
    });
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
    
    // Populate the updated report before returning
    await report.populate([
        { path: 'farmId', select: 'name location' },
        { path: 'generatedBy', select: 'firstName lastName email' }
    ]);

    return res.status(200).json({
        success: true,
        report
    });
});

// Generate comprehensive animal report for a farm
const generateAnimalReport = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    
    // Validate farmId format
    if (!farmId || !farmId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid farm ID format' 
        });
    }
    
    // Verify farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ 
            success: false,
            message: 'Farm not found' 
        });
    }

    // Fetch all animals for the farm with error handling
    const animals = await Animal.find({ farmId })
        .populate({
            path: 'assignedWorker',
            select: 'firstName lastName email phone',
            options: { strictPopulate: false }
        })
        .lean()
        .catch(err => {
            console.error('Error fetching animals:', err);
            throw new Error('Failed to fetch animals data');
        });

    if (!animals || animals.length === 0) {
        return res.status(404).json({ 
            success: false,
            message: 'No animals found for this farm',
            summary: {
                farmName: farm.name,
                totalAnimals: 0
            }
        });
    }

    // Fetch related records for all animals with error handling
    const animalIds = animals.map(animal => animal._id);
    
    const [healthRecords, treatmentRecords, vaccinationRecords] = await Promise.all([
        HealthRecord.find({ animalId: { $in: animalIds } })
            .populate({
                path: 'treatedBy',
                select: 'firstName lastName',
                options: { strictPopulate: false }
            })
            .lean()
            .catch(err => {
                console.error('Error fetching health records:', err);
                return []; // Return empty array on error
            }),
        TreatmentRecord.find({ animalId: { $in: animalIds } })
            .populate({
                path: 'administeredBy',
                select: 'firstName lastName',
                options: { strictPopulate: false }
            })
            .lean()
            .catch(err => {
                console.error('Error fetching treatment records:', err);
                return []; // Return empty array on error
            }),
        VaccinationRecord.find({ animalId: { $in: animalIds } })
            .populate({
                path: 'administeredBy',
                select: 'firstName lastName',
                options: { strictPopulate: false }
            })
            .lean()
            .catch(err => {
                console.error('Error fetching vaccination records:', err);
                return []; // Return empty array on error
            })
    ]);

    // Build comprehensive report for each animal with safe data access
    const animalReports = animals.map(animal => {
        try {
            const animalHealth = healthRecords.filter(hr => 
                hr.animalId && hr.animalId.toString() === animal._id.toString()
            );
            const animalTreatments = treatmentRecords.filter(tr => 
                tr.animalId && tr.animalId.toString() === animal._id.toString()
            );
            const animalVaccinations = vaccinationRecords.filter(vr => 
                vr.animalId && vr.animalId.toString() === animal._id.toString()
            );

            return {
                // Basic Information
                tagId: animal.tagId || 'N/A',
                name: animal.name || 'Unnamed',
                species: animal.species || 'Unknown',
                breed: animal.breed || 'Not specified',
                gender: animal.gender || 'Unknown',
                age: animal.age || null,
                
                // Birth & Purchase Information
                dateOfBirth: animal.dateOfBirth || null,
                dateOfPurchase: animal.dateOfPurchase || null,
                purchasePrice: animal.purchasePrice || null,
                
                // Current Status
                currentWeight: animal.weight || null,
                healthStatus: animal.healthStatus || 'Unknown',
                notes: animal.notes || '',
                
                // Assigned Worker
                assignedWorker: animal.assignedWorker && typeof animal.assignedWorker === 'object' ? {
                    name: `${(animal.assignedWorker as any).firstName || ''} ${(animal.assignedWorker as any).lastName || ''}`.trim() || 'Unknown',
                    email: (animal.assignedWorker as any).email || 'N/A',
                    phone: (animal.assignedWorker as any).phone || 'N/A'
                } : null,
                
                // Health Records Summary
                healthRecords: {
                    total: animalHealth.length,
                    records: animalHealth.map(hr => ({
                        recordType: hr.recordType || 'other',
                        description: hr.description || 'No description',
                        diagnosis: hr.diagnosis || 'N/A',
                        treatment: hr.treatment || 'N/A',
                        medication: hr.medication || 'N/A',
                        treatmentDate: hr.treatmentDate || null,
                        recoveryDate: hr.recoveryDate || null,
                        outcome: hr.outcome || 'N/A',
                        treatedBy: hr.treatedBy && typeof hr.treatedBy === 'object' ? 
                            `${(hr.treatedBy as any).firstName || ''} ${(hr.treatedBy as any).lastName || ''}`.trim() || 'Unknown' : 'N/A',
                        notes: hr.notes || ''
                    }))
                },
                
                // Treatment Records Summary
                treatmentRecords: {
                    total: animalTreatments.length,
                    records: animalTreatments.map(tr => ({
                        healthStatus: tr.healthStatus || 'Unknown',
                        treatmentGiven: tr.treatmentGiven || 'N/A',
                        dosage: tr.dosage || 'N/A',
                        treatmentDate: tr.treatmentDate || null,
                        administeredBy: tr.administeredBy && typeof tr.administeredBy === 'object' ? 
                            `${(tr.administeredBy as any).firstName || ''} ${(tr.administeredBy as any).lastName || ''}`.trim() || 'Unknown' : 'N/A',
                        status: tr.status || 'N/A',
                        notes: tr.notes || ''
                    }))
                },
                
                // Vaccination Records Summary
                vaccinationRecords: {
                    total: animalVaccinations.length,
                    records: animalVaccinations.map(vr => ({
                        vaccineName: vr.vaccineName || 'Unknown',
                        vaccinationDates: vr.vaccinationDates || [],
                        nextDueDate: vr.nextDueDate || null,
                        administeredBy: vr.administeredBy && typeof vr.administeredBy === 'object' ? 
                            `${(vr.administeredBy as any).firstName || ''} ${(vr.administeredBy as any).lastName || ''}`.trim() || 'Unknown' : 'N/A',
                        administrationSite: vr.administrationSite || [],
                        sideEffects: vr.sideEffects || 'None reported',
                        notes: vr.notes || ''
                    }))
                },
                
                // Timeline Information
                addedAt: animal.addedAt || null,
                updatedAt: animal.updatedAt || null
            };
        } catch (error) {
            console.error(`Error processing animal ${animal._id}:`, error);
            // Return minimal data for this animal if processing fails
            return {
                tagId: animal.tagId || 'N/A',
                name: animal.name || 'Unnamed',
                error: 'Failed to process complete animal data',
                healthRecords: { total: 0, records: [] },
                treatmentRecords: { total: 0, records: [] },
                vaccinationRecords: { total: 0, records: [] }
            };
        }
    });

    // Create summary statistics with safe calculations
    const summary = {
        farmName: farm.name || 'Unknown Farm',
        totalAnimals: animals.length,
        healthyAnimals: animals.filter(a => a.healthStatus === 'healthy').length,
        sickAnimals: animals.filter(a => a.healthStatus === 'sick').length,
        underTreatment: animals.filter(a => a.healthStatus === 'treatment').length,
        quarantined: animals.filter(a => a.healthStatus === 'quarantined').length,
        deceased: animals.filter(a => a.healthStatus === 'deceased').length,
        totalHealthRecords: healthRecords.length,
        totalTreatments: treatmentRecords.length,
        totalVaccinations: vaccinationRecords.length,
        reportGeneratedAt: new Date(),
        reportGeneratedBy: req.user?.id || 'System'
    };

    // Save report to database with error handling
    try {
        const report = new Report({
            farmId,
            reportType: 'comprehensive_animal_report',
            reportDuration: 'all_time',
            generatedAt: new Date(),
            generatedBy: req.user?.id || 'System',
            contentSummary: summary,
            notes: `Comprehensive animal report including ${animals.length} animals with complete health, treatment, and vaccination history`
        });

        await report.save();

        return res.status(200).json({
            success: true,
            summary,
            animals: animalReports,
            reportId: report._id,
            warnings: animalReports.filter(a => a.error).length > 0 ? 
                `${animalReports.filter(a => a.error).length} animal(s) had processing errors` : null
        });
    } catch (saveError: any) {
        console.error('Error saving report:', saveError);
        // Return the data even if saving fails
        return res.status(200).json({
            success: true,
            summary,
            animals: animalReports,
            warning: 'Report data generated successfully but failed to save to database',
            error: saveError.message
        });
    }
});

export const ReportController = {
    createReport,
    getReportsByFarm,
    updateReport,
    generateAnimalReport
};