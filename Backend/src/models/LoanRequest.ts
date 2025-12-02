import {Schema, model, Document} from 'mongoose';

export interface ILoanRequest extends Document {
    farmerId: Schema.Types.ObjectId;
    loanOfficerId: Schema.Types.ObjectId;
    requestSlug: string;
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
    loanOfficerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    repaymentTerm: { type: Number, required: true },
    employmentStatus: { type: String, enum: ['employed', 'self-employed', 'unemployed'], required: true },
    collateralDetails: { type: String, required: true },
    businessPlan: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

LoanRequestSchema.pre<ILoanRequest>('save', function(next) {
    if (!this.requestSlug) {
        this.requestSlug = `LR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

export const LoanRequest = model<ILoanRequest>('LoanRequest', LoanRequestSchema);