import {Schema,Document,model} from 'mongoose';

export interface IVeterinarian extends Document {
    farmId:[{ type: Schema.Types.ObjectId, ref: 'Farm' }];
    services:{
        generalCheckup: boolean;
        emergencyCare: boolean;
        surgery: boolean;
        vaccination: boolean;
        healthMonitoring: boolean;
        nutritionAdvisory: boolean;
        otherServices?: string;
    };
    specialization?: string;
    salary:{
        amount: number;
        currency: string;
        paymentInterval: 'monthly' | 'bi-monthly' | 'weekly' | 'daily';
        status: 'paid' | 'unpaid';
    }
    availability?: boolean;
    notes?: string;
}

const veterinarianSchema = new Schema<IVeterinarian>({
    farmId: [{ type: Schema.Types.ObjectId, ref: 'Farm', required: true }],
    services: {
        generalCheckup: { type: Boolean, default: false },
        emergencyCare: { type: Boolean, default: false },
        surgery: { type: Boolean, default: false },
        vaccination: { type: Boolean, default: false },
        healthMonitoring: { type: Boolean, default: false },
        nutritionAdvisory: { type: Boolean, default: false },
        otherServices: { type: String }
    },
    salary: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        paymentInterval: { type: String, enum: ['monthly', 'bi-monthly', 'weekly', 'daily'], required: true },
        status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }
    },
    availability: { type: Boolean, default: true },
    notes: { type: String }
});

export const Veterinarian = model<IVeterinarian>('Veterinarian', veterinarianSchema);