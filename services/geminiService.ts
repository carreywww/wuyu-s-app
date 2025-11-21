import { GoogleGenAI, Part } from "@google/genai";

// Helper to safely get the API key in a browser/Vite environment
const getApiKey = (): string => {
  // 1. Try Vite environment variable (standard for Vercel + Vite)
  // @ts-ignore: import.meta is standard in Vite but might trigger linter without config
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }

  // 2. Fallback safely for other environments
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error if process is undefined
  }

  return '';
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn("ProductCleanse AI: No API Key found. Please set VITE_API_KEY in your environment variables.");
}

// Initialize the Gemini API client
const ai = new GoogleGenAI({ 
  apiKey: apiKey,
});

const MODEL_NAME = 'gemini-2.5-flash-image';

interface EditImageParams {
  imageBase64: string;
  imageMimeType: string;
  prompt: string;
}

export const editImageWithGemini = async ({
  imageBase64,
  imageMimeType,
  prompt
}: EditImageParams): Promise<string | null> => {
  try {
    // Prepare the parts for the multimodal request
    const parts: Part[] = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        },
      },
      {
        text: prompt,
      },
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
    });

    // Iterate through parts to find the image output
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    
    console.warn("No image data found in response:", response);
    return null;

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
};