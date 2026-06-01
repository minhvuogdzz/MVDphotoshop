import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: []
    });
    const result = await chat.sendMessage("Hello");
    console.log(result.response.text());
  } catch (err) {
    console.error("Error with empty history:", err);
  }
}

test();
