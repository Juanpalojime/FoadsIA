
import { GoogleGenAI } from "@google/genai";
import { AdConfiguration } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateAdImage(config: AdConfiguration, prompt: string): Promise<string | null> {
    try {
      const fullPrompt = `Create a professional advertisement image. 
      Objective: ${config.objective}. 
      Visual Style: ${config.visualStyle}. 
      Mood: ${config.mood}. 
      Context: ${prompt}.
      Aspect Ratio: ${config.aspectRatio}.
      The image should be high quality, suitable for professional marketing.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
          imageConfig: {
            aspectRatio: config.aspectRatio,
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error generating ad image:", error);
      throw error;
    }
  }

  async generateAdCopy(config: AdConfiguration, prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling advertisement headline and subtext for the following: 
        Topic: ${prompt}.
        Objective: ${config.objective}.
        Tone: Professional, engaging.`,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating ad copy:", error);
      return "Unlock Your Potential with Our Solution.";
    }
  }
}

export const geminiService = new GeminiService();
