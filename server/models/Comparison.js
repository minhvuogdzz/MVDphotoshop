import mongoose from 'mongoose';

const ComparisonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  beforeImage: { type: String, required: true },
  afterImage: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Comparison', ComparisonSchema);
