import mongoose from 'mongoose';

const PromoSchema = new mongoose.Schema({
  images: [{ type: String }],
  mobileEnabled: { type: Boolean, default: false },
  desktopEnabled: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Promo', PromoSchema);
