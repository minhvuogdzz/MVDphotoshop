import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  quote: { type: String, required: true },
  image: { type: String }, // Customer image or result image
}, { timestamps: true });

export default mongoose.model('Testimonial', TestimonialSchema);
