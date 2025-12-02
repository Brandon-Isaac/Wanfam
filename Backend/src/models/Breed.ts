import {Schema,  Document, model } from 'mongoose';

export interface IBreed extends Document {
    names: string[];
    species: 'cattle' | 'sheep' | 'goat' | 'pig' | 'poultry' | 'other';
    description?: string;
}
const breedSchema = new Schema<IBreed>({
    names: { type: [String], required: true, unique: true },
    species: { type: String, enum: ['cattle', 'sheep', 'goat', 'pig', 'poultry', 'other'], required: true },
    description: { type: String }
});
export const Breed = model<IBreed>('Breed', breedSchema);