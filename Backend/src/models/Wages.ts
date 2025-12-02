import {Schema, Types, model, Document} from 'mongoose';
import { FarmWorker } from './FarmWorker';

export interface IWage extends Document {
    farmId: Schema.Types.ObjectId;
    amount: number;
    employees: ('Veterinarian' | 'FarmWorker')[];
    currency: ('USD' | 'KES' | 'EUR' | 'GBP' | 'TZS' | 'UGX' | 'RWF' | 'ZAR' | string);
    paymentDate: Date;
    paymentMethod: ('cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other');
    notes?: string;
}

const WageSchema = new Schema<IWage>({
    farmId: { type: Types.ObjectId, required: true, ref: 'Farm' },
    employees: { type: [String], enum: ['Veterinarian', 'FarmWorker'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['USD', 'KES', 'EUR', 'GBP', 'TZS', 'UGX', 'RWF', 'ZAR'], required: true, default: 'KES' },
    paymentDate: { type: Date, required: true },
    paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'other'], required: true },
    notes: { type: String }
});

export const Wage = model<IWage>('Wage', WageSchema);