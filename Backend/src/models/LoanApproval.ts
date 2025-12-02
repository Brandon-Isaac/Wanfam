import {Schema, model, Document} from 'mongoose';

export interface ILoanApproval extends Document {
    loanRequestId: Schema.Types.ObjectId;
    approvedBy: Schema.Types.ObjectId;
    loanSlug: string;
    approvedAmount: number;
    interestRate: number; // as a percentage
    repaymentSchedule: string; // e.g., "monthly", "quarterly"
    status: 'approved' | 'disbursed' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

const LoanApprovalSchema = new Schema<ILoanApproval>({
    loanRequestId: { type: Schema.Types.ObjectId, ref: 'LoanRequest', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    repaymentSchedule: { type: String, required: true },
    status: { type: String, enum: ['approved', 'disbursed', 'closed'], default: 'approved' },
}, { timestamps: true });

LoanApprovalSchema.pre<ILoanApproval>('save', function(next) {
    if (!this.loanSlug) {
        this.loanSlug = `LA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

export const LoanApproval = model<ILoanApproval>('LoanApproval', LoanApprovalSchema);