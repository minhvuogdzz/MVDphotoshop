import { GoogleGenerativeAI } from '@google/generative-ai';

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
        systemInstruction = "Bạn là trợ lý ảo chính thức của MVD Photoshop.";
      }
    } catch (err) {
      console.error("Lỗi khi fetch context từ Render:", err);
      systemInstruction = "Bạn là trợ lý ảo chính thức của MVD Photoshop.";
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });

    // Format history for Gemini API
    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Gemini API requires the first message in history to be from 'user'
    while (history.length > 0 && history[0].role !== 'user') {
      history.shift();
    }

    const currentMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(currentMessage);
    const response = await result.response;

    res.json({ reply: response.text() });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Lỗi Chatbot Vercel: ' + (error.message || error.toString()) });
  }
}
