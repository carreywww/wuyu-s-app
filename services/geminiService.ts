import { GoogleGenAI } from "@google/genai";

// Access API key safely from process.env as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
             const mime = part.inlineData.mimeType || 'image/png';
             return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    
    console.warn("No image data found in response");
    return null;

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
};