import { FeedingSchedule } from "../models/FeedingSchedule";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Request, Response } from "express";
import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import { AIService } from "../services/AIService";
import { FeedingRecord } from "../models/FeedingRecord";
import { Task } from "../models/Task";

const createFeedScheduleForMultipleAnimals = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    if (!farmId) {
        return res.status(400).json({ message: "Farm ID is required" });
    }
    
    const { animalIds, scheduleName, feedingTimes, feedType, quantity, unit, notes } = req.body;
    
    if (!animalIds || !Array.isArray(animalIds) || animalIds.length === 0) {
        return res.status(400).json({ message: "At least one animal ID is required" });
    }
    
    // Verify farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    
    // Verify all animals exist and belong to the farm
    const animals = await Animal.find({ _id: { $in: animalIds }, farmId });
    if (animals.length === 0) {
        return res.status(404).json({ message: "No animals found for the given IDs" });
    }
    if (animals.length !== animalIds.length) {
        return res.status(404).json({ 
            message: "Some animals not found or do not belong to this farm",
            found: animals.length,
            requested: animalIds.length
        });
    }
    
    const newSchedule = new FeedingSchedule({ farmId, animalIds, scheduleName, feedingTimes, feedType, quantity, unit, notes });
    await newSchedule.save();
    
    // Populate the schedule with animal and farm details
    const populatedSchedule = await FeedingSchedule.findById(newSchedule._id)
        .populate('animalIds', 'name species breed')
        .populate('farmId', 'name');
    
    res.status(201).json({ success: true, data: populatedSchedule });
});

const createFeedSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    if (!farmId || !animalId) {
        return res.status(400).json({ message: "Farm ID and Animal ID are required" });
    }
    
    // Verify farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    
    // Verify animal exists and belongs to the farm
    const animal = await Animal.findOne({ _id: animalId, farmId });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found or does not belong to this farm" });
    }
    
    const { scheduleName, feedingTimes, feedType, quantity, unit, notes } = req.body;
    const newSchedule = new FeedingSchedule({ farmId, animalIds: [animalId], scheduleName, feedingTimes, feedType, quantity, unit, notes });
    await newSchedule.save();
    
    // Populate the schedule with animal and farm details
    const populatedSchedule = await FeedingSchedule.findById(newSchedule._id)
        .populate('animalIds', 'name species breed')
        .populate('farmId', 'name');
    
    res.status(201).json({ success: true, data: populatedSchedule });
});

const getFeedingSchedulesForFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    
    // Get all schedules for this farm
    const schedules = await FeedingSchedule.find({ farmId })
        .populate('animalIds', 'name species breed')
        .populate('farmId', 'name');
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find all schedule IDs that have tasks created today (new workflow)
    const schedulesWithTasks = await Task.find({
        farmId,
        taskCategory: 'Feeding',
        feedingScheduleId: { $ne: null },
        createdAt: { $gte: today, $lt: tomorrow }
    }).distinct('feedingScheduleId');
    
    // Also check for old feeding records (backward compatibility)
    const executedToday = await FeedingRecord.find({
        farmId,
        date: { $gte: today, $lt: tomorrow }
    }).distinct('feedingScheduleId');
    
    // Combine both lists
    const allExecutedSchedules = [...new Set([
        ...schedulesWithTasks.map(id => id.toString()),
        ...executedToday.map(id => id.toString())
    ])];
    
    // Filter out schedules that have been executed today
    const pendingSchedules = schedules.filter(schedule => 
        !allExecutedSchedules.includes(schedule._id.toString())
    );
    
    res.json({ success: true, data: pendingSchedules });
});
const getFeedingSchedulesForAnimal = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const schedules = await FeedingSchedule.find({ animalIds: animalId })
        .populate('animalIds', 'name species breed')
        .populate('farmId', 'name');
    res.json({ success: true, data: schedules });
});

const updateFeedingSchedule = asyncHandler(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId;
    const updateData = req.body;
    const schedule = await FeedingSchedule.findByIdAndUpdate(scheduleId, updateData, { new: true, runValidators: true });
    if (!schedule) {
        return res.status(404).json({ message: "Feeding Schedule not found" });
    }
    res.json({ success: true, data: schedule });
});

const deleteFeedingSchedule = asyncHandler(async (req: Request, res: Response) => {
    const scheduleId = req.params.scheduleId;
    const schedule = await FeedingSchedule.findByIdAndDelete(scheduleId);
    if (!schedule) {
        return res.status(404).json({ message: "Feeding Schedule not found" });
    }
    res.json({ success: true, data: schedule });
});

