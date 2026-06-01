import { GoogleGenerativeAI } from '@google/generative-ai';
import Service from '../models/Service.js';
import FAQ from '../models/FAQ.js';
import About from '../models/About.js';

const BASE_PROMPT = `
Bạn là trợ lý ảo chính thức của MVD Photoshop - một dịch vụ chuyên nghiệp về Photoshop, Blending và Retouch ảnh (ảnh chân dung, ảnh cưới, nàng thơ, phục hồi ảnh cũ) do chuyên gia với hơn 5 năm kinh nghiệm thực hiện.
`;

export const handleChat = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('Lỗi: Chưa cấu hình GEMINI_API_KEY');
      return res.status(500).json({ error: 'Tính năng Chatbot đang bảo trì. Vui lòng liên hệ qua Zalo hoặc Messenger.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Định dạng tin nhắn không hợp lệ' });
    }

    // Lấy dữ liệu thực tế từ Database
    const services = await Service.find();
    const faqs = await FAQ.find();
    const aboutData = await About.findOne();

    // Tạo cấu trúc danh sách dịch vụ và giá
    let servicesText = "Thông tin bảng giá và dịch vụ hiện tại:\n";
    if (services.length > 0) {
      services.forEach(s => {
        servicesText += `- ${s.name} (${s.type}): ${s.price}. Chi tiết: ${s.details ? s.details.join(', ') : ''}\n`;
      });
    } else {
      servicesText += "- Hiện chưa có thông tin dịch vụ trên hệ thống.\n";
    }

    // Tạo cấu trúc danh sách FAQ
    let faqsText = "\nCâu hỏi thường gặp (FAQ):\n";
    if (faqs.length > 0) {
      faqs.forEach(f => {
        faqsText += `- Q: ${f.question}\n  A: ${f.answer}\n`;
      });
    }

    // Tạo cấu trúc thông tin CV
    let aboutText = "\nThông tin về chuyên gia Retouching (người thực hiện dịch vụ):\n";
    if (aboutData) {
      aboutText += `- Tên: ${aboutData.name || 'Đang cập nhật'}\n`;
      aboutText += `- Kinh nghiệm/Học vấn: ${aboutData.education || 'Đang cập nhật'}\n`;
      aboutText += `- Kỹ năng: ${aboutData.skills ? aboutData.skills.join(', ') : 'Đang cập nhật'}\n`;
      aboutText += `- Thông tin thêm: ${aboutData.description || ''}\n`;
    }

    const DYNAMIC_SYSTEM_PROMPT = `
${BASE_PROMPT}

[DỮ LIỆU ĐỘNG TỪ WEBSITE]
${servicesText}
${faqsText}
${aboutText}
[KẾT THÚC DỮ LIỆU ĐỘNG]

Phong cách trả lời: 
- Xưng hô là "Em" và "Anh/Chị", hoặc "MVD Photoshop" và "Anh/Chị".
- Thái độ nhiệt tình, thân thiện, chuyên nghiệp, luôn sẵn sàng hỗ trợ.
- Ngắn gọn, súc tích, đi thẳng vào vấn đề. Nếu khách hàng hỏi giá, CHỈ BÁO GIÁ dựa theo thông tin trong phần DỮ LIỆU ĐỘNG TỪ WEBSITE ở trên. Không tự bịa ra mức giá khác.
- Nếu thông tin không có trong danh sách trên, hãy khuyên khách hàng để lại thông tin ở mục Liên hệ (Contact) trên website để được hỗ trợ chi tiết.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: DYNAMIC_SYSTEM_PROMPT });

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
    
    let errorMessage = error.message || error.toString();
    if (errorMessage.includes('User location is not supported')) {
      errorMessage = 'Máy chủ (Server) hiện tại đang đặt ở khu vực không được Google Gemini hỗ trợ (thường là Châu Âu). Vui lòng chuyển server sang vùng US hoặc Singapore.';
    }

    res.status(500).json({ error: 'Lỗi Chatbot: ' + errorMessage });
  }
};
