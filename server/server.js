import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { login } from './controllers/authController.js';
import { handleChat, getChatContext } from './controllers/chatController.js';
import { handleContact } from './controllers/contactController.js';
import { requireAuth } from './middlewares/authMiddleware.js';
import { v2 as cloudinary } from 'cloudinary';
import { sendEmail } from './utils/emailService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';

// Models
import Hero from './models/Hero.js';
import Portfolio from './models/Portfolio.js';
import Service from './models/Service.js';
import About from './models/About.js';
import Testimonial from './models/Testimonial.js';
import FAQ from './models/FAQ.js';
import Comparison from './models/Comparison.js';
import Collaboration from './models/Collaboration.js';
import Visitor from './models/Visitor.js';
import Promo from './models/Promo.js';
import Resource from './models/Resource.js';
import PageSettings from './models/PageSettings.js';


dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

io.on('connection', async (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  const query = socket.handshake.query || {};
  if (query.type === 'admin') {
    console.log('Admin socket connected, skipping visitor tracking.');
    return;
  }

  let dbVisitorId = null;
  const sessionId = query.sessionId;
  
  try {
    let existingVisitor = null;
    if (sessionId) {
      existingVisitor = await Visitor.findOne({ sessionId }).sort({ joinTime: -1 });
    }

    if (existingVisitor) {
      // Resume existing session to prevent duplicates (page reload, strict mode)
      existingVisitor.leaveTime = null;
      await existingVisitor.save();
      dbVisitorId = existingVisitor._id;

      const recentVisitors = await Visitor.find().sort({ joinTime: -1 }).limit(100);
      io.emit('visitor-updated', recentVisitors);
    } else {
      let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
      if (ip.includes(',')) ip = ip.split(',')[0].trim();
      if (ip.startsWith('::ffff:')) ip = ip.substring(7);
      
      let city = 'Unknown';
      let country = 'Unknown';
      let lat = 21.0285;
      let lon = 105.8542;

      if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
        city = 'Mạng nội bộ (LAN/Dev)';
        country = 'Vietnam';
        ip = ip === '::1' ? '127.0.0.1' : ip;
      }

      const newVisitor = new Visitor({
        sessionId,
        ip,
        city,
        country,
        lat,
        lon,
        joinTime: Date.now(),
        leaveTime: null
      });
      const savedVisitor = await newVisitor.save();
      dbVisitorId = savedVisitor._id;

      // Emit immediately so UI updates fast
      const recentVisitors = await Visitor.find().sort({ joinTime: -1 }).limit(100);
      io.emit('visitor-updated', recentVisitors);

      // Asynchronous IP lookup for external visitors to update Map coordinates
      if (ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
        fetch(`https://ipapi.co/${ip}/json/`)
          .then(res => res.json())
          .catch(() => fetch(`http://ip-api.com/json/${ip}`).then(r => r.json()))
          .then(async data => {
            if (data && (data.status === 'success' || data.city)) {
              const locCity = data.city || 'Unknown';
              const locCountry = data.country_name || data.country || 'Unknown';
              const locLat = Number(data.latitude || data.lat) || 21.0285;
              const locLon = Number(data.longitude || data.lon) || 105.8542;

              await Visitor.findByIdAndUpdate(dbVisitorId, {
                city: locCity,
                country: locCountry,
                lat: locLat,
                lon: locLon
              });
              const updatedList = await Visitor.find().sort({ joinTime: -1 }).limit(100);
              io.emit('visitor-updated', updatedList);
            }
          })
          .catch(err => {
            console.warn(`Geo IP lookup failed for ${ip}:`, err.message);
          });
      }
    }
  } catch (err) {
    console.error('Error tracking visitor:', err);
  }

  socket.on('disconnect', async () => {
    console.log('🔌 Client disconnected:', socket.id);
    if (dbVisitorId) {
      try {
        await Visitor.findByIdAndUpdate(dbVisitorId, { leaveTime: Date.now() });
        const recentVisitors = await Visitor.find().sort({ joinTime: -1 }).limit(100);
        io.emit('visitor-updated', recentVisitors);
      } catch (err) {
        console.error('Error updating visitor disconnect:', err);
      }
    }
  });
});

// Helper: emit data update event
const emitDataUpdate = (section) => {
  io.emit('data-updated', { section, timestamp: Date.now() });
  console.log(`📡 Emitted data-updated for: ${section}`);
};

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ensure resources upload folder exists
const resourcesUploadDir = path.join(__dirname, 'public/uploads/resources');
if (!fs.existsSync(resourcesUploadDir)) {
  fs.mkdirSync(resourcesUploadDir, { recursive: true });
}

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

const uploadResourceFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB limit for direct uploads
});

const streamUploadRawToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const ext = (path.extname(filename || 'resource.zip') || '.zip').toLowerCase();
    const rawBase = path.basename(filename || 'resource', ext);
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `${cleanBase}_${Date.now()}${ext}`; // Include extension to preserve file format!

    let stream = cloudinary.uploader.upload_stream(
      { 
        folder: "mvd-academy-resources", 
        resource_type: "raw", // CRITICAL: strictly raw binary to avoid converting or corrupting files!
        public_id: publicId,
        use_filename: true,
        unique_filename: false
      },
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

    let finalBuffer;
    if (req.file.mimetype === 'image/gif') {
      finalBuffer = req.file.buffer;
    } else {
      // Compress with sharp (max 1920px width, webp 80% quality -> usually < 600kb)
      finalBuffer = await sharp(req.file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    }

    const result = await streamUploadToCloudinary(finalBuffer);
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
      let finalBuffer;
      if (file.mimetype === 'image/gif') {
        finalBuffer = file.buffer;
      } else {
        finalBuffer = await sharp(file.buffer)
          .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
      }

      const result = await streamUploadToCloudinary(finalBuffer);
      urls.push(result.secure_url);
    }

    res.json({ urls });
  } catch (err) {
    console.error('Upload Multiple Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload-resource-file', requireAuth, (req, res, next) => {
  uploadResourceFile.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File vượt quá dung lượng 6MB! Với file từ 6MB trở lên, bạn hãy chọn phương thức "Liên kết Google Drive".' });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Chưa có file nào được tải lên' });
    }

    const originalName = req.file.originalname;
    const ext = (path.extname(originalName) || '.zip').toLowerCase();
    const rawBase = path.basename(originalName, ext);
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_');
    const savedFilename = `${Date.now()}_${cleanBase}${ext}`;
    const localFilePath = path.join(resourcesUploadDir, savedFilename);

    // 1. Write exact binary bytes to local disk (100% byte fidelity)
    fs.writeFileSync(localFilePath, req.file.buffer);

    // 2. Upload to Cloudinary with resource_type: "raw" as cloud backup
    let cloudinaryResult = null;
    try {
      cloudinaryResult = await streamUploadRawToCloudinary(req.file.buffer, originalName);
    } catch (cldErr) {
      console.warn('Cloudinary upload warning (local file saved successfully):', cldErr.message);
    }

    const sizeInMb = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const localUrl = `/uploads/resources/${savedFilename}`;
    const primaryUrl = cloudinaryResult?.secure_url || localUrl;

    res.json({
      url: primaryUrl,
      localUrl,
      cloudinaryUrl: cloudinaryResult?.secure_url || '',
      localFilePath,
      savedFilename,
      fileSize: sizeInMb,
      fileType: ext.toUpperCase(),
      originalName,
      originalFilename: originalName
    });
  } catch (err) {
    console.error('Upload Resource File Error:', err);
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

// Ping (to keep server awake)
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// --- API Endpoints ---
// Promo
app.get('/api/promo', async (req, res) => {
  try {
    const promo = await Promo.findOne();
    res.json(promo || { images: [], mobileEnabled: false, desktopEnabled: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/promo', requireAuth, async (req, res) => {
  try {
    let promo = await Promo.findOne();
    if (promo) {
      Object.assign(promo, req.body);
    } else {
      promo = new Promo(req.body);
    }
    await promo.save();
    emitDataUpdate('promo');
    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Page Settings (All Page Headings, Descriptions & Banner Images)
app.get('/api/page-settings', async (req, res) => {
  try {
    let settings = await PageSettings.findOne();
    if (!settings) {
      settings = await PageSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/page-settings', requireAuth, async (req, res) => {
  try {
    let settings = await PageSettings.findOne();
    if (settings) {
      for (const key of Object.keys(req.body)) {
        if (typeof req.body[key] === 'object' && req.body[key] !== null && !Array.isArray(req.body[key])) {
          settings[key] = { ...(settings[key] ? settings[key].toObject?.() || settings[key] : {}), ...req.body[key] };
        } else {
          settings[key] = req.body[key];
        }
      }
    } else {
      settings = new PageSettings(req.body);
    }
    await settings.save();
    emitDataUpdate('pageSettings');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visitors
app.get('/api/visitors', requireAuth, async (req, res) => {
  try {
    const recentVisitors = await Visitor.find().sort({ joinTime: -1 }).limit(100);
    res.json(recentVisitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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
    emitDataUpdate('hero');
    res.json(hero);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ order: 1, createdAt: -1 });
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
      // Auto-assign order to end of list
      const count = await Portfolio.countDocuments();
      req.body.order = count;
      portfolio = new Portfolio(req.body);
      await portfolio.save();
    }
    emitDataUpdate('portfolio');
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Reorder portfolio items
app.put('/api/portfolio/reorder', requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // [{id, order}, ...]
    for (const item of items) {
      await Portfolio.findByIdAndUpdate(item.id, { order: item.order });
    }
    emitDataUpdate('portfolio');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/portfolio/:id', requireAuth, async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    emitDataUpdate('portfolio');
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
    emitDataUpdate('services');
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/services/:id', requireAuth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    emitDataUpdate('services');
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
    emitDataUpdate('about');
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
    emitDataUpdate('testimonials');
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/testimonials/:id', requireAuth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    emitDataUpdate('testimonials');
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
    emitDataUpdate('faq');
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/faq/:id', requireAuth, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    emitDataUpdate('faq');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comparisons (Before/After)
app.get('/api/comparisons', async (req, res) => {
  try {
    const comparisons = await Comparison.find().sort({ order: 1, createdAt: -1 });
    res.json(comparisons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/comparisons', requireAuth, async (req, res) => {
  try {
    let comparison;
    if (req.body._id) {
      comparison = await Comparison.findByIdAndUpdate(req.body._id, req.body, { new: true });
    } else {
      const count = await Comparison.countDocuments();
      req.body.order = count;
      comparison = new Comparison(req.body);
      await comparison.save();
    }
    emitDataUpdate('comparisons');
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/comparisons/reorder', requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await Comparison.findByIdAndUpdate(item.id, { order: item.order });
    }
    emitDataUpdate('comparisons');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/comparisons/:id', requireAuth, async (req, res) => {
  try {
    await Comparison.findByIdAndDelete(req.params.id);
    emitDataUpdate('comparisons');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Collaborations (Sản phẩm cộng tác)
app.get('/api/collaborations', async (req, res) => {
  try {
    const collaborations = await Collaboration.find().sort({ order: 1, createdAt: -1 });
    res.json(collaborations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/collaborations', requireAuth, async (req, res) => {
  try {
    let collaboration;
    if (req.body._id) {
      collaboration = await Collaboration.findByIdAndUpdate(req.body._id, req.body, { new: true });
    } else {
      const count = await Collaboration.countDocuments();
      req.body.order = count;
      collaboration = new Collaboration(req.body);
      await collaboration.save();
    }
    emitDataUpdate('collaborations');
    res.json(collaboration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/collaborations/reorder', requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await Collaboration.findByIdAndUpdate(item.id, { order: item.order });
    }
    emitDataUpdate('collaborations');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/collaborations/:id', requireAuth, async (req, res) => {
  try {
    await Collaboration.findByIdAndDelete(req.params.id);
    emitDataUpdate('collaborations');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== RESOURCES (Kho Tài Nguyên) ====================
app.get('/api/resources', async (req, res) => {
  try {
    const { category, tag, search, vip, hot } = req.query;
    let query = {};

    if (category && category !== 'Tất cả') {
      query.category = category;
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }
    if (vip === 'true') {
      query.isVip = true;
    }
    if (hot === 'true') {
      query.isHot = true;
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { category: searchRegex },
        { fileType: searchRegex }
      ];
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Không tìm thấy tài nguyên' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resources', requireAuth, async (req, res) => {
  try {
    let resource;
    if (req.body._id) {
      resource = await Resource.findByIdAndUpdate(req.body._id, req.body, { new: true });
    } else {
      resource = new Resource(req.body);
      await resource.save();
    }
    emitDataUpdate('resources');
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/resources/:id', requireAuth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    emitDataUpdate('resources');
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/resources/:id', requireAuth, async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    emitDataUpdate('resources');
    res.json({ success: true, message: 'Đã xóa tài nguyên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Không tìm thấy tài nguyên' });
    }

    // Google Drive link redirection
    if (resource.downloadType === 'drive') {
      const driveLink = resource.driveUrl || resource.downloadUrl;
      if (driveLink && driveLink.startsWith('http')) {
        return res.redirect(driveLink);
      }
      return res.status(400).json({ error: 'Liên kết Google Drive không hợp lệ' });
    }

    // Direct download
    // 1. Determine exact file extension
    const ext = (resource.fileType?.startsWith('.') 
      ? resource.fileType.toLowerCase() 
      : ('.' + (resource.fileType || 'zip').toLowerCase()));
    
    let baseFilename = resource.originalFilename || resource.title || 'MVD_Resource';
    // Clean dangerous characters for file naming
    baseFilename = baseFilename.replace(/[/\\?%*:|"<>]/g, '_').trim();
    const downloadFilename = baseFilename.toLowerCase().endsWith(ext) 
      ? baseFilename 
      : `${baseFilename}${ext}`;

    // Clean ascii filename fallback for headers
    const asciiFilename = downloadFilename.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');

    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

    // 2. Check if local file exists on server disk
    let diskPath = resource.localFilePath;
    if (!diskPath || !fs.existsSync(diskPath)) {
      if (resource.downloadUrl && resource.downloadUrl.includes('/uploads/resources/')) {
        const fname = path.basename(resource.downloadUrl);
        const testPath = path.join(resourcesUploadDir, fname);
        if (fs.existsSync(testPath)) diskPath = testPath;
      }
    }

    if (diskPath && fs.existsSync(diskPath)) {
      return res.download(diskPath, downloadFilename);
    }

    // 3. Fallback to Cloudinary / remote URL
    const remoteUrl = resource.cloudinaryUrl || resource.downloadUrl || resource.fileUrl;
    if (remoteUrl && remoteUrl.startsWith('http')) {
      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`Lỗi khi tải tệp từ đám mây: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`
      );
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    return res.status(404).json({ error: 'Tài nguyên chưa có file tải về' });
  } catch (err) {
    console.error('Resource Download Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resources/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );
    res.json({ success: true, downloadsCount: resource ? resource.downloadsCount : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== GLOBAL SEARCH (Toàn trang) ====================
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ resources: [], services: [], courses: [], portfolios: [], projects: [] });
    }
    const escaped = q.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const [resources, services, portfolios] = await Promise.all([
      Resource.find({ 
        $or: [
          { title: regex }, 
          { description: regex }, 
          { tags: regex },
          { category: regex },
          { fileType: regex }
        ] 
      }).limit(6),
      Service.find({ $or: [{ name: regex }, { type: regex }, { description: regex }] }).limit(4),
      Portfolio.find({ $or: [{ title: regex }, { category: regex }, { location: regex }] }).limit(6)
    ]);
    res.json({ resources, services, courses: services, portfolios, projects: portfolios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MVD AI SMART SEARCH (Trí tuệ nhân tạo MVD AI) ====================
app.post('/api/search/ai', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập câu hỏi tìm kiếm cho MVD AI' });
    }

    const trimmedQuery = query.trim();

    // Fetch database items across the ENTIRE website to ground MVD AI
    const [allPortfolios, allResources, allServices, allComparisons, allFaqs, aboutData] = await Promise.all([
      Portfolio.find({}, 'title category location coverImage images order').sort({ order: 1 }).limit(40),
      Resource.find({}, 'title category tags isVip isHot fileType fileSize description instructions').limit(40),
      Service.find({}, 'name type image price details').limit(20),
      Comparison.find({}, 'title beforeImage afterImage order').sort({ order: 1 }).limit(10),
      FAQ.find({}, 'question answer').limit(20),
      About.findOne({}, 'name title academyName slogan role skills education instructors description')
    ]);

    // Format grounding context
    const portfolioContext = allPortfolios.map(p => 
      `- [Concept Bộ ảnh / Portfolio] "${p.title}" | Thể loại: ${p.category} | Địa điểm: ${p.location || 'Studio'} | Ảnh bìa: ${p.coverImage || ''} | ID: ${p._id}`
    ).join('\n');

    const resourceContext = allResources.map(r => 
      `- [Tài nguyên học liệu] "${r.title}" | Thể loại: ${r.category} | Tags: ${(r.tags || []).join(', ')} | Đuôi: ${r.fileType} | VIP: ${r.isVip ? 'Có' : 'Không'} | Mô tả: ${r.description || ''} | Hướng dẫn sử dụng: ${r.instructions ? 'Có sẵn trong chi tiết' : 'N/A'} | ID: ${r._id}`
    ).join('\n');

    const serviceContext = allServices.map(s => 
      `- [Khóa học & Dịch vụ] "${s.name}" | Loại: ${s.type} | Giá: ${s.price} | Chi tiết: ${(s.details || []).join('; ')} | Ảnh: ${s.image || ''} | ID: ${s._id}`
    ).join('\n');

    const comparisonContext = allComparisons.map(c => 
      `- [So sánh Trước Sau Retouch] "${c.title}" | Ảnh trước: ${c.beforeImage || ''} | Ảnh sau: ${c.afterImage || ''} | ID: ${c._id}`
    ).join('\n');

    const faqContext = allFaqs.map(f => 
      `- [FAQ Hỏi đáp] Q: ${f.question} -> A: ${f.answer}`
    ).join('\n');

    const aboutContext = aboutData ? `
Học viện: ${aboutData.academyName || 'MVD Photoshop Academy'} | Founder: ${aboutData.name || 'Dương Minh Vương / Mai Văn Đạt'} (${aboutData.role || 'Head Retoucher'})
Slogan: ${aboutData.slogan || ''}
Kỹ năng & Chuyên môn: ${(aboutData.skills || []).join(', ')}
Đội ngũ giảng viên: ${(aboutData.instructors || []).map(i => i.name + ' (' + i.role + ')').join(', ')}
` : '';

    let aiResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        
        const systemPrompt = `Bạn là MVD AI - Trí tuệ nhân tạo chuyên gia độc quyền của Học viện & Studio MVD Photoshop Academy (Sáng lập: Mai Văn Đạt / Dương Minh Vương).
Bạn nắm rõ 100% dữ liệu toàn bộ website: các Concept bộ ảnh nghệ thuật, Kho tài nguyên Photoshop/Lightroom, Kỹ thuật Retouch Before/After, Khóa học & Dịch vụ, và cách hướng dẫn người dùng thực hiện các thao tác trên website.

QUY TẮC BẮT BUỘC:
1. Danh xưng của bạn là MVD AI. Tuyệt đối KHÔNG ĐƯỢC nhắc đến bất kỳ bên thứ ba nào (như Gemini, Google, OpenAI, ChatGPT). Bạn là công nghệ trí tuệ nhân tạo được cấu hình riêng cho MVD.
2. Trả lời câu hỏi người dùng: "${trimmedQuery}".
3. Khả năng tư vấn toàn diện:
   - Nếu hỏi về CONCEPT BỘ ẢNH / TÁC PHẨM (Nàng thơ, Beauty, Couple, Cưới, Ngoài trời, Cổ điển...): Giới thiệu concept phù hợp, phong cách màu sắc, bối cảnh, trích xuất chính xác ID và link ảnh bìa (coverImage) để người dùng xem ngay.
   - Nếu hỏi về TÀI NGUYÊN (Action làm da, Preset màu cưới, Brush mây khói, Font chữ...): Phân tích công dụng, định dạng file, giải thích cách tải và áp dụng.
   - Nếu hỏi về HƯỚNG DẪN SỬ DỤNG WEBSITE (Cách tải tài nguyên, cách xem so sánh before/after, cách đăng ký khóa học, cách liên hệ...): Hãy chỉ dẫn từng bước ngắn gọn (ví dụ: truy cập mục Tài nguyên -> bấm xem chi tiết -> bấm Tải về ngay; hoặc mục Showcase -> chọn tab concept).
   - Nếu hỏi về KHÓA HỌC / DỊCH VỤ / GIẢNG VIÊN: Báo giá thực tế, giới thiệu lộ trình đào tạo và đội ngũ giảng viên MVD Academy.
4. Đối chiếu với kho dữ liệu thực tế của website:
[DANH SÁCH CONCEPT BỘ ẢNH / PORTFOLIO]
${portfolioContext}

[DANH SÁCH TÀI NGUYÊN HỌC LIỆU]
${resourceContext}

[DANH SÁCH KHÓA HỌC & DỊCH VỤ]
${serviceContext}

[SO SÁNH TRƯỚC VÀ SAU RETOUCH]
${comparisonContext}

[THÔNG TIN HỌC VIỆN & GIẢNG VIÊN]
${aboutContext}

[CÂU HỎI THƯỜNG GẶP FAQ]
${faqContext}

5. Trả về định dạng JSON thuần túy KHÔNG bọc markdown (không dùng \`\`\`json hay \`\`\`), theo định dạng:
{
  "answer": "Câu trả lời tư vấn / hướng dẫn chi tiết, chuyên nghiệp, súc tích bằng tiếng Việt, giải thích lý do đề xuất và mẹo áp dụng thực tế...",
  "recommendations": [
    {
      "id": "ID tương ứng từ dữ liệu trên",
      "title": "Tên concept bộ ảnh, tài nguyên, khóa học hoặc hướng dẫn",
      "type": "portfolio" hoặc "resource" hoặc "course" hoặc "comparison" hoặc "guide",
      "category": "Thể loại (VD: Concept nàng thơ, Beauty, Action Photoshop, Khóa học...)",
      "highlight": "Điểm nổi bật hoặc mẹo thực chiến (1 câu ngắn súc tích)",
      "image": "URL hình ảnh coverImage/ảnh minh họa từ dữ liệu trên (nếu có)",
      "actionUrl": "/showcase?id=[ID]&album=[TITLE] (nếu là portfolio) hoặc /resources?search=... hoặc /courses hoặc /contact",
      "fileType": "Đuôi file nếu là resource",
      "isVip": true hoặc false
    }
  ]
}`;

        for (const modelName of models) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(systemPrompt);
            const text = result.response.text();
            if (text) {
              const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanedText);
              if (parsed && parsed.answer) {
                aiResult = parsed;
                break;
              }
            }
          } catch (modelErr) {
            console.warn(`[MVD AI Search] Model ${modelName} error:`, modelErr.message);
          }
        }
      } catch (geminiErr) {
        console.error('[MVD AI Search] Gemini error:', geminiErr.message);
      }
    }

    // ==================== SMART FUZZY SEARCH (Fuse.js Fallback) ====================
    if (!aiResult) {
      // Build unified searchable catalog across the entire website
      const unifiedCatalog = [
        ...allPortfolios.map(p => ({
          id: p._id,
          title: p.title,
          type: 'portfolio',
          category: p.category || 'Concept',
          description: `${p.category} ${p.location || 'Studio'} concept bộ ảnh tác phẩm`,
          image: p.coverImage || (p.images && p.images[0]) || '',
          actionUrl: `/showcase?id=${p._id}&album=${encodeURIComponent(p.title)}`,
          highlight: `Bộ ảnh concept ${p.category} đặc sắc tại ${p.location || 'Studio MVD'}.`,
          fileType: '',
          isVip: false
        })),
        ...allResources.map(r => ({
          id: r._id,
          title: r.title,
          type: 'resource',
          category: r.category,
          description: `${r.description || ''} ${(r.tags || []).join(' ')} ${r.category}`,
          image: '',
          actionUrl: `/resources?search=${encodeURIComponent(r.title)}`,
          highlight: `Tài nguyên ${r.category} chuẩn kỹ thuật phòng lab MVD.`,
          fileType: r.fileType,
          isVip: r.isVip
        })),
        ...allServices.map(s => ({
          id: s._id,
          title: s.name,
          type: 'course',
          category: s.type || 'Khóa học',
          description: `${s.type} ${(s.details || []).join(' ')} ${s.price}`,
          image: s.image || '',
          actionUrl: '/courses',
          highlight: `Đào tạo thực chiến từ giảng viên MVD Academy (${s.price}).`,
          fileType: '',
          isVip: false
        })),
        ...allComparisons.map(c => ({
          id: c._id,
          title: c.title,
          type: 'comparison',
          category: 'So sánh Before/After',
          description: `So sánh trước sau retouching ${c.title}`,
          image: c.afterImage || c.beforeImage || '',
          actionUrl: '/showcase',
          highlight: 'Kỹ thuật xử lý da & ánh sáng trước và sau hậu kỳ.',
          fileType: '',
          isVip: false
        }))
      ];

      const fuse = new Fuse(unifiedCatalog, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'category', weight: 0.25 },
          { name: 'description', weight: 0.25 }
        ],
        threshold: 0.45,
        includeScore: true
      });

      const matchedResults = fuse.search(trimmedQuery).slice(0, 4).map(res => res.item);

      // Check if query is about website usage guide
      const qLower = trimmedQuery.toLowerCase();
      let guideAnswer = '';
      if (qLower.includes('tải') || qLower.includes('download')) {
        guideAnswer = 'Để tải tài nguyên: Bạn hãy vào mục "Tài nguyên", nhấp vào tài nguyên muốn lấy để xem hướng dẫn sử dụng và bấm "Tải về ngay". Các tài nguyên VIP có thể cần liên hệ nâng cấp tài khoản.';
      } else if (qLower.includes('concept') || qLower.includes('bộ ảnh') || qLower.includes('tác phẩm')) {
        guideAnswer = 'Bạn có thể xem các concept bộ ảnh thực tế tại mục "Showcase", hỗ trợ lọc theo Beauty, Concept nàng thơ, Couple / Gia đình và phóng to từng ảnh chất lượng cao.';
      } else if (qLower.includes('học') || qLower.includes('khóa học') || qLower.includes('giá') || qLower.includes('dịch vụ')) {
        guideAnswer = 'MVD Photoshop Academy cung cấp các khóa học Retouching từ cơ bản đến chuyên nghiệp và dịch vụ hậu kỳ cao cấp. Mời bạn tham khảo chi tiết tại mục "Khóa học" và "Dịch vụ".';
      }

      aiResult = {
        answer: matchedResults.length > 0 
          ? `MVD AI đã rà soát toàn bộ tác phẩm, concept, tài nguyên và dịch vụ trên hệ thống. Dưới đây là ${matchedResults.length} đề xuất chuẩn xác nhất cho "${trimmedQuery}". ${guideAnswer}`
          : (guideAnswer || `MVD AI đã tìm kiếm trên toàn bộ hệ thống nhưng chưa thấy kết quả trùng khớp 100% với "${trimmedQuery}". Bạn có thể duyệt qua mục Tác phẩm (Showcase) hoặc liên hệ đội ngũ MVD để được hỗ trợ trực tiếp.`),
        recommendations: matchedResults
      };
    }

    res.json(aiResult);
  } catch (err) {
    console.error('[MVD AI Search] Fatal error:', err);
    res.status(500).json({ error: 'Lỗi trong quá trình xử lý MVD AI Search: ' + err.message });
  }
});


// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Tự động ping mỗi 14 phút (840000 milliseconds) để tránh ngủ đông
  const PING_INTERVAL = 14 * 60 * 1000;
  // Dùng URL thực tế nếu có (Render tự cấp RENDER_EXTERNAL_URL), nếu không thì dùng localhost
  const serverUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  
  setInterval(async () => {
    try {
      console.log(`[Self-Ping] Pinging ${serverUrl}/api/ping to keep server awake...`);
      const response = await fetch(`${serverUrl}/api/ping`);
      if (response.ok) {
        console.log('[Self-Ping] Success: Server is awake');
      } else {
        console.log(`[Self-Ping] Failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('[Self-Ping] Error:', error.message);
    }
  }, PING_INTERVAL);
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mvd-portfolio')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
