import {Schema, model, Document} from 'mongoose';

export interface ILoanRequest extends Document {
    farmerId: Schema.Types.ObjectId;
    farmId: Schema.Types.ObjectId;
    loanOfficerId: Schema.Types.ObjectId;
    amount: number;
    purpose: string;
    repaymentTerm: number; // in months
    employmentStatus: 'employed' | 'self-employed' | 'unemployed';
    collateralDetails: string;
    businessPlan: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const LoanRequestSchema = new Schema<ILoanRequest>({
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    loanOfficerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    repaymentTerm: { type: Number, required: true },
    employmentStatus: { type: String, enum: ['employed', 'self-employed', 'unemployed'], required: true },
    collateralDetails: { type: String, required: true },
    businessPlan: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const LoanRequest = model<ILoanRequest>('LoanRequest', LoanRequestSchema);