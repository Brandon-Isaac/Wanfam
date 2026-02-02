import {Schema, model, Document} from 'mongoose';

export interface ITreatmentRecord extends Document {
    animalId: Schema.Types.ObjectId;
    healthStatus: string;
    treatmentGiven?: string;
    administeredBy: Schema.Types.ObjectId;
    treatmentDate: Date;
    dosage?: string;
    cost?: number;
    notes?: string;
    status?: string;
}
const TreatmentRecordSchema = new Schema<ITreatmentRecord>({
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    healthStatus: { type: String, required: true },
    treatmentGiven: { type: String },
    dosage: { type: String },
    administeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    treatmentDate: { type: Date, required: true },
    cost: { type: Number, min: 0 },
    notes: { type: String },
    status: { type: String, enum: ['treated', 'pending', 'missed'], default: 'treated' }
}, { timestamps: true
});

export const TreatmentRecord = model<ITreatmentRecord>('TreatmentRecord', TreatmentRecordSchema);