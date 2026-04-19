import mongoose, { Schema, models } from 'mongoose';

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  sizes: {
    type: [String],
    default: [],
  },
  colors: {
    type: [{
      name: { type: String, required: true },
      hex: { type: String, required: true },
    }],
    default: [],
  },
  material: {
    type: String,
    default: '',
  },
  care: {
    type: [String],
    default: [],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
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

// Update timestamp before saving
ProductSchema.pre('save', function(this: any) {
  this.updatedAt = new Date();
});

const Product = models.Product || mongoose.model('Product', ProductSchema);

export default Product;