const generateFeedingScheduleWithAI = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const { animalIds, feedType, customInstructions } = req.body;

    if (!farmId) {
        return res.status(400).json({ message: "Farm ID is required" });
    }

    if (!animalIds || !Array.isArray(animalIds) || animalIds.length === 0) {
        return res.status(400).json({ message: "At least one animal ID is required" });
    }

    // Fetch farm and animal details
    const farm = await Farm.findById(farmId);
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }

    const animals = await Animal.find({ _id: { $in: animalIds }, farmId });
    if (animals.length === 0) {
        return res.status(404).json({ message: "No animals found for the given IDs" });
    }

    // Prepare animal data for AI
    const animalData = animals.map(animal => ({
        id: animal._id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed || 'Unknown',
        age: animal.age,
        weight: animal.weight,
        healthStatus: animal.healthStatus,
        gender: animal.gender
    }));

    // Construct AI prompt - KEEP IT SHORT to avoid truncation
    const prompt = `Generate a feeding schedule JSON for:
Animals: ${animalData.map(a => `${a.name} (${a.species})`).join(', ')}
${feedType ? `Feed: ${feedType}` : ''} ${customInstructions ? `Instructions: ${customInstructions}` : ''}

RETURN ONLY THIS JSON FORMAT (no markdown, no extra text):
{
    "scheduleName": "Farm Feeding Schedule",
    "feedingTimes": ["06:00", "18:00"],
    "feedType": "feed name",
    "quantity": 1.5,
    "unit": "kg",
    "notes": "Keep under 20 words"
}

Be concise. JSON only.`;

    try {
        // Call Gemini AI service
        const aiService = new AIService();
        const aiResponse = await aiService.generateText(prompt);

        // Parse AI response
        let scheduleData;
        try {
            // Remove markdown code blocks if present
            let cleanedResponse = aiResponse.trim();
            cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
            cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
            cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
            
            // Check if response appears truncated
            const hasMissingClosingBrace = !cleanedResponse.includes('}');
            const hasUnterminatedString = cleanedResponse.match(/"notes"\s*:\s*"[^"]*$/);
            
            if (hasMissingClosingBrace || hasUnterminatedString) {
                console.log('Repairing truncated AI response...');
                
                // Close any unterminated string in notes field
                if (hasUnterminatedString) {
                    cleanedResponse = cleanedResponse.replace(/"notes"\s*:\s*"[^"]*$/, '"notes": "See schedule details"');
                }
                
                // Add missing closing brace
                if (!cleanedResponse.includes('}')) {
                    cleanedResponse += '\n}';
                }
            }
            
            // Extract JSON from response (in case AI adds extra text)
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*?\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            
            scheduleData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse);
            return res.status(500).json({ 
                message: "Failed to parse AI-generated schedule. The AI response may be incomplete or invalid.", 
                error: parseError instanceof Error ? parseError.message : 'Unknown error'
            });
        }

        // Validate required fields
        if (!scheduleData.scheduleName || !scheduleData.feedingTimes || !scheduleData.feedType || 
            !scheduleData.quantity || !scheduleData.unit) {
            return res.status(500).json({ 
                message: "AI response missing required fields",
                receivedData: scheduleData 
            });
        }

        // Create the feeding schedule
        const newSchedule = new FeedingSchedule({
            farmId,
            animalIds,
            scheduleName: scheduleData.scheduleName,
            feedingTimes: scheduleData.feedingTimes,
            feedType: scheduleData.feedType,
            quantity: scheduleData.quantity,
            unit: scheduleData.unit,
            notes: scheduleData.notes || ''
        });

        await newSchedule.save();

        // Populate the schedule with animal names
        const populatedSchedule = await FeedingSchedule.findById(newSchedule._id)
            .populate('animalIds', 'name species breed')
            .populate('farmId', 'name');

        res.status(201).json({ 
            success: true, 
            data: populatedSchedule,
            aiGenerated: true,
            animalsIncluded: animals.length
        });

    } catch (error: any) {
        console.error('AI feeding schedule generation error:', error);
        res.status(500).json({ 
            message: "Failed to generate AI-powered feeding schedule",
            error: error.message 
        });
    }
});

export const FeedScheduleController = {
    createFeedSchedule,
    createFeedScheduleForMultipleAnimals,
    getFeedingSchedulesForFarm,
    getFeedingSchedulesForAnimal,
    updateFeedingSchedule,
    deleteFeedingSchedule,
    generateFeedingScheduleWithAI
};