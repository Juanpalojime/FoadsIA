
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAdCopy = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a world-class marketing copywriter. Create a compelling ad for: ${prompt}. Return a JSON with 'headline', 'description', and 'cta'.`,
    config: {
      responseMimeType: "application/json"
    }
  });
  
  return JSON.parse(response.text || '{}');
};

export const generateAdImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `High-quality, professional studio photography for a commercial advertisement. Subject: ${prompt}. Vibrant lighting, 8k resolution, cinematic composition.` }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
