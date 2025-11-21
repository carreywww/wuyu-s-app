// We use native fetch here to avoid "process is not defined" errors in the browser
// and to support Vercel's proxy feature easily.

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
    // 1. Get API Key safely for Vite/Vercel environment
    // @ts-ignore
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
      throw new Error("Missing API Key. Please add VITE_API_KEY to your Vercel Environment Variables.");
    }

    // 2. Determine the Endpoint URL
    // If we are on localhost, we can hit Google directly (requires VPN).
    // If we are on Vercel (production), we use the proxy path '/api/google' (No VPN needed).
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const baseUrl = isLocal 
      ? "https://generativelanguage.googleapis.com" 
      : "/api/google";

    const url = `${baseUrl}/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    // 3. Construct the payload
    const payload = {
      contents: [
        {
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
      ]
    };

    // 4. Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();

    // 5. Parse the response
    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
             const mime = part.inlineData.mimeType || 'image/png';
             return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    
    console.warn("No image data found in response", data);
    return null;

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
};