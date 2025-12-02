import {Schema, model, Document} from 'mongoose';

export interface IFarmWorker extends Document {
    farmId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    taskId: [{ type: Schema.Types.ObjectId, ref: 'Task' }];
    salary:{
        amount: number;
        currency: string;
        paymentInterval: 'monthly' | 'bi-monthly' | 'weekly' | 'daily';
        status: 'paid' | 'unpaid';
    }
    startDate: Date;
    isActive: boolean;
}

const farmWorkerSchema = new Schema<IFarmWorker>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    salary: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        paymentInterval: { type: String, enum: ['monthly', 'bi-monthly', 'weekly', 'daily'], required: true },
        status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }
    },
    startDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
});
export const FarmWorker = model<IFarmWorker>('FarmWorker', farmWorkerSchema);