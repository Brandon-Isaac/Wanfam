import {Schema , model, Document} from 'mongoose';

export interface IHealthRecord extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    recordType: ('illness' | 'injury' | 'surgery' | 'other');
    description: string;
    diagnosis?: string;
    treatment?: string;
    medication?: string;
    treatedBy?: Schema.Types.ObjectId;
    treatmentDate?: Date;
    recoveryDate?: Date;
    weight: { amount: number; unit: string };
    outcome?: ('recovered' | 'improved' | 'unchanged' | 'deteriorated' | 'deceased' | string);
    notes?: string;
    slug?: string;
}

const healthRecordSchema = new Schema<IHealthRecord>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    recordType: { type: String, enum: ['illness', 'recovery','completed','injury', 'surgery', 'other'], required: true },
    description: { type: String, required: true },
    diagnosis: { type: String },
    medication: { type: String },
    treatment: { type: String },
    treatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    treatmentDate: { type: Date },
    weight: { amount: Number, unit: String },
    recoveryDate: { type: Date },
    outcome: { type: String, enum: ['recovered', 'improved', 'unchanged', 'deteriorated', 'deceased'] },
    notes: { type: String }
}, { timestamps: true });

healthRecordSchema.pre<IHealthRecord>('save', async function (next) {
    if (!this.slug) {
        this.slug = `health-${this._id}`;
    }
    next();
});

export const HealthRecord = model<IHealthRecord>('HealthRecord', healthRecordSchema);
