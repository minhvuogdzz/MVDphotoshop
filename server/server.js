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
        
        // Notify admin for LAN visits
        sendEmail(
          `[MVD Portfolio] Có truy cập nội bộ (LAN) từ ${ip}`,
          `
            <h2>Hệ thống ghi nhận lượt truy cập nội bộ:</h2>
            <ul>
              <li><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</li>
              <li><strong>IP:</strong> ${ip}</li>
              <li><strong>Vị trí:</strong> ${city}</li>
            </ul>
            <p>Admin truy cập trực tiếp bằng Mạng nội bộ để test web.</p>
          `
        );
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

      // Asynchronous IP lookup to prevent connection hang
      if (ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
        fetch(`http://ip-api.com/json/${ip}`)
          .then(res => res.json())
          .then(async data => {
            let locCity = 'Unknown';
            let locCountry = 'Unknown';
            let locLat = 21.0285;
            let locLon = 105.8542;

            if (data.status === 'success') {
              locCity = data.city;
              locCountry = data.country;
              locLat = data.lat;
              locLon = data.lon;

              await Visitor.findByIdAndUpdate(dbVisitorId, {
                city: data.city,
                country: data.country,
                lat: data.lat,
                lon: data.lon
              });
              const updatedList = await Visitor.find().sort({ joinTime: -1 }).limit(100);
              io.emit('visitor-updated', updatedList);
            }

            // Always notify admin, whether IP lookup succeeded or not
            sendEmail(
              `[MVD Portfolio] Có khách đang truy cập từ ${locCity !== 'Unknown' ? locCity : ip}`,
              `
                <h2>Có khách hàng mới vừa truy cập trang Portfolio:</h2>
                <ul>
                  <li><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</li>
                  <li><strong>IP:</strong> ${ip}</li>
                  <li><strong>Vị trí:</strong> ${locCity}, ${locCountry}</li>
                  <li><strong>Tọa độ:</strong> ${locLat}, ${locLon}</li>
                </ul>
                <p>Hãy vào trang Quản trị để theo dõi vị trí trực tiếp trên Bản đồ.</p>
              `
            );
          })
          .catch(err => {
            console.warn(`ip-api async lookup failed for ${ip}:`, err.message);
            // Send fallback email if fetch itself crashes
            sendEmail(
              `[MVD Portfolio] Có khách đang truy cập từ ${ip}`,
              `
                <h2>Có khách hàng mới vừa truy cập trang Portfolio:</h2>
                <ul>
                  <li><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</li>
                  <li><strong>IP:</strong> ${ip}</li>
                  <li><strong>Vị trí:</strong> Unknown (Lỗi truy xuất IP)</li>
                </ul>
                <p>Hãy vào trang Quản trị để theo dõi vị trí trực tiếp trên Bản đồ.</p>
              `
            );
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

const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only mp3 files are allowed!'), false);
    }
  }
});

const streamUploadAudioToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: "mvd-portfolio", resource_type: "video" }, // Cloudinary uses "video" for audio files
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

app.post('/api/upload-audio', requireAuth, uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const result = await streamUploadAudioToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload Audio Error:', err);
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
