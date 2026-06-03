import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  gridItems: [
    {
      image1: { type: String, default: '' },
      image2: { type: String, default: '' }
    }
  ],
  ctaText: { type: String, default: 'Xem Portfolio' },
  ctaLink: { type: String, default: '#portfolio' },
}, { timestamps: true });

// Ensure we have exactly 10 items in the grid if empty
HeroSchema.pre('save', function(next) {
  if (!this.gridItems || this.gridItems.length === 0) {
    this.gridItems = Array(10).fill({ image1: '', image2: '' });
  } else if (this.gridItems.length < 10) {
    const missing = 10 - this.gridItems.length;
    this.gridItems = [...this.gridItems, ...Array(missing).fill({ image1: '', image2: '' })];
  } else if (this.gridItems.length > 10) {
    this.gridItems = this.gridItems.slice(0, 10);
  }
  next();
});

export default mongoose.model('Hero', HeroSchema);
