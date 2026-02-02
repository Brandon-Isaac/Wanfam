import { FeedingSchedule } from "../models/FeedingSchedule";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Request, Response } from "express";
import { Farm } from "../models/Farm";
import { Animal } from "../models/Animal";
import { AIService } from "../services/AIService";

const createFeedConsumptionScheduleForMultipleAnimals = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    if (!farmId) {
        return res.status(400).json({ message: "Farm ID is required" });
    }
    const { animalIds, scheduleName, feedingTimes, feedType, quantity, unit, notes } = req.body;
    const newSchedule = new FeedingSchedule({ farmId, animalIds, scheduleName, feedingTimes, feedType, quantity, unit, notes });
    await newSchedule.save();
    res.status(201).json({ success: true, data: newSchedule });
});

const createFeedConsumptionSchedule = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const animalId = req.params.animalId;
    if (!farmId || !animalId) {
        return res.status(400).json({ message: "Farm ID and Animal ID are required" });
    }
    const { scheduleName, feedingTimes, feedType, quantity, unit, notes } = req.body;
    const newSchedule = new FeedingSchedule({ farmId, animalIds: [animalId], scheduleName, feedingTimes, feedType, quantity, unit, notes });
    await newSchedule.save();
    res.status(201).json({ success: true, data: newSchedule });
});

const getFeedingSchedulesForFarm = asyncHandler(async (req: Request, res: Response) => {
    const farmId = req.params.farmId;
    const schedules = await FeedingSchedule.find({ farmId });
    res.json({ success: true, data: schedules });
});
const getFeedingSchedulesForAnimal = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalId;
    const schedules = await FeedingSchedule.find({ animalIds: animalId });
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

    // Construct AI prompt
    const prompt = `You are an expert livestock nutritionist. Generate a detailed feeding schedule for the following animals:

Farm: ${farm.name}
Animals:
${animalData.map((a, i) => `${i + 1}. ${a.name} (${a.species}, ${a.breed}, ${a.age || 'age unknown'} years old, ${a.weight || 'weight unknown'} kg, ${a.gender}, health: ${a.healthStatus})`).join('\n')}

${feedType ? `Preferred feed type: ${feedType}` : ''}
${customInstructions ? `Additional instructions: ${customInstructions}` : ''}

Provide a concise feeding schedule with:
1. Schedule name
2. Feeding times in 24-hour format (e.g., ["06:00", "18:00"])
3. Feed type
4. Quantity per feeding
5. Unit (kg or liters)
6. Brief notes (MAX 50 words)

Return ONLY this JSON (no markdown, no extra text):
{
    "scheduleName": "string",
    "feedingTimes": ["time1", "time2"],
    "feedType": "string",
    "quantity": number,
    "unit": "kg",
    "notes": "brief recommendations in 50 words or less"
}`;

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
            
            // Check if response appears truncated (missing closing brace)
            if (!cleanedResponse.includes('}')) {
                console.log('Attempting to repair truncated response...');
                // Try to repair by closing the string and adding closing brace
                cleanedResponse = cleanedResponse.replace(/"notes"\s*:\s*"[^"]*$/, '"notes": "Feed details available upon request"');
                cleanedResponse += '"}';
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
                error: parseError instanceof Error ? parseError.message : 'Unknown error',
                rawResponse: aiResponse.substring(0, 500)
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

        res.status(201).json({ 
            success: true, 
            data: newSchedule,
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
    createFeedConsumptionSchedule,
    createFeedConsumptionScheduleForMultipleAnimals,
    getFeedingSchedulesForFarm,
    getFeedingSchedulesForAnimal,
    updateFeedingSchedule,
    deleteFeedingSchedule,
    generateFeedingScheduleWithAI
};