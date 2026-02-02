import {Schema,model,Document} from 'mongoose';

export interface IVaccinationSchedule extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: [{ type: Schema.Types.ObjectId, ref: 'Animal' }];
    veterinarianId: Schema.Types.ObjectId;
    vaccineName: string;
    scheduledDate: Date;
    notes?: string;
    reminders?: boolean;
    status?: ('scheduled' | 'completed' | 'missed' | string);
}

const vaccinationScheduleSchema = new Schema<IVaccinationSchedule>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: [{ type: Schema.Types.ObjectId, ref: 'Animal', required: true }],
    veterinarianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vaccineName: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    notes: { type: String },
    reminders: { type: Boolean, default: false },
    status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' }
}, { timestamps: true });

export const VaccinationSchedule = model<IVaccinationSchedule>('VaccinationSchedule', vaccinationScheduleSchema);