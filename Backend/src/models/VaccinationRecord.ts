import {Schema, model, Document} from 'mongoose';

export interface IVaccinationRecord extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    vaccineName: string;
    vaccinationDate: Date;
    administeredBy?: Schema.Types.ObjectId;
    administrationSite: [{ type: string, enum: ['left front leg', 'right front leg', 'left hind leg', 'right hind leg', 'neck', 'other'] }];
    sideEffects?: string;
    notes?: string;
}

const vaccinationRecordSchema = new Schema<IVaccinationRecord>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    vaccineName: { type: String, required: true },
    vaccinationDate: { type: Date, required: true },
    administeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    administrationSite: [{ type: String, enum: ['left front leg', 'right front leg', 'left hind leg', 'right hind leg', 'neck', 'other'] }],
    sideEffects: { type: String },
    notes: { type: String }
});

export const VaccinationRecord = model<IVaccinationRecord>('VaccinationRecord', vaccinationRecordSchema);