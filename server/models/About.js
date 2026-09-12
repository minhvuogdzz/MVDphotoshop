import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Về MVD Photoshop Academy' },
  academyName: { type: String, default: 'MVD Photoshop Academy' },
  slogan: { type: String, default: 'Nơi đào tạo chuyên sâu & kiến tạo những chuyên gia Retouching hàng đầu' },
  name: { type: String, default: 'Dương Minh Vương' },
  role: { type: String, default: 'Founder & Head Retoucher' },
  quote: { type: String, default: '' },
  storyTitle: { type: String, default: '' },
  storySubtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  story: { type: String, default: '' },
  vision: { type: String, default: '' },
  mission: { type: String, default: '' },
  coreValues: [
    {
      title: { type: String },
      desc: { type: String },
      icon: { type: String }
    }
  ],
  stats: [
    {
      label: { type: String },
      value: { type: String }
    }
  ],
  instructors: [
    {
      name: { type: String },
      role: { type: String },
      avatar: { type: String },
      bio: { type: String },
      exp: { type: String }
    }
  ],
  skills: [{ type: String }],
  education: { type: String },
  images: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('About', AboutSchema);
