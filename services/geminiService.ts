import { GoogleGenAI, Part } from "@google/genai";

// Helper to safely get the API key in a browser/Vite environment
const getApiKey = (): string => {
  let key = '';

  // 1. Try Vite environment variable (standard for Vercel + Vite)
  // Using import.meta.env is the standard way in Vite
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not available
  }

  // 2. Fallback for process.env (if strictly needed, but risky in pure browser builds)
  if (!key) {
    try {
      // Check if process is defined before accessing it to avoid ReferenceError
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        key = process.env.API_KEY;
      }
    } catch (e) {
      // Ignore error if process is undefined
    }
  }

  return key;
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn("ProductCleanse AI: No API Key found. Please set VITE_API_KEY in your environment variables.");
}

// Initialize the Gemini API client
const ai = new GoogleGenAI({ 
  apiKey: apiKey || 'DUMMY_KEY_TO_PREVENT_CRASH', // Prevent crash on init if key is missing, request will fail later gracefully
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
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure VITE_API_KEY in Vercel settings.");
  }

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