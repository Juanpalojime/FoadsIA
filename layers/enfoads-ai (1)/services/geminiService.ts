
import { GoogleGenAI, Type } from "@google/genai";
import { AdCopyResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAdCopy = async (product: string, target: string, platform: string): Promise<AdCopyResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a persuasive ad copy for ${platform}. 
      Product/Service: ${product}
      Target Audience: ${target}
      Provide the result in JSON format with fields: headline, primaryText, cta.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          primaryText: { type: Type.STRING },
          cta: { type: Type.STRING }
        },
        required: ["headline", "primaryText", "cta"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as AdCopyResult;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Create a professional high-quality marketing visual for an ad. Style: Modern, clean, professional. Subject: ${prompt}` }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};
