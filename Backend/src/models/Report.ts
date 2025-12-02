import {Schema, Document, model} from 'mongoose';

export interface IReport extends Document {
    farmId: Schema.Types.ObjectId;
    slug: string;
    reportType:('medical' | 'productivity' | 'financial' | 'diseaseOutbreak' | 'other');
    reportDuration: ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one-time');
    generatedAt: Date;
    generatedBy: Schema.Types.ObjectId;
    contentSummary: string;
    fileUrl?: string;
    notes?: string;
}
const reportSchema = new Schema<IReport>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    reportType: { type: String, enum: ['medical', 'productivity', 'financial', 'diseaseOutbreak', 'other'], required: true },
    reportDuration: { type: String,enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'one-time'], default: 'one-time' },
    generatedAt: { type: Date, required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contentSummary: { type: String, required: true },
    fileUrl: { type: String },
    notes: { type: String }
}, { timestamps: true });

reportSchema.pre<IReport>('save', async function(next) {
    if (this.isNew) {
        this.slug = `${this.reportType}-${this.farmId}-${Date.now()}`;
    }
    next();
});

export const Report = model<IReport>('Report', reportSchema);