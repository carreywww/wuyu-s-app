// We use native fetch instead of the SDK here to have full control over the Base URL.
// This allows us to use the Vercel Proxy (/api/google) in production.

const getApiKey = (): string => {
  let key = '';
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}
  return key;
};

const getBaseUrl = () => {
  // In development (localhost), connect directly to Google (Requires VPN in restricted regions)
  // @ts-ignore
  if (import.meta.env.DEV) {
    return "https://generativelanguage.googleapis.com";
  }
  // In production (Vercel), use the proxy path defined in vercel.json (No VPN required for client)
  return "/api/google";
};

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
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your Vercel Environment Variables (VITE_API_KEY).");
  }

  const baseUrl = getBaseUrl();
  // Construct the endpoint URL
  const url = `${baseUrl}/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
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
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // If text parsing fails, use the raw text
        if (errorText.length < 200) errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Parse the response structure similar to the SDK
    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    
    console.warn("No image data found in response:", data);
    return null;

  } catch (error) {
    console.error("Gemini API Request Failed:", error);
    throw error;
  }
};