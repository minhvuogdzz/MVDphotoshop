import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  gridItems: [
    {
      image1: { type: String, default: '' },
      image2: { type: String, default: '' },
      image3: { type: String, default: '' },
      image4: { type: String, default: '' }
    }
  ],
  ctaText: { type: String, default: 'Xem Portfolio' },
  ctaLink: { type: String, default: '#portfolio' },
}, { timestamps: true });

// Ensure we have exactly 10 items in the grid if empty
HeroSchema.pre('save', function() {
  if (!this.gridItems) this.gridItems = [];
  while (this.gridItems.length < 10) {
    this.gridItems.push({ image1: '', image2: '', image3: '', image4: '' });
  }
  if (this.gridItems.length > 10) {
    this.gridItems.splice(10);
  }
});

export default mongoose.model('Hero', HeroSchema);
