import {Schema, model, Document} from 'mongoose';

export interface IAuditLog extends Document {
    userId: Schema.Types.ObjectId;
    action: string;
    entityType: string;
    entityId: Schema.Types.ObjectId;
    timestamp: Date;
    details?:{
        method: string;
        path: string;
        body?: any;
        [key: string]: any;
    }
}
const auditLogSchema = new Schema<IAuditLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);