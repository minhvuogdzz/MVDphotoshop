import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  backgroundUrls: [{ type: String }],
  isVideo: { type: Boolean, default: false },
  ctaText: { type: String, default: 'Xem Portfolio' },
  ctaLink: { type: String, default: '#portfolio' },
}, { timestamps: true });

export default mongoose.model('Hero', HeroSchema);
