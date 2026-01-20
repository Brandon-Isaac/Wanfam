import {Schema,model,Document} from 'mongoose';

export interface IVaccinationSchedule extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: [{ type: Schema.Types.ObjectId, ref: 'Animal' }];
    veterinarianId: Schema.Types.ObjectId;
    slug?: string;
    scheduleName: string;
    vaccineName: string;
    dose: string;
    unit: ('ml' | 'cc' | 'units' | string);
    frequency: ('once' | 'annual' | 'biAnnual' | 'quarterly' | 'monthly' | string);
    startDate: Date;
    endDate?: Date;
    vaccinationTime: Date;
    notes?: string;
    reminders?: boolean;
    status?: ('scheduled' | 'completed' | 'missed' | string);
}

const vaccinationScheduleSchema = new Schema<IVaccinationSchedule>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: [{ type: Schema.Types.ObjectId, ref: 'Animal', required: true }],
    veterinarianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleName: { type: String, required: true },
    vaccineName: { type: String, required: true },
    dose: { type: String, required: true },
    unit: { type: String, enum: ['ml', 'cc', 'units'], required: true },
    frequency: { type: String, enum: ['once', 'annual', 'biAnnual', 'quarterly', 'monthly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    vaccinationTime: { type: Date, required: true },
    notes: { type: String },
    reminders: { type: Boolean, default: false },
    status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' }
}, { timestamps: true });

vaccinationScheduleSchema.pre<IVaccinationSchedule>('save', async function(next) {
    if (this.isNew) {
        this.slug = this.scheduleName.toLowerCase().replace(/ /g, '-');
    }
    next();
});

export const VaccinationSchedule = model<IVaccinationSchedule>('VaccinationSchedule', vaccinationScheduleSchema);