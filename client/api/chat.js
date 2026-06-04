import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_HISTORY_MESSAGES = 10;
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Helper: delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: gọi Gemini API với retry + fallback model
async function callGeminiWithRetry(genAI, systemInstruction, cleanHistory, currentMessage) {
  let lastError = null;

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Chatbot] Trying model: ${modelName}, attempt: ${attempt + 1}`);
        
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
        const chat = model.startChat({
          history: cleanHistory,
          generationConfig: {
            maxOutputTokens: 1024,
          },
        });

        const result = await chat.sendMessage(currentMessage);
        const response = await result.response;
        const text = response.text();

        if (text) {
          console.log(`[Chatbot] Success with model: ${modelName}`);
          return text;
        }
      } catch (err) {
        lastError = err;
        const errMsg = err.message || err.toString();
        console.error(`[Chatbot] Error with ${modelName} (attempt ${attempt + 1}):`, errMsg);

        // Nếu lỗi là API key sai hoặc location không hỗ trợ → không retry
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || 
            errMsg.includes('User location is not supported') || errMsg.includes('PERMISSION_DENIED')) {
          throw err; // Dừng luôn, không retry
        }
        
        // Nếu lỗi SAFETY → không retry, không đổi model
        if (errMsg.includes('SAFETY')) {
          throw err;
        }

        // Nếu lỗi quota/rate-limit → retry với delay hoặc đổi model
        if (errMsg.includes('429') || errMsg.includes('quota') || 
            errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('rate') ||
            errMsg.includes('overloaded') || errMsg.includes('503')) {
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt); // 1s, 2s
            console.log(`[Chatbot] Rate limited, retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
          // Hết retry → thử model tiếp theo
          console.log(`[Chatbot] Model ${modelName} exhausted retries, trying next model...`);
          break;
        }

        // Lỗi khác → retry 1 lần rồi đổi model
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        break;
      }
    }
  }

  // Nếu tất cả đều fail
  throw lastError || new Error('All models failed');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('Lỗi: Chưa cấu hình GEMINI_API_KEY trên Vercel');
      return res.status(500).json({ error: 'Tính năng Chatbot đang bảo trì. Vui lòng liên hệ qua Zalo hoặc Messenger.' });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Định dạng tin nhắn không hợp lệ' });
    }

    // Lấy context từ Render Backend
    let systemInstruction = "";
    try {
      const renderApiUrl = process.env.VITE_API_URL || "https://mvd-portfolio.onrender.com/api";
      const contextRes = await fetch(`${renderApiUrl}/chat-context`, {
        signal: AbortSignal.timeout(5000) // Timeout 5s để không chờ quá lâu
      });
      if (contextRes.ok) {
        const contextData = await contextRes.json();
        systemInstruction = contextData.systemInstruction;
      } else {
        console.warn("Không thể lấy context từ Render, dùng context mặc định");
        systemInstruction = "Bạn là trợ lý ảo chính thức của MVD Photoshop - dịch vụ chuyên nghiệp về Photoshop, Blending và Retouch ảnh. Trả lời ngắn gọn, thân thiện, xưng hô 'Em' và 'Anh/Chị'.";
      }
    } catch (err) {
      console.error("Lỗi khi fetch context từ Render:", err.message);
      systemInstruction = "Bạn là trợ lý ảo chính thức của MVD Photoshop - dịch vụ chuyên nghiệp về Photoshop, Blending và Retouch ảnh. Trả lời ngắn gọn, thân thiện, xưng hô 'Em' và 'Anh/Chị'.";
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Giới hạn history để tránh vượt token limit
    const trimmedMessages = messages.length > MAX_HISTORY_MESSAGES 
      ? messages.slice(-MAX_HISTORY_MESSAGES) 
      : messages;

    // Format history for Gemini API
    let history = trimmedMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Gemini API requires the first message in history to be from 'user'
    while (history.length > 0 && history[0].role !== 'user') {
      history.shift();
    }

    // Đảm bảo lịch sử luân phiên user/model
    const cleanHistory = [];
    let lastRole = null;
    for (const entry of history) {
      if (entry.role !== lastRole) {
        cleanHistory.push(entry);
        lastRole = entry.role;
      }
    }

    const currentMessage = trimmedMessages[trimmedMessages.length - 1].content;

    // Gọi API với retry + fallback
    const text = await callGeminiWithRetry(genAI, systemInstruction, cleanHistory, currentMessage);

    res.json({ reply: text });
  } catch (error) {
    console.error('[Chatbot] Final error:', error.message || error);
    
    let errorMessage = error.message || error.toString();
    
    // API key không hợp lệ
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid') || errorMessage.includes('PERMISSION_DENIED')) {
      return res.status(500).json({ error: 'Chatbot đang bảo trì. Vui lòng liên hệ qua Zalo hoặc Messenger nhé!' });
    }
    
    if (errorMessage.includes('SAFETY')) {
      return res.status(400).json({ error: 'Tin nhắn không phù hợp. Vui lòng thử câu hỏi khác.' });
    }
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || 
        errorMessage.includes('429') || errorMessage.includes('overloaded')) {
      return res.status(429).json({ error: 'Hệ thống đang bận, vui lòng thử lại sau 30 giây nhé!' });
    }
    if (errorMessage.includes('User location is not supported')) {
      return res.status(500).json({ error: 'Máy chủ đang ở vùng không được hỗ trợ. Vui lòng liên hệ qua Zalo.' });
    }
    
    res.status(500).json({ error: 'Chatbot đang gặp sự cố. Vui lòng thử lại sau nhé!' });
  }
}
