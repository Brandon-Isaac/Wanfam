import {Schema,model,Document} from 'mongoose';

export interface IVaccinationSchedule extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal' };
    veterinarianId?: Schema.Types.ObjectId;
    veterinarianName?: string;
    scheduleName: string;
    vaccinationTime: Date;
    notes?: string;
    reminders?: boolean;
    status?: ('scheduled' | 'completed' | 'missed' | string);
}

const vaccinationScheduleSchema = new Schema<IVaccinationSchedule>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    veterinarianId: { type: Schema.Types.ObjectId, ref: 'User' },
    veterinarianName: { type: String },
    scheduleName: { type: String, required: true },
    vaccinationTime: { type: Date, required: true },
    notes: { type: String },
    reminders: { type: Boolean, default: false },
    status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' }
}, { timestamps: true });

export const VaccinationSchedule = model<IVaccinationSchedule>('VaccinationSchedule', vaccinationScheduleSchema);