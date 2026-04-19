import mongoose, { Schema, Document, models } from 'mongoose';

export interface ICustomOrder extends Document {
  // Customer info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Order details
  itemType: string; // e.g., "Top", "Dress", "Skirt", "Set", "Other"
  description: string;
  colors: string[];
  
  // Measurements (optional - can be provided later)
  measurements?: {
    bust?: number;
    waist?: number;
    hip?: number;
    length?: number;
    other?: string;
  };
  
  // Additional info
  referenceImages?: string[];
  budget?: string;
  deadline?: string;
  additionalNotes?: string;
  
  // Status tracking
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  adminNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  colors: {
    type: [String],
    default: [],
  },
  measurements: {
    bust: Number,
    waist: Number,
    hip: Number,
    length: Number,
    other: String,
  },
  referenceImages: {
    type: [String],
    default: [],
  },
  budget: {
    type: String,
    default: '',
  },
  deadline: {
    type: String,
    default: '',
  },
  additionalNotes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CustomOrderSchema.pre('save', function(this: ICustomOrder) {
  this.updatedAt = new Date();
});

const CustomOrder = models.CustomOrder || mongoose.model<ICustomOrder>('CustomOrder', CustomOrderSchema);

export default CustomOrder;
