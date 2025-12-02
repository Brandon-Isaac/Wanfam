import {Schema, model, Document} from "mongoose";

export interface ITimeOffRequest extends Document {
    workerId: Schema.Types.ObjectId;
    type: 'vacation' | 'sick' | 'personal' | 'training' | 'emergency' | 'other';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    requestDate: Date;
    responseDate?: Date;
}

const TimeOffRequestSchema = new Schema<ITimeOffRequest>({
    workerId: { type: Schema.Types.ObjectId, ref: "FarmWorker", required: true },
    type: { type: String, enum: ['vacation', 'sick', 'personal', 'training', 'emergency', 'other'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    requestDate: { type: Date, default: Date.now },
    responseDate: { type: Date },
});

export const TimeOffRequest = model<ITimeOffRequest>("TimeOffRequest", TimeOffRequestSchema);