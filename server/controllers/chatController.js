import { GoogleGenerativeAI } from '@google/generative-ai';
import Service from '../models/Service.js';
import FAQ from '../models/FAQ.js';
import About from '../models/About.js';

const BASE_PROMPT = `
Bạn là trợ lý ảo chính thức của MVD Photoshop - một dịch vụ chuyên nghiệp về Photoshop, Blending và Retouch ảnh (ảnh chân dung, ảnh cưới, nàng thơ, phục hồi ảnh cũ) do chuyên gia với hơn 5 năm kinh nghiệm thực hiện.
`;

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
          throw err;
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
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`[Chatbot] Rate limited, retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
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

  throw lastError || new Error('All models failed');
}

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

[QUY TẮC NHẬN DIỆN GIỚI TÍNH VÀ XƯNG HÔ]
Hãy phân tích tin nhắn của khách hàng để nhận diện giới tính dựa trên các keyword sau:
- Nữ: nếu khách dùng các từ như "chị", "em gái", "mình là nữ", "con gái", "chị ơi", "nàng", hoặc xưng "em" kết hợp ngữ cảnh nữ tính.
- Nam: nếu khách dùng các từ như "anh", "em trai", "mình là nam", "con trai", "anh ơi", hoặc xưng "em" kết hợp ngữ cảnh nam tính.

Cách xưng hô:
- Nếu nhận diện được khách là NỮ: xưng "em" và gọi khách là "chị iu", "chị yêu", "chị gái" một cách thân thiện, dễ thương. Ví dụ: "Dạ chị iu ơi, em gửi chị bảng giá nha 💕"
- Nếu nhận diện được khách là NAM: xưng "em" và gọi khách là "anh" một cách lịch sự, chuyên nghiệp. Ví dụ: "Dạ anh ơi, em gửi anh bảng giá nha!"
- Nếu CHƯA nhận diện được giới tính: xưng "mình" và gọi khách là "bạn" một cách thân thiện. Ví dụ: "Chào bạn! Mình có thể giúp gì cho bạn nè?"
- Khi đã nhận diện được giới tính, GIỮ NGUYÊN cách xưng hô đó trong suốt cuộc hội thoại.
[KẾT THÚC QUY TẮC XƯNG HÔ]

Phong cách trả lời: 
- Thái độ nhiệt tình, thân thiện, vui vẻ, dễ thương, chuyên nghiệp, luôn sẵn sàng hỗ trợ.
- Thỉnh thoảng dùng emoji phù hợp để tạo cảm giác gần gũi (nhưng không quá lạm dụng).
- Ngắn gọn, súc tích, đi thẳng vào vấn đề. Nếu khách hàng hỏi giá, CHỈ BÁO GIÁ dựa theo thông tin trong phần DỮ LIỆU ĐỘNG TỪ WEBSITE ở trên. Không tự bịa ra mức giá khác.
- Nếu thông tin không có trong danh sách trên, hãy khuyên khách hàng để lại thông tin ở mục Liên hệ (Contact) trên website để được hỗ trợ chi tiết.
`;

    // Giới hạn history tối đa 10 messages gần nhất để tránh vượt token limit
    const MAX_HISTORY = 10;
    const trimmedMessages = messages.length > MAX_HISTORY ? messages.slice(-MAX_HISTORY) : messages;

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
    const text = await callGeminiWithRetry(genAI, DYNAMIC_SYSTEM_PROMPT, cleanHistory, currentMessage);

    res.json({ reply: text });
  } catch (error) {
    console.error('[Chatbot] Final error:', error.message || error);
    
    let errorMessage = error.message || error.toString();
    
    // API key không hợp lệ
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid') || errorMessage.includes('PERMISSION_DENIED')) {
      return res.status(500).json({ error: 'Chatbot đang bảo trì. Vui lòng liên hệ qua Zalo hoặc Messenger nhé!' });
    }
    if (errorMessage.includes('User location is not supported')) {
      return res.status(500).json({ error: 'Máy chủ đang ở vùng không được hỗ trợ. Vui lòng liên hệ qua Zalo.' });
    }
    if (errorMessage.includes('SAFETY')) {
      return res.status(400).json({ error: 'Tin nhắn không phù hợp. Vui lòng thử câu hỏi khác.' });
    }
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || 
        errorMessage.includes('429') || errorMessage.includes('overloaded')) {
      return res.status(429).json({ error: 'Hệ thống đang bận, vui lòng thử lại sau 30 giây nhé!' });
    }

    res.status(500).json({ error: 'Chatbot đang gặp sự cố. Vui lòng thử lại sau nhé!' });
  }
};

