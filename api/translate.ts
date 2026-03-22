import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res
        .status(400)
        .json({ error: "Text and targetLanguage are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}. Only return the translated text, nothing else.\n\n${text}`,
      config: {
        temperature: 0.3,
      },
    });

    res.json({ translatedText: response.text?.trim() || text });
  } catch (error: any) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Failed to translate text" });
  }
}
