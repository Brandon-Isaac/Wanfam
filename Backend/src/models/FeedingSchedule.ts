import {Schema, model, Document} from 'mongoose';

export interface IFeedingSchedule extends Document {
    farmId: Schema.Types.ObjectId;
    animalId: [{ type: Schema.Types.ObjectId, ref: 'Animal' }];
    slug?: string;
    scheduleName: string;
    feedType: string;
    quantity: number;
    unit: ('kg' | 'liters' | 'units' | string);
    frequency: ('onceDaily' | 'twiceDaily' | 'thriceDaily' | 'weekly' | 'biWeekly' | 'monthly' | string);
    startDate: Date;
    endDate?: Date;
    feedingTime: Date;
    notes?: string;
    reminders?: boolean;
    executionHistory?: Array<{
        executedDate: Date;
        actualQuantity: number;
        notes?: string;
        completedBy: string;
        status: 'completed'| 'pending' | 'missed';
    }>;
    lastExecuted?: Date;
}

const feedingScheduleSchema = new Schema<IFeedingSchedule>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    animalId: [{ type: Schema.Types.ObjectId, ref: 'Animal', required: true }],
    scheduleName: { type: String, required: true },
    feedType: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'liters', 'units'], required: true },
    frequency: { type: String, enum: ['onceDaily', 'twiceDaily', 'thriceDaily', 'weekly', 'biWeekly', 'monthly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    feedingTime: { type: Date, required: true },
    notes: { type: String },
    reminders: { type: Boolean, default: false },
    executionHistory: [{
        executedDate: { type: Date, required: true },
        actualQuantity: { type: Number, required: true },
        notes: { type: String },
        completedBy: { type: String, required: true },
        status: { type: String, enum: ['completed', 'pending', 'missed'], required: true },
    }],
    lastExecuted: { type: Date },
}, { timestamps: true });

feedingScheduleSchema.pre<IFeedingSchedule>('save', async function(next) {
    if (this.isNew) {
        this.slug = this.scheduleName.toLowerCase().replace(/ /g, '-');
    }
    next();
});

export const FeedingSchedule = model<IFeedingSchedule>('FeedingSchedule', feedingScheduleSchema);