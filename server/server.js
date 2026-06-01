import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { login } from './controllers/authController.js';
import { handleChat, getChatContext } from './controllers/chatController.js';
import { handleContact } from './controllers/contactController.js';
import { requireAuth } from './middlewares/authMiddleware.js';
import { v2 as cloudinary } from 'cloudinary';

// Models
import Hero from './models/Hero.js';
import Portfolio from './models/Portfolio.js';
import Service from './models/Service.js';
import About from './models/About.js';
import Testimonial from './models/Testimonial.js';
import FAQ from './models/FAQ.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

const streamUploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: "mvd-portfolio" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};

// Routes
// Upload
app.post('/api/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Compress with sharp (max 1920px width, webp 80% quality -> usually < 600kb)
    const webpBuffer = await sharp(req.file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const result = await streamUploadToCloudinary(webpBuffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload-multiple', requireAuth, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const urls = [];
    for (const file of req.files) {
      const webpBuffer = await sharp(file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const result = await streamUploadToCloudinary(webpBuffer);
      urls.push(result.secure_url);
    }

    res.json({ urls });
  } catch (err) {
    console.error('Upload Multiple Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Auth
app.post('/api/auth/login', login);

// Chat
app.post('/api/chat', handleChat);
app.get('/api/chat-context', getChatContext);

// Contact
app.post('/api/contact', handleContact);

// --- API Endpoints ---
// Hero
app.get('/api/hero', async (req, res) => {
  try {
    const hero = await Hero.findOne();
    res.json(hero || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/hero', requireAuth, async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (hero) {
      Object.assign(hero, req.body);
    } else {
      hero = new Hero(req.body);
    }
    await hero.save();
    res.json(hero);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/portfolio', requireAuth, async (req, res) => {
  try {
    let portfolio;
    if (req.body._id) {
      portfolio = await Portfolio.findByIdAndUpdate(req.body._id, req.body, { new: true });
    } else {
      portfolio = new Portfolio(req.body);
      await portfolio.save();
    }
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/portfolio/:id', requireAuth, async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/services', requireAuth, async (req, res) => {
  try {
    let service;
    if (req.body._id) {
      service = await Service.findByIdAndUpdate(req.body._id, req.body, { new: true });
    } else {
      service = new Service(req.body);
      await service.save();
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/services/:id', requireAuth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// About
app.get('/api/about', async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/about', requireAuth, async (req, res) => {
  try {
    let about = await About.findOne();
    if (about) {
      Object.assign(about, req.body);
    } else {
      about = new About(req.body);
    }
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/testimonials', requireAuth, async (req, res) => {
  try {
    let testimonial;
    if (req.body._id) {
      testimonial = await Testimonial.findByIdAndUpdate(req.body._id, req.body, { new: true });
    } else {
      testimonial = new Testimonial(req.body);
      await testimonial.save();
    }
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/testimonials/:id', requireAuth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FAQ
app.get('/api/faq', async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/faq', requireAuth, async (req, res) => {
  try {
    let faq;
    if (req.body._id) {
      faq = await FAQ.findByIdAndUpdate(req.body._id, req.body, { new: true });
    } else {
      faq = new FAQ(req.body);
      await faq.save();
    }
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/faq/:id', requireAuth, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mvd-portfolio')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
