import mongoose, { Schema, Document, models } from 'mongoose';

// Product measurement for a size
export interface IProductMeasurement {
  size: string;
  bust: number;
  waist: number;
  hip: number;
  length: number;
  sleeve: number;
  cuff: number;
}

// Body measurement for a size
export interface IBodyMeasurement {
  size: string;
  height: string;
  bust: string;
  waist: string;
  hip: string;
}

export interface ISizeGuide extends Document {
  productMeasurements: IProductMeasurement[];
  bodyMeasurements: IBodyMeasurement[];
  fitType: 'skinny' | 'regular' | 'oversized';
  stretch: 'none' | 'slight' | 'medium' | 'high';
  measurementTips: string[];
  sizeTips: string[];
  updatedAt: Date;
}

const ProductMeasurementSchema = new Schema({
  size: { type: String, required: true },
  bust: { type: Number, required: true },
  waist: { type: Number, required: true },
  hip: { type: Number, required: true },
  length: { type: Number, required: true },
  sleeve: { type: Number, required: true },
  cuff: { type: Number, required: true },
});

const BodyMeasurementSchema = new Schema({
  size: { type: String, required: true },
  height: { type: String, required: true },
  bust: { type: String, required: true },
  waist: { type: String, required: true },
  hip: { type: String, required: true },
});

const SizeGuideSchema: Schema = new Schema({
  productMeasurements: {
    type: [ProductMeasurementSchema],
    default: [],
  },
  bodyMeasurements: {
    type: [BodyMeasurementSchema],
    default: [],
  },
  fitType: {
    type: String,
    enum: ['skinny', 'regular', 'oversized'],
    default: 'regular',
  },
  stretch: {
    type: String,
    enum: ['none', 'slight', 'medium', 'high'],
    default: 'slight',
  },
  measurementTips: {
    type: [String],
    default: [],
  },
  sizeTips: {
    type: [String],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const SizeGuide = models.SizeGuide || mongoose.model<ISizeGuide>('SizeGuide', SizeGuideSchema);

export default SizeGuide;
