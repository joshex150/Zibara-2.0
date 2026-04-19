import mongoose, { Schema, models } from 'mongoose';

const CurrencyRateSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
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

CurrencyRateSchema.pre('save', function () {
  this.updatedAt = new Date();
});

const CurrencyRate = models.CurrencyRate || mongoose.model('CurrencyRate', CurrencyRateSchema);

export default CurrencyRate;
