import {Schema, model, Document} from "mongoose";

export interface ITreatmentSchedule extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    administeredBy: Schema.Types.ObjectId;
    scheduleName: string;
    scheduledDate: Date;
    status?: ('scheduled' | 'treated' | 'missed' | string);
    notes?: string;
}

const TreatmentScheduleSchema = new Schema<ITreatmentSchedule>({
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    animalId: { type: Schema.Types.ObjectId, ref: "Animal", required: true },
    administeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduleName: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'treated', 'missed'], default: 'scheduled' },
    notes: { type: String },
}, { timestamps: true });

export const TreatmentSchedule = model<ITreatmentSchedule>("TreatmentSchedule", TreatmentScheduleSchema);