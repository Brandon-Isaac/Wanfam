import {Schema, model, Document} from 'mongoose';

export interface INotification extends Document {
    userId: Schema.Types.ObjectId;
    message: string;
    isRead: boolean;
    createdAt: Date;
    type?: ('info' | 'warning' | 'alert' | 'success' | 'task' | 'treatment' | 'health_record' | 'animal_registration' | 'loan_approval' | 'loan_request' | 'loan_rejection' | 'revenue' | 'expense' | 'vaccination' | 'checkup_reminder');
    relatedEntityId?: Schema.Types.ObjectId;
    relatedEntityType?: string;
}

const notificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    type: { 
        type: String, 
        enum: ['info', 'warning', 'alert', 'success', 'task', 'treatment', 'health_record', 'animal_registration', 'loan_approval', 'loan_request', 'loan_rejection', 'revenue', 'expense', 'vaccination', 'checkup_reminder'], 
        default: 'info' 
    },
    relatedEntityId: { type: Schema.Types.ObjectId },
    relatedEntityType: { type: String }
}, { timestamps: true });

export const Notification = model<INotification>('Notification', notificationSchema);