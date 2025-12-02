import {Schema, model, Document} from 'mongoose';
import Counter from './Counter';

export interface FeedingInventory extends Document {
    farmId: Schema.Types.ObjectId;
    slug?: string;
    itemName: string;
    category: ('hayandforage' | 'concentrates' | 'minerals' | 'vitamins' | 'medication' | 'equipment' | 'supplies' | 'other');
    quantity: number;
    unit: ('kg' | 'liters' | 'units' | 'bags' | 'boxes' | string);
    purchaseDate: Date;
    expirationDate?: Date;
    supplier?: string;
    storageLocation?: string;
    batchNumber?: string;
    costPerUnit?: number;
    totalCost?: number;
    notes?: string;
}

const feedingInventorySchema = new Schema<FeedingInventory>({
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
    itemName: { type: String, required: true },
    category: { type: String, enum: ['feed', 'medication', 'equipment', 'supplies', 'other'], required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'liters', 'units', 'bags', 'boxes'], required: true },
    purchaseDate: { type: Date, required: true },
    expirationDate: { type: Date },
    supplier: { type: String },
    storageLocation: { type: String },
    batchNumber: { type: String },
    costPerUnit: { type: Number, min: 0 },
    totalCost: { type: Number, min: 0 },
    notes: { type: String }
}, { timestamps: true });

feedingInventorySchema.pre<FeedingInventory>('save', async function(next) {
    if(!this.batchNumber){
        const counter = await Counter.findOneAndUpdate(
            { name: `farm_${this.farmId}_inventory` },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );
        this.batchNumber = `INV-${this.farmId}-${counter.value}`;
    }
    if (this.isNew) {
        this.slug = this.itemName.toLowerCase().replace(/ /g, '-');
    }
    next();
});



export const FeedingInventory = model<FeedingInventory>('FeedingInventory', feedingInventorySchema);
