import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_HISTORY_MESSAGES = 10;

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
      const contextRes = await fetch(`${renderApiUrl}/chat-context`);
      if (contextRes.ok) {
        const contextData = await contextRes.json();
        systemInstruction = contextData.systemInstruction;
      } else {
        console.warn("Không thể lấy context từ Render, dùng context mặc định");
        systemInstruction = "Bạn là trợ lý ảo chính thức của MVD Photoshop. Trả lời ngắn gọn, thân thiện.";
      }
    } catch (err) {
      console.error("Lỗi khi fetch context từ Render:", err);
      systemInstruction = "Bạn là trợ lý ảo chính thức của MVD Photoshop. Trả lời ngắn gọn, thân thiện.";
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction });

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

    const chat = model.startChat({
      history: cleanHistory,
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(currentMessage);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return res.status(500).json({ error: 'AI không trả lời được. Vui lòng thử lại.' });
    }

    res.json({ reply: text });
  } catch (error) {
    console.error('Chat error:', error);
    
    let errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('SAFETY')) {
      return res.status(400).json({ error: 'Tin nhắn không phù hợp. Vui lòng thử câu hỏi khác.' });
    }
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ error: 'Hệ thống đang quá tải. Vui lòng thử lại sau vài phút.' });
    }
    if (errorMessage.includes('User location is not supported')) {
      return res.status(500).json({ error: 'Máy chủ đang ở vùng không được hỗ trợ. Vui lòng liên hệ qua Zalo.' });
    }
    
    res.status(500).json({ error: 'Chatbot đang gặp sự cố. Vui lòng thử lại sau.' });
  }
}
