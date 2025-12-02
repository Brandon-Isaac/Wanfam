import { Animal } from "../models/Animal";
import { Farm } from "../models/Farm";
import { Request, Response } from "express";
import { asyncHandler } from "../middleware/AsyncHandler";
import {AIService} from "../services/AIService";

const getBreedsBySpecies = asyncHandler(async (req: Request, res: Response) => {
    const species = req.params.species.toLowerCase();
    const validSpecies = ['cattle', 'sheep', 'goat', 'pig', 'poultry', 'other'];
    if (!validSpecies.includes(species)) {
        return res.status(400).json({ message: "Invalid species. Must be one of 'cattle', 'sheep', 'goat', 'pig', 'poultry', or 'other'." });
    }
    const breedsMap: Record<string, string[]> = {
        cattle: ['Angus', 'Hereford', 'Holstein', 'Jersey', 'Charolais', 'Simmental', 'Limousin', 'Brahman'],
        sheep: ['Merino', 'Suffolk', 'Dorper', 'Hampshire', 'Dorset', 'Texel'],
        goat: ['Nubian', 'Saanen', 'Boer', 'Alpine', 'Toggenburg'],
        pig: ['Yorkshire', 'Berkshire', 'Duroc', 'Landrace', 'Hampshire'],
        poultry: ['Leghorn', 'Rhode Island Red', 'Plymouth Rock', 'Silkie', 'Cochin'],
        other: ['Mixed Breed']
    };
    const breeds = breedsMap[species];
    res.json({ success: true, data: breeds });
});

const updateAnimalBreed = asyncHandler(async (req: Request, res: Response) => {
    const farmSlug = req.params.farmSlug;
    const farm = await Farm.findOne({ slug: farmSlug });
    if (!farm) {
        return res.status(404).json({ message: "Farm not found" });
    }
    const animalSlug = req.params.animalSlug;
    const { breed } = req.body;
    const animal = await Animal.findOne({ slug: animalSlug });
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    animal.breed = breed;
    await animal.save();
    res.json({ success: true, data: animal, tagId: animal.tagId });
});

const generateOtherAnimalBreeds = asyncHandler(async (req: Request, res: Response) => {
    const animalId = req.params.animalSlug;
    const animal = await Animal.findById(animalId);
    if (!animal) {
        return res.status(404).json({ message: "Animal not found" });
    }
    if (animal.species === 'other') {
        return res.status(400).json({ message: "Cannot generate breeds for species 'other'" });
    }
    const Breeds= await AIService.generateBreeds(animal.species);
    res.json({ success: true, data: Breeds });
});

export { getBreedsBySpecies, updateAnimalBreed, generateOtherAnimalBreeds };