import {Schema, model, Document} from 'mongoose';

export interface IFeedingRecord extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    feedingScheduleId: Schema.Types.ObjectId;
    fedBy: Schema.Types.ObjectId;
    date: Date;
    quantity: number;
    unit: ('kg' | 'liters');
    cost?: number;
    feedingTime: string;
    notes?: string;
}

const feedingRecordSchema = new Schema<IFeedingRecord>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    fedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedingScheduleId: { type: Schema.Types.ObjectId, ref: 'FeedingSchedule', required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, min: 0 },
    date: { type: Date, required: true },
    unit: { type: String, enum: ['kg', 'liters'], required: true },
    feedingTime: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });

export const FeedingRecord = model<IFeedingRecord>('FeedingRecord', feedingRecordSchema);