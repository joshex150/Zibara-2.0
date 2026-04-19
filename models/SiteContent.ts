import mongoose, { Schema, models } from 'mongoose';

const SiteContentSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'richtext', 'array'],
    required: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SiteContentSchema.pre('save', function () {
  this.updatedAt = new Date();
});

const SiteContent = models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

export default SiteContent;
