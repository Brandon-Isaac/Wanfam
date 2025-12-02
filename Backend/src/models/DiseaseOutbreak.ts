import { Schema,Document,model } from "mongoose";

export interface IDiseaseOutbreak extends Document {
    farmId: Schema.Types.ObjectId;
    diseaseName: string;
    affectedAnimals: [{ type: Schema.Types.ObjectId, ref: 'Animal' }];
    outbreakDate: Date;
    sourceSuspected?: string;
    severity?: ('low' | 'medium' | 'high' | string);
    containmentMeasures: string;
    notes?: string;
}

const diseaseOutbreakSchema = new Schema<IDiseaseOutbreak>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    diseaseName: { type: String, required: true },
    affectedAnimals: [{ type: Schema.Types.ObjectId, ref: 'Animal', required: true }],
    outbreakDate: { type: Date, required: true },
    sourceSuspected: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    containmentMeasures: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });

export const DiseaseOutbreak = model<IDiseaseOutbreak>('DiseaseOutbreak', diseaseOutbreakSchema);
