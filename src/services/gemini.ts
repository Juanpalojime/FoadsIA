
import { GoogleGenAI, Type } from "@google/genai";
import { AdConfig, AdVariation } from "../types";

const getApiKey = () => {
    return localStorage.getItem('GOOGLE_API_KEY') || '';
};

const getAi = () => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const generateAdVariations = async (prompt: string, config: AdConfig): Promise<AdVariation[]> => {
    const ai = getAi();
    if (!ai) throw new Error("Google API Key not configured");

    const model = 'gemini-3-flash-preview';

    const systemInstruction = `You are a world-class advertising creative director. 
  Generate 4 distinct ad variations based on the user's campaign description.
  Tone: ${config.tone}. Target Audience: ${config.audience}. Goal: ${config.goal}.
  
  Each variation should include:
  1. A catchy headline (max 30 chars).
  2. A brief visual description for an AI image generator.
  3. A short body text.
  4. A strong call to action button text.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        description: { type: Type.STRING },
                        cta: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["headline", "description", "cta", "imagePrompt"]
                }
            }
        }
    });

    const variationsData = JSON.parse(response.text.trim());

    // For each variation, generate the image
    const variationsWithImages = await Promise.all(variationsData.map(async (v: any, index: number) => {
        const imageUrl = await generateGeminiImage(v.imagePrompt);
        return {
            ...v,
            id: `var-${index}-${Date.now()}`,
            imageUrl
        };
    }));

    return variationsWithImages;
};

export const generateGeminiImage = async (prompt: string): Promise<string> => {
    const ai = getAi();
    if (!ai) return `https://picsum.photos/800/600?random=${Math.random()}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `High quality creative asset: ${prompt}. Professional studio lighting.` }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return `https://picsum.photos/800/600?random=${Math.random()}`;
    } catch (error) {
        console.error("Image generation failed", error);
        return `https://picsum.photos/800/600?random=${Math.random()}`;
    }
};

export async function describeScene(base64Image: string): Promise<string> {
    const ai = getAi();
    if (!ai) return "Modern creative design";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image.split(',')[1],
                            mimeType: 'image/png'
                        }
                    },
                    { text: "Describe this creative composition in a few keywords for search." }
                ]
            }
        });
        return response.text || "Modern creative design";
    } catch (error) {
        return "Ad Creative";
    }
}
