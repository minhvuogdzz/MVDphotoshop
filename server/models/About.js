import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String }, // Tên người sửa ảnh
  description: { type: String, required: true },
  skills: [{ type: String }], // Kỹ năng (VD: Photoshop, Lightroom)
  education: { type: String }, // Học vấn / Kinh nghiệm
  images: [{ type: String }], // Thư viện ảnh
}, { timestamps: true });

export default mongoose.model('About', AboutSchema);
