import {Schema, model, Document} from 'mongoose';

export interface IFeedingRecord extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: Schema.Types.ObjectId;
    feedingScheduleId: Schema.Types.ObjectId;
    fedBy: Schema.Types.ObjectId;
    quantity: number;
    unit: ('kg' | 'liters' | 'units' | string);
    feedingTime: Date;
    feedCondition: ('normal' | 'refused' | 'partial' | string);
    animalResponse: ('eager' | 'reluctant' | 'neutral' | string);
    weather: ('normal' | 'hot' | 'cold' | 'rainy' | 'windy' | string);
    notes?: string;
    slug?: string;
}

const feedingRecordSchema = new Schema<IFeedingRecord>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
    fedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedingScheduleId: { type: Schema.Types.ObjectId, ref: 'FeedingSchedule', required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'liters', 'units'], required: true },
    feedingTime: { type: Date, required: true },
    feedCondition: { type: String, enum: ['normal', 'refused', 'partial'], required: true },
    animalResponse: { type: String, enum: ['eager', 'reluctant', 'neutral'], required: true },
    weather: { type: String, enum: ['normal', 'hot', 'cold', 'rainy', 'windy'], required: true },
    notes: { type: String }
}, { timestamps: true });

feedingRecordSchema.pre<IFeedingRecord>('save', async function(next) {
    if (this.isNew) {
        this.slug = `${this.animalId}-${Date.now()}`;
    }
    next();
});

export const FeedingRecord = model<IFeedingRecord>('FeedingRecord', feedingRecordSchema);