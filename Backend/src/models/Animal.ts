import {Schema, model, Document} from 'mongoose';
import Counter from './Counter';

export interface IAnimal extends Document {
    farmId: Schema.Types.ObjectId;
    tagId: string;
    name: string;
    age?: number;
    species: ('cattle' | 'sheep' | 'goat' | 'pig' | 'poultry' | 'other');
    breed?: string;
    dateOfBirth?: Date;
    dateOfPurchase?: Date;
    purchasePrice?: number;
    weight?: number;
    healthStatus?: ('healthy' | 'sick' | 'treatment' | 'recovery' | 'quarantined' | 'deceased' | string);
    notes?: string;
    gender?: ('male' | 'female');
    assignedWorker?: Schema.Types.ObjectId;
    addedAt: Date;
    updatedAt: Date;
}
const animalSchema = new Schema<IAnimal>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    name: { type: String, required: true },
    age: { type: Number },
    species: { type: String, enum: ['cattle', 'sheep', 'goat', 'pig', 'poultry', 'other'], required: true },
    breed: { type: String },
    dateOfBirth: { type: Date },
    dateOfPurchase: { type: Date },
    purchasePrice: { type: Number },
    weight: { type: Number },
    healthStatus: { type: String, enum: ['healthy', 'sick','treatment', 'recovery', 'quarantined', 'deceased'], default: 'healthy' },
    notes: { type: String },
    gender: { type: String, enum: ['male', 'female'], required: true },
    assignedWorker: { type: Schema.Types.ObjectId, ref: 'User' },
    tagId: { type: String, unique: true },
    addedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

animalSchema.pre<IAnimal>('save', async function (next) {
    if (!this.tagId) {
        // Get the counter value first
        const counter = await Counter.findOneAndUpdate(
            { name: 'animalTagId' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );
        
        // Now construct the tagId with the resolved value
        const speciesCode = this.species.toString().slice(0, 6).toUpperCase();
        const counterValue = counter.value.toString().padStart(6, '0');
        this.tagId = `${speciesCode}-${counterValue}`;
    }
    next();
});

export const Animal = model<IAnimal>('Animal', animalSchema);