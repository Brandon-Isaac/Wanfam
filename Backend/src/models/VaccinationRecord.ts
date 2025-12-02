import {Schema, model, Document} from 'mongoose';

export interface IVaccinationRecord extends Document {
    scheduleId?: Schema.Types.ObjectId;
    slug?: string;
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    vaccineName: string;
    vaccinationDates: Date[];
    batchNumber?: string;
    nextDueDate?: Date;
    administeredBy?: Schema.Types.ObjectId;
    administrationSite: [{ type: string, enum: ['left front leg', 'right front leg', 'left hind leg', 'right hind leg', 'neck', 'other'] }];
    sideEffects?: string;
    notes?: string;
}

const vaccinationRecordSchema = new Schema<IVaccinationRecord>({
    scheduleId: { type: Schema.Types.ObjectId, ref: 'VaccinationSchedule' },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    vaccineName: { type: String, required: true },
    vaccinationDates: { type: [Date], required: true },
    nextDueDate: { type: Date },
    administeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    administrationSite: [{ type: String, enum: ['left front leg', 'right front leg', 'left hind leg', 'right hind leg', 'neck', 'other'] }],
    sideEffects: { type: String },
    notes: { type: String }
});
vaccinationRecordSchema.pre<IVaccinationRecord>('save', async function(next) {
    if (this.isNew) {
        this.slug = `${this.vaccineName}-${this.animalId}-${Date.now()}`;
    }
    next();
});

export const VaccinationRecord = model<IVaccinationRecord>('VaccinationRecord', vaccinationRecordSchema);