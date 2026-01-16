import {Schema, model, Document} from 'mongoose';

export interface IRevenue extends Document {
    farmId: Schema.Types.ObjectId;
    source: 'livestock_sale' | 'milk_sale' | 'egg_sale' | 'wool_sale' | 'meat_sale' | 'breeding_fee' | 'service_income' | 'grant' | 'subsidy' | 'other';
    category: 'product_sale' | 'service' | 'investment_return' | 'grant' | 'other';
    amount: number;
    currency: 'USD' | 'KES' | 'EUR' | 'GBP' | 'TZS' | 'UGX' | 'RWF' | 'ZAR' | string;
    date: Date;
    description?: string;
    
    // Related entities
    animalId?: Schema.Types.ObjectId; // If from livestock sale
    productType?: string; // milk, eggs, wool, etc.
    quantity?: number; // Amount of product sold
    unit?: string; // liters, kg, units, etc.
    pricePerUnit?: number;
    
    // Customer/buyer info
    buyer?: string;
    paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'credit' | 'other';
    paymentStatus?: 'pending' | 'partial' | 'completed' | 'overdue';
    
    // References
    invoiceNumber?: string;
    receiptNumber?: string;
    
    notes?: string;
    recordedBy?: Schema.Types.ObjectId;
}

const revenueSchema = new Schema<IRevenue>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    source: { 
        type: String, 
        enum: ['livestock_sale', 'milk_sale', 'egg_sale', 'wool_sale', 'meat_sale', 'breeding_fee', 'service_income', 'grant', 'subsidy', 'other'],
        required: true 
    },
    category: {
        type: String,
        enum: ['product_sale', 'service', 'investment_return', 'grant', 'other'],
        required: true
    },
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
    productType: { type: String },
    quantity: { type: Number, min: 0 },
    unit: { type: String },
    pricePerUnit: { type: Number, min: 0 },
    
    buyer: { type: String },
    paymentMethod: { 
        type: String, 
        enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'credit', 'other']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'overdue'],
        default: 'completed'
    },
    
    invoiceNumber: { type: String },
    receiptNumber: { type: String },
    
    notes: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for better query performance
revenueSchema.index({ farmId: 1, date: -1 });
revenueSchema.index({ farmId: 1, source: 1 });
revenueSchema.index({ farmId: 1, paymentStatus: 1 });

export const Revenue = model<IRevenue>('Revenue', revenueSchema);
