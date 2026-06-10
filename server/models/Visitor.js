import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  sessionId: { type: String },
  ip: { type: String, required: true },
  city: { type: String, default: 'Unknown' },
  country: { type: String, default: 'Unknown' },
  lat: { type: Number },
  lon: { type: Number },
  joinTime: { type: Date, default: Date.now },
  leaveTime: { type: Date, default: null },
});

export default mongoose.model('Visitor', VisitorSchema);
