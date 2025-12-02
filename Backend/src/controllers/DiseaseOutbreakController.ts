import { DiseaseOutbreak } from "../models/DiseaseOutbreak";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import { AIService } from "../services/AIService";
import { Farm } from "../models/Farm";
import { User } from "../models/User";

// Create a new disease outbreak record
const createDiseaseOutbreak = asyncHandler(async (req: Request, res: Response) => {
    const { farmId, reportedBy, diseaseName, affectedAnimals, symptoms, outbreakDate, containmentMeasures, notes } = req.body;
    if (!farmId || !reportedBy || !diseaseName || !affectedAnimals || !symptoms || !outbreakDate) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const diseaseOutbreak = new DiseaseOutbreak({
        farmId,
        reportedBy,
        diseaseName,
        affectedAnimals,
        symptoms,
        outbreakDate,
        containmentMeasures,
        notes
    });

    await diseaseOutbreak.save();

    return res.status(201).json(diseaseOutbreak);
});

const generatDiseaseOutbreakPreventiveMeasures = asyncHandler(async (req: Request, res: Response) => {
    const { diseaseName, animalSpecies } = req.body;
    if (!diseaseName || !animalSpecies) {
        return res.status(400).json({ message: "Disease name and animal species are required" });
    }

    const preventiveMeasures = await AIService.generatePreventiveMeasures({
        diseaseName,
        animalSpecies
    });

    return res.status(200).json(preventiveMeasures);
});

const generateDiseaseOutbreakReport = asyncHandler(async (req: Request, res: Response) => {
    const { diseaseOutbreakId } = req.params;
    const diseaseOutbreak = await DiseaseOutbreak.findById(diseaseOutbreakId);

    if (!diseaseOutbreak) {
        return res.status(404).json({ message: "Disease outbreak not found" });
    }

    const report = await AIService.generateReport(diseaseOutbreak);
    return res.status(200).json(report);
});

const getDiseaseOutbreaksByFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const diseaseOutbreaks = await DiseaseOutbreak.find({ farmId: farm._id });
    return res.status(200).json(diseaseOutbreaks);
});

const generateDiseaseOutbreakReportForFarm = asyncHandler(async (req: Request, res: Response) => {
    const { farmId, diseaseName, affectedAnimals, symptoms, outbreakDate, containmentMeasures, notes } = req.body;
    if (!farmId || !diseaseName || !affectedAnimals || !symptoms || !outbreakDate) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const reportData = {
        farmId,
        diseaseName,
        affectedAnimals,
        symptoms,
        outbreakDate,
        containmentMeasures,
        notes
    };
    const report = await AIService.generateReport(reportData);
    return res.status(200).json(report);
});

const updateDiseaseOutbreak = asyncHandler(async (req: Request, res: Response) => {
    const outbreakId = req.params.id;
    const { diseaseName, affectedAnimals, symptoms, outbreakDate, containmentMeasures, notes } = req.body;

    const diseaseOutbreak = await DiseaseOutbreak.findById(outbreakId);
    if (!diseaseOutbreak) {
        return res.status(404).json({ message: "Disease outbreak not found" });
    }

    diseaseOutbreak.diseaseName = diseaseName;
    diseaseOutbreak.affectedAnimals = affectedAnimals;
    diseaseOutbreak.outbreakDate = outbreakDate;
    diseaseOutbreak.containmentMeasures = containmentMeasures;
    diseaseOutbreak.notes = notes;

    await diseaseOutbreak.save();
    return res.status(200).json(diseaseOutbreak);
});

const deleteDiseaseOutbreak = asyncHandler(async (req: Request, res: Response) => {
    const outbreakId = req.params.id;
    const diseaseOutbreak = await DiseaseOutbreak.findById(outbreakId);
    if (!diseaseOutbreak) {
        return res.status(404).json({ message: "Disease outbreak not found" });
    }

    await diseaseOutbreak.deleteOne();
    return res.status(204).send();
});

export const DiseaseOutbreakController = {
    createDiseaseOutbreak,
    generatDiseaseOutbreakPreventiveMeasures,
    generateDiseaseOutbreakReport,
    getDiseaseOutbreaksByFarm,
    updateDiseaseOutbreak,
    generateDiseaseOutbreakReportForFarm,
    deleteDiseaseOutbreak
};