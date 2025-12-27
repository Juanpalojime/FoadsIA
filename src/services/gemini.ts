import { GoogleGenAI, Type } from "@google/genai";
import { AdConfig, AdVariation } from "../types";
import { api } from "./api"; // Use local backend

const getApiKey = () => {
    return localStorage.getItem('GOOGLE_API_KEY') || '';
};

const getAi = () => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

// Mock data for when API key is missing
const MOCK_VARIATIONS = [
    {
        headline: "Domina tu Mercado",
        description: "Estrategias probadas para escalar tu negocio al siguiente nivel. Sin excusas.",
        cta: "Empieza Ahora",
        imagePrompt: "A confident entrepreneur standing on a futuristic skyscraper overlooking a glowing city, professional photography, cinematic lighting, 8k"
    },
    {
        headline: "Innovación sin Límites",
        description: "Tecnología de punta diseñada para los verdaderos visionarios del mañana.",
        cta: "Descubre Más",
        imagePrompt: "Futuristic glowing technological device floating in a clean minimal studio, cybernetic details, blue and neon orange lights, macro shot"
    },
    {
        headline: "Potencia Pura",
        description: "Rendimiento inigualable para quienes no se conforman con menos.",
        cta: "Prueba Gratis",
        imagePrompt: "A high performance sports car engine with energy flowing through it, dynamic angle, motion blur, hyperrealistic"
    },
    {
        headline: "Tu Futuro es Hoy",
        description: "No esperes a que el éxito llegue, constrúyelo con nuestras herramientas.",
        cta: "Únete al Club",
        imagePrompt: "A golden hourglass with digital sand flowing upwards, symbolizing controlling time, magical atmosphere, intricate details"
    }
];

export const generateAdVariations = async (prompt: string, config: AdConfig): Promise<AdVariation[]> => {
    const ai = getAi();
    let variationsData;

    if (!ai) {
        console.warn("Google API Key missing. Using Mock Data + Local Image Gen.");
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));
        variationsData = MOCK_VARIATIONS;
    } else {
        const model = 'gemini-2.0-flash-exp'; // Updated model

        const systemInstruction = `You are a world-class advertising creative director. 
      Generate 4 distinct ad variations based on the user's campaign description.
      Tone: ${config.tone}. Target Audience: ${config.audience}. Goal: ${config.goal}.
      
      Each variation should include:
      1. A catchy headline (max 30 chars).
      2. A brief visual description for an AI image generator (Stable Diffusion style).
      3. A short body text.
      4. A strong call to action button text.`;

        try {
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
            variationsData = JSON.parse((response.text || "[]").trim());
        } catch (e) {
            console.error("Gemini Generation Failed, falling back to mock", e);
            variationsData = MOCK_VARIATIONS;
        }
    }

    // For each variation, generate the image using LOCAL BACKEND (not Gemini)
    const variationsWithImages = await Promise.all(variationsData.map(async (v: any, index: number) => {
        // Use local backend for image generation
        const imageUrl = await generateBackendImage(v.imagePrompt);
        return {
            ...v,
            id: `var-${index}-${Date.now()}`,
            imageUrl
        };
    }));

    return variationsWithImages;
};

// Helper to use our Local Backend (SDXL) instead of Gemini Image
const generateBackendImage = async (prompt: string): Promise<string> => {
    try {
        const res = await api.generateImage(prompt, "16:9", 4); // Fast 4-step generation
        if (res.status === 'success' && res.image) {
            return res.image;
        }
        throw new Error(res.message);
    } catch (e) {
        console.error("Backend Image Gen Failed, using placeholder", e);
        return `https://picsum.photos/800/600?random=${Math.random()}`;
    }
};

// Keep this mainly for legacy or if strictly requested, but prefer Backend
export const generateGeminiImage = generateBackendImage;

export async function describeScene(base64Image: string): Promise<string> {
    const ai = getAi();
    if (!ai) return "Modern creative design";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
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
