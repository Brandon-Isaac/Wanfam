import { Schema,model,Document } from "mongoose";

export interface ITask extends Document {
    farmId: Schema.Types.ObjectId;
    title: string;
    description?: string;
    assignedTo?: Schema.Types.ObjectId[];
    dueDate?: Date;
    taskCategory?: ('Feeding' | 'Cleaning' | 'Medical' | 'Maintenance' | 'Other');
    status: ('Pending' | 'In Progress' | 'Completed' | 'Overdue');
    priority?: ('Low' | 'Medium' | 'High' | 'Urgent');
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    animalId?: Schema.Types.ObjectId;
    feedingScheduleId?: Schema.Types.ObjectId;
    feedingDetails?: {
        feedType?: string;
        quantity?: number;
        unit?: string;
        feedingTime?: string;
    };
}

const taskSchema = new Schema<ITask>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
    taskCategory: { type: String, enum: ['Feeding', 'Cleaning', 'Medical', 'Maintenance', 'Other'] },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Overdue'], required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal' },
    feedingScheduleId: { type: Schema.Types.ObjectId, ref: 'FeedingSchedule' },
    feedingDetails: {
        feedType: { type: String },
        quantity: { type: Number },
        unit: { type: String },
        feedingTime: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Task = model<ITask>('Task', taskSchema);