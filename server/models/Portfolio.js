import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['Beauty', 'Concept nàng thơ', 'Couple / Gia đình', 'Khác'] },
  location: { type: String },
  coverImage: { type: String },
  images: [{ type: String }], // Array of image URLs (uploaded or drive direct links)
  order: { type: Number, default: 0 }, // Lower number = displayed first
}, { timestamps: true });

export default mongoose.model('Portfolio', PortfolioSchema);