export const getChatContext = async (req, res) => {
  try {
    const services = await Service.find();
    const faqs = await FAQ.find();
    const aboutData = await About.findOne();

    let servicesText = "Thông tin bảng giá và dịch vụ hiện tại:\n";
    if (services.length > 0) {
      services.forEach(s => {
        servicesText += `- ${s.name} (${s.type}): ${s.price}. Chi tiết: ${s.details ? s.details.join(', ') : ''}\n`;
      });
    } else {
      servicesText += "- Hiện chưa có thông tin dịch vụ trên hệ thống.\n";
    }

    let faqsText = "\nCâu hỏi thường gặp (FAQ):\n";
    if (faqs.length > 0) {
      faqs.forEach(f => {
        faqsText += `- Q: ${f.question}\n  A: ${f.answer}\n`;
      });
    }

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

[QUY TẮC NHẬN DIỆN GIỚI TÍNH VÀ XƯNG HÔ]
Hãy phân tích tin nhắn của khách hàng để nhận diện giới tính dựa trên các keyword sau:
- Nữ: nếu khách dùng các từ như "chị", "em gái", "mình là nữ", "con gái", "chị ơi", "nàng", hoặc xưng "em" kết hợp ngữ cảnh nữ tính.
- Nam: nếu khách dùng các từ như "anh", "em trai", "mình là nam", "con trai", "anh ơi", hoặc xưng "em" kết hợp ngữ cảnh nam tính.

Cách xưng hô:
- Nếu nhận diện được khách là NỮ: xưng "em" và gọi khách là "chị iu", "chị yêu", "chị gái" một cách thân thiện, dễ thương. Ví dụ: "Dạ chị iu ơi, em gửi chị bảng giá nha 💕"
- Nếu nhận diện được khách là NAM: xưng "em" và gọi khách là "anh" một cách lịch sự, chuyên nghiệp. Ví dụ: "Dạ anh ơi, em gửi anh bảng giá nha!"
- Nếu CHƯA nhận diện được giới tính: xưng "mình" và gọi khách là "bạn" một cách thân thiện. Ví dụ: "Chào bạn! Mình có thể giúp gì cho bạn nè?"
- Khi đã nhận diện được giới tính, GIỮ NGUYÊN cách xưng hô đó trong suốt cuộc hội thoại.
[KẾT THÚC QUY TẮC XƯNG HÔ]

Phong cách trả lời: 
- Thái độ nhiệt tình, thân thiện, vui vẻ, dễ thương, chuyên nghiệp, luôn sẵn sàng hỗ trợ.
- Thỉnh thoảng dùng emoji phù hợp để tạo cảm giác gần gũi (nhưng không quá lạm dụng).
- Ngắn gọn, súc tích, đi thẳng vào vấn đề. Nếu khách hàng hỏi giá, CHỈ BÁO GIÁ dựa theo thông tin trong phần DỮ LIỆU ĐỘNG TỪ WEBSITE ở trên. Không tự bịa ra mức giá khác.
- Nếu thông tin không có trong danh sách trên, hãy khuyên khách hàng để lại thông tin ở mục Liên hệ (Contact) trên website để được hỗ trợ chi tiết.
`;
    res.json({ systemInstruction: DYNAMIC_SYSTEM_PROMPT });
  } catch (error) {
    console.error('Lỗi khi lấy context chatbot:', error);
    res.status(500).json({ error: 'Không thể lấy dữ liệu Chatbot' });
  }
};
