import {Schema, model, Document} from 'mongoose';

export interface IExpense extends Document {
    farmId: Schema.Types.ObjectId;
    category: 'feed' | 'healthcare' | 'labor' | 'equipment' | 'infrastructure' | 'utilities' | 'maintenance' | 'insurance' | 'transportation' | 'marketing' | 'administrative' | 'loan_repayment' | 'taxes' | 'other';
    subcategory?: string;
    amount: number;
    currency: 'USD' | 'KES' | 'EUR' | 'GBP' | 'TZS' | 'UGX' | 'RWF' | 'ZAR' | string;
    date: Date;
    description?: string;
    
    // Related entities
    animalId?: Schema.Types.ObjectId;
    workerId?: Schema.Types.ObjectId;
    inventoryId?: Schema.Types.ObjectId; 
    
    // Vendor/supplier info
    vendor?: string;
    paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'credit' | 'other';
    paymentStatus?: 'pending' | 'partial' | 'completed' | 'overdue';
    
    // Tracking
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    
    // References
    invoiceNumber?: string;
    receiptNumber?: string;
    
    notes?: string;
    recordedBy?: Schema.Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    category: {
        type: String,
        enum: [
            'feed', 
            'healthcare', 
            'labor', 
            'equipment', 
            'infrastructure', 
            'utilities', 
            'maintenance', 
            'insurance', 
            'transportation', 
            'marketing', 
            'administrative', 
            'loan_repayment',
            'taxes',
            'other'
        ],
        required: true
    },
    subcategory: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { 
        type: String, 
        enum: ['USD', 'KES', 'EUR', 'GBP', 'TZS', 'UGX', 'RWF', 'ZAR'],
        default: 'KES',
        required: true 
    },
    date: { type: Date, required: true },
    description: { type: String },
    
    animalId: { type: Schema.Types.ObjectId, ref: 'Animal' },
    workerId: { type: Schema.Types.ObjectId, ref: 'User' },
    inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory' },
    
    vendor: { type: String },
    paymentMethod: { 
        type: String, 
        enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'credit', 'other']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'overdue'],
        default: 'completed'
    },
    
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    
    invoiceNumber: { type: String },
    receiptNumber: { type: String },
    
    notes: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for better query performance
expenseSchema.index({ farmId: 1, date: -1 });
expenseSchema.index({ farmId: 1, category: 1 });
expenseSchema.index({ farmId: 1, paymentStatus: 1 });
expenseSchema.index({ farmId: 1, isRecurring: 1 });

export const Expense = model<IExpense>('Expense', expenseSchema);
