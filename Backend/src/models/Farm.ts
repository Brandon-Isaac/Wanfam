import { Schema, Document, model } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  owner: Schema.Types.ObjectId;
  location: {
    county: string;
    subCounty: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  size: {
    value: number;
    unit: 'acres' | 'hectares';
  };
  livestockTypes: ('cattle' | 'goats' | 'sheep' | 'poultry' | 'pigs' | 'other')[];
  isActive: boolean;
  workers: Schema.Types.ObjectId[];
  assignedVeterinarians: Schema.Types.ObjectId[]; 
  facilities: {
    feedStorage: boolean;
    waterSources: number;
    milkingParlor: boolean;
    quarantineArea: boolean;
  };
  settings: {
    currency: string;
    timezone: string;
    language: 'english' | 'swahili';
  };
  createdAt: Date;
  updatedAt: Date;
}

const farmSchema = new Schema<IFarm>({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    county: { type: String, required: true },
    subCounty: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }    
  },
  size: {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['acres', 'hectares'], default: 'acres' }
  },
  livestockTypes: [{
    type: String,
    enum: ['cattle', 'goats', 'sheep', 'poultry', 'pigs', 'other']
  }],
  isActive: { type: Boolean, default: true },
  workers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  assignedVeterinarians: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  facilities: {
    feedStorage: { type: Boolean, default: false },
    waterSources: { type: Number, default: 0 },
    milkingParlor: { type: Boolean, default: false },
    quarantineArea: { type: Boolean, default: false }
  },
  settings: {
    currency: { type: String, default: 'KES' },
    timezone: { type: String, default: 'Africa/Nairobi' },
    language: { type: String, enum: ['english', 'swahili'], default: 'english' }
  }
}, { timestamps: true });

// Indexes
farmSchema.index({ owner: 1, isActive: 1 });
farmSchema.index({ 'location.county': 1 });
farmSchema.index({ livestockTypes: 1 });

export const Farm = model<IFarm>('Farm', farmSchema);