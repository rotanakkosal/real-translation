import { GoogleGenAI } from "@google/genai";

// @ts-ignore: process.env.API_KEY is replaced by Vite at build time
const API_KEY = process.env.API_KEY;

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    // Initialize the client with the injected API_KEY
    aiClient = new GoogleGenAI({ apiKey: API_KEY || '' });
  }
  return aiClient;
};

export interface TranslationParams {
  text: string;
  sourceLang: string;
  targetLang: string;
  isPolite?: boolean; // For Korean and Khmer nuance
}

export interface TranslationResult {
  text: string;
  error?: string;
}

export const translateText = async ({ text, sourceLang, targetLang, isPolite }: TranslationParams): Promise<TranslationResult> => {
  if (!text.trim()) return { text: "" };

  // Check if API key is present
  if (!API_KEY) {
    console.error("API Key is missing. Env var:", API_KEY);
    return { text: "", error: "Configuration Error: API_KEY is missing in Vercel Environment Variables." };
  }

  let nuanceInstruction = "";
  
  if (targetLang === 'Korean') {
    nuanceInstruction = isPolite 
      ? "Use polite/formal Korean (존댓말/honorifics). Ensure the tone is respectful." 
      : "Use casual/informal Korean (반말). Ensure the tone is friendly and conversational.";
  } else if (targetLang === 'Khmer') {
    nuanceInstruction = isPolite 
      ? "Use formal/polite Khmer (ភាសាផ្លូវការ/គួរសម). Use appropriate honorifics (words like ខ្ញុំ, លោក, អ្នក) and polite particles suitable for business or addressing elders. Ensure it sounds natural, not robotic." 
      : "Use natural, spoken Khmer (ភាសានិយាយ). Use casual vocabulary and sentence structures common in daily conversation between friends. Avoid stiff, written-style language.";
  }

  const prompt = `
    Act as a professional translator.
    Translate the following text from ${sourceLang} to ${targetLang}.
    ${nuanceInstruction}
    Ensure the translation is natural, idiomatically correct, and culturally appropriate for the target audience.
    Return ONLY the translated text, no explanations.
    
    Text: "${text}"
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return { text: response.text?.trim() || "" };
  } catch (error: any) {
    console.error("Translation error details:", error);
    
    const errorMessage = (error.message || error.toString()).toLowerCase();

    // Check for specific error conditions: Quota Exceeded (429) or Resource Exhausted
    if (
        errorMessage.includes("429") || 
        errorMessage.includes("quota") || 
        errorMessage.includes("resource_exhausted") ||
        errorMessage.includes("too many requests")
    ) {
        return { text: "", error: "The service is not available." };
    }

    // Generic error fallback
    return { text: "", error: "Translation failed. Please try again." };
  }
};