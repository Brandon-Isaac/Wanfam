import {Schema, model, Document} from 'mongoose';

export interface IProductivityRecord extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    date: Date;
    milkYield?: {
        amount: number;
        unit: 'liters' | 'gallons';
        timeOfDay: 'morning' | 'afternoon' | 'evening';
    }
    totalMilk?: {
        amount: number;
        unit: 'liters' | 'gallons';
    };
    feedConsumption?: {
        amount: number;
        unit: 'kg' | 'lbs';
    };
    healthStatus?: ('healthy' | 'sick' | 'quarantined' | 'deceased');
    notes?: string;
}
const productivityRecordSchema = new Schema<IProductivityRecord>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    date: { type: Date, required: true },
    milkYield: {
        amount: { type: Number },
        unit: { type: String, enum: ['liters', 'gallons'], default: 'liters' },
        timeOfDay: { type: String, enum: ['morning', 'afternoon', 'evening'] ,default: 'morning' }
    },
    totalMilk: {
        amount: { type: Number },
        unit: { type: String, enum: ['liters', 'gallons'], default: 'liters' }
    },
    feedConsumption: {
        amount: { type: Number },
        unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    healthStatus: { type: String, enum: ['healthy', 'sick', 'quarantined', 'deceased'], default: 'healthy' },
    notes: { type: String }
});

export const ProductivityRecord = model<IProductivityRecord>('ProductivityRecord', productivityRecordSchema);