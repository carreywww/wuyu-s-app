import { GoogleGenAI, Part } from "@google/genai";

// Initialize the Gemini API client
// The API key is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      // Config for image editing optimization if needed, but defaults are often sufficient.
      // We rely on the prompt to drive the edit.
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