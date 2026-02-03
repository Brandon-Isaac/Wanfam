import {Schema, model, Document} from 'mongoose';

export interface IFeedingSchedule extends Document {
    farmId: Schema.Types.ObjectId;
    animalIds: Schema.Types.ObjectId[];
    scheduleName: string;
    feedingTimes: string[];
    feedType: string;
    quantity: number;
    unit: ('kg' | 'liters' );
    notes?: string;
}

const feedingScheduleSchema = new Schema<IFeedingSchedule>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalIds: [{ type: Schema.Types.ObjectId, ref: 'Animal', required: true }],
    scheduleName: { type: String, required: true },
    feedingTimes: [{ type: String, required: true }],
    feedType: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'liters'], required: true },
    notes: { type: String },
}, { timestamps: true });

export const FeedingSchedule = model<IFeedingSchedule>('FeedingSchedule', feedingScheduleSchema);