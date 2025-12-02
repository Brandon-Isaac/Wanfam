import {Schema, model, Document} from 'mongoose';

export interface ILoanOfficer extends Document {
    userId: Schema.Types.ObjectId;
    officerSlug: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bankName:string;
    ratePerAnnum:number;
    approvedLoans: Schema.Types.ObjectId[]; // Array of LoanApproval IDs
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const LoanOfficerSchema = new Schema<ILoanOfficer>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    officerSlug: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    approvedLoans: [{ type: Schema.Types.ObjectId, ref: 'LoanApproval' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export const LoanOfficer = model<ILoanOfficer>('LoanOfficer', LoanOfficerSchema);
