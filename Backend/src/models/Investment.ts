import {Schema, model, Document} from 'mongoose';
import { UserRole } from './UserRole';

export interface IInvestment extends Document {
    farmId: Schema.Types.ObjectId;
    slug?: string;
    name: string;
    category: ('infrastructure' | 'livestock' | 'equipment' | 'feed' | 'healthcare' | 'technology' | 'breeding' | 'other');
    initialAmount: number;
    currency: ('USD' | 'KES' | 'EUR' | 'GBP' | 'TZS' | 'UGX' | 'RWF' | 'ZAR' | string);
    date_invested: Date;
    expectedReturnRate?: number; //e.g 0.5
    riskLevel?: 'low' | 'medium' | 'high';
    status?: 'active' | 'completed' | 'underperforming' | 'failed';
    description?: string;
    notes?: string;
}

const investmentSchema = new Schema<IInvestment>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    name: { type: String, required: true },
    initialAmount: { type: Number, required: true },
    category: { type: String, enum: ['infrastructure', 'livestock', 'equipment', 'feed', 'healthcare', 'technology', 'breeding', 'other'], required: true },
    date_invested: { type: Date, required: true },
    expectedReturnRate: { type: Number, min: 0},
    currency: { type: String, required: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    status: { type: String, enum: ['active', 'completed', 'underperforming', 'failed'], default: 'active' },
    description: { type: String },
    notes: { type: String }
}, { timestamps: true });

investmentSchema.pre<IInvestment>('save', async function(next) {
    if (this.isNew) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-');
    }
    next();
});

export const Investment = model<IInvestment>('Investment', investmentSchema);
