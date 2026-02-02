import {Schema, model, Document} from 'mongoose';

export interface IVaccinationRecord extends Document {
    scheduleId?: Schema.Types.ObjectId;
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    vaccineName: string;
    scheduledDate: Date;
    administeredBy?: Schema.Types.ObjectId;
    veterinarianName?: string;
    cost?: number;
    administrationSite: [{ type: string, enum: ['left front leg', 'right front leg', 'left hind leg', 'right hind leg', 'neck', 'other'] }];
    sideEffects?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const vaccinationRecordSchema = new Schema<IVaccinationRecord>({
    scheduleId: { type: Schema.Types.ObjectId, ref: 'VaccinationSchedule' },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    vaccineName: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    administeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    veterinarianName: { type: String },
    cost: { type: Number, min: 0 },
    administrationSite: [{ type: String, enum: ['left front leg', 'right front leg', 'left hind leg', 'right hind leg', 'neck', 'other'] }],
    sideEffects: { type: String },
    notes: { type: String }
}, { timestamps: true });

export const VaccinationRecord = model<IVaccinationRecord>('VaccinationRecord', vaccinationRecordSchema);