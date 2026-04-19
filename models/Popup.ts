import mongoose, { Schema, Document, models } from 'mongoose';

export interface IPopup extends Document {
  enabled: boolean;
  title: string;
  message: string;
  showButton: boolean;
  buttonText: string;
  buttonLink: string;
  showOnce: boolean; // true = localStorage (forever), false = sessionStorage (per session)
  updatedAt: Date;
}

const PopupSchema: Schema = new Schema({
  enabled: { type: Boolean, default: false },
  title: { type: String, default: 'SPECIAL ANNOUNCEMENT' },
  message: { type: String, default: 'Welcome to Crochellaa.ng!' },
  showButton: { type: Boolean, default: true },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/shop' },
  showOnce: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

PopupSchema.pre('save', function(this: IPopup) {
  this.updatedAt = new Date();
});

const Popup = models.Popup || mongoose.model<IPopup>('Popup', PopupSchema);

export default Popup;
