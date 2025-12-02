import { Schema, model, Document } from 'mongoose';
import Counter from './Counter';
import { UserRole } from './UserRole';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: "farmer" | "veterinary" | "worker" | "loan_officer" | "admin";
  preferredLanguage?: 'english' | 'swahili';
  isActive: boolean;
  
  // Veterinary-specific fields
  licenseNumber?: string;
  specialization?: 'general' | 'dairy' | 'poultry' | 'small_animals' | 'surgery';
  
  // Worker and Loan Officer fields
  employeeId?: string;
  department?: string;
  
  // Loan Officer specific fields
  bankName?: string;
  branch?: string;
  wages?: number;
  //Farm Manager specific fields
  farmId?: [
    {type: Schema.Types.ObjectId, ref: 'Farm'}
  ]
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["farmer", "veterinary", "worker", "loan_officer", "admin"], required: true },
  preferredLanguage: { type: String, enum: ['english', 'swahili'] },
  isActive: { type: Boolean, default: true },
  
  // Veterinary fields
  licenseNumber: { 
    type: String,
    required: function(this: IUser) { return this.role === UserRole.VETERINARY; }
  },
  specialization: { 
    type: String, 
    enum: ['general', 'dairy', 'poultry', 'small_animals', 'surgery']
  },
  wages: { type: Number },
  // Worker and Loan Officer fields
  employeeId: { 
    type: String,
    required: function(this: IUser) { 
      return this.role === UserRole.WORKER || this.role === UserRole.LOAN_OFFICER; 
    }
  },
  department: { type: String },
  
  // Loan Officer specific fields
  bankName: { 
    type: String,
    required: function(this: IUser) { return this.role === UserRole.LOAN_OFFICER; }
  },
  branch: { 
    type: String,
    required: function(this: IUser) { return this.role === UserRole.LOAN_OFFICER; }
  },
  farmId: [
    {type: Schema.Types.ObjectId, ref: 'Farm'}
  ]
}, { timestamps: true });


userSchema.pre("validate", async function (next) {
  if (!this.employeeId && (this.role === UserRole.WORKER || this.role === UserRole.LOAN_OFFICER || this.role === UserRole.VETERINARY)) {
    let prefix;

    switch (this.role) {
      case UserRole.WORKER: prefix = "E"; break;
      case UserRole.VETERINARY: prefix = "V"; break;
      case UserRole.LOAN_OFFICER: prefix = "L"; break;
      default: prefix = "U"; 
    }

    let counter = await Counter.findOneAndUpdate(
      { name: this.role }, // ✅ independent per role
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const num = counter!.value.toString().padStart(3, "0");
    this.employeeId = `${prefix}${num}`;
  }
  next();
});

export const User = model<IUser>('User', userSchema);
