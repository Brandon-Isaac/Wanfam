import {Schema, model, Document} from 'mongoose';

interface IInventory extends Document {
    farmId: typeof Schema.Types.ObjectId;
    itemName: string;
    quantity: number;
    price: number;
    category: string;
    supplier: string;
    lastRestocked: Date;
}
const InventorySchema: Schema = new Schema({
    farmId: {type: Schema.Types.ObjectId, required: true},
    itemName: {type: String, required: true},
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
    category: {type: String, required: true},
    supplier: {type: String, required: true},
    lastRestocked: {type: Date, required: true}
});

const Inventory = model<IInventory>('Inventory', InventorySchema);

export default Inventory;