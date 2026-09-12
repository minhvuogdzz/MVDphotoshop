import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    default: 'Photoshop Action'
  },
  fileType: { type: String, default: '.ATN' }, // e.g. .ATN, .XMP, .PSD, .ZIP, .CUBE, .ABR
  isVip: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  fileSize: { type: String, default: '0.1 MB' },
  rating: { type: Number, default: 5.0 },
  downloadType: { 
    type: String, 
    enum: ['direct', 'drive'], 
    default: 'direct' 
  },
  downloadUrl: { type: String, default: '' },
  fileUrl: { type: String, default: '' }, // For direct download (< 6MB)
  driveUrl: { type: String, default: '' }, // For Google Drive link (>= 6MB)
  coverImage: { type: String, default: '' },
  previewImage: { type: String, default: '' },
  downloadsCount: { type: Number, default: 0 },
  author: { type: String, default: 'MVD Academy' },
  instructions: { type: String, default: '' }, // Usage instructions for students
  originalFilename: { type: String, default: '' },
  localFilePath: { type: String, default: '' },
  cloudinaryUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Resource', ResourceSchema);
