import {Schema , model, Document} from 'mongoose';

export interface IHealthRecord extends Document {
    animalId: Schema.Types.ObjectId;
    healthStatus: string;
    recordType?: "vaccination" | "treatment";
    diagnosis?: string;
    date: Date;
    notes?: string;
    treatedBy?: Schema.Types.ObjectId;
    recordedBy?: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
const HealthRecordSchema = new Schema<IHealthRecord>({
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    healthStatus: { type: String, required: true },
    recordType: { type: String, enum: ['vaccination', 'treatment'] },
    diagnosis: { type: String },
    date: { type: Date, required: true },
    notes: { type: String },
    treatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true
});

export const HealthRecord = model<IHealthRecord>('HealthRecord', HealthRecordSchema);