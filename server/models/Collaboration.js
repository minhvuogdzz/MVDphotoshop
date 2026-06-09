import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  driveLink: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

export default Collaboration;
