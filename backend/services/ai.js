import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAtJN3BH4gasQtSH2_X4cE_vAWWOvPfmKk");
console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

// Placeholder transcription
export async function transcribeAudio(filePath) {
  return "[Transcript feature needs Google Speech to Text integration]";
}

export async function summarizeText(text) {
  try {
    console.log("Inside Gemini Summarization");
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Summarize this note in 2-3 sentences:\n\n${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini Summarization Error:", err);
    throw err;
  }
}
