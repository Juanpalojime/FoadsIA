
import { GoogleGenAI } from "@google/genai";

/**
 * Handles generating a video using the Gemini Veo model.
 * 
 * @param base64Image The image data in base64 format (no prefix).
 * @param mimeType The image mime type.
 * @param onStatusUpdate Callback for status updates.
 * @returns The generated video URL.
 */
export async function generateAIVideo(
  base64Image: string, 
  mimeType: string, 
  onStatusUpdate: (status: string) => void
): Promise<string | null> {
  try {
    // Fix: Access aistudio via window casting to avoid conflicting global declarations with pre-existing environment types.
    const aistudio = (window as any).aistudio;
    
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        onStatusUpdate('Waiting for API key selection...');
        // Fix: Assume the key selection was successful after triggering openSelectKey and proceed to mitigate race conditions.
        await aistudio.openSelectKey();
      }
    }

    // Fix: Create a new GoogleGenAI instance right before the API call to ensure it uses the most up-to-date API key.
    const aiForGeneration = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    onStatusUpdate('Submitting generation task...');
    
    let operation = await aiForGeneration.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'subtle elegant motion reflecting the lighting and atmosphere of the image, professional fashion videography style',
      image: {
        imageBytes: base64Image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    onStatusUpdate('AI is processing frames...');

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      onStatusUpdate('Refining video textures...');
      try {
        // Fix: Create a new GoogleGenAI instance right before each polling call to ensure it always uses the current API key.
        const aiForPolling = new GoogleGenAI({ apiKey: process.env.API_KEY });
        operation = await aiForPolling.operations.getVideosOperation({ operation: operation });
      } catch (err: any) {
        // Fix: If the request fails with "Requested entity was not found.", prompt the user to select a key again.
        if (err.message?.includes("Requested entity was not found") && aistudio) {
            await aistudio.openSelectKey();
            throw new Error("Session expired or API key missing. Please select your key again.");
        }
        throw err;
      }
    }

    onStatusUpdate('Finalizing video file...');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
      throw new Error("No video URI returned from the operation.");
    }

    // Fix: Fetch the actual video bytes and append the API key as required by the generation process.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error('Error in generateAIVideo:', error);
    throw error;
  }
}
