import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Gói sửa', 'Dịch vụ sửa'] },
  image: { type: String },
  price: { type: String }, // e.g. "Bắt đầu từ 500k"
  details: [{ type: String }], // e.g. "Sửa 20 ảnh", "Tặng thêm 2 ảnh"
}, { timestamps: true });

export default mongoose.model('Service', ServiceSchema);
