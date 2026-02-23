
import { GoogleGenAI, Type } from "@google/genai";
import { ArtisticStyle, AppStyle, GenerationConfig, AestheticPlan, MoodProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility for exponential backoff retries
const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.toLowerCase().includes("quota") || 
                         error?.message?.includes("429") ||
                         error?.status === 429;
                         
    if (isQuotaError && retries > 0) {
      console.warn(`Quota exceeded. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const geminiService = {
  async planAesthetic(config: GenerationConfig): Promise<AestheticPlan> {
    const prompt = `Act as an Elite Art Director for high-impact social photography.
      Mood: ${config.mood || 'cinematic moody'}
      Style: ${config.style}
      Subject: ${config.subject || 'Atmospheric solitude'}
      Text: ${config.customQuote || 'Generate a visceral quote'}

      GOAL: Plan typography and layout based on elite reference DNA.
      RULES:
      - layoutType: 
        'hero_stack': Large bold heading, small subtext.
        'minimal_typewriter': Monospaced, documentary feel.
        'boxed_minimal': Text inside a clean semi-transparent pill.
        'neon_reflection': Glowing text reflected on surfaces.
        'bold_headline': Heavy bold sans-serif.
        'window_scribe': Hand-written text style, appears on glass/windows.
      - verticalAlign: Choose 'top', 'center', or 'bottom' to sit in the image's "negative space".
      - Font Library: [Playfair Display, Lora, Courier Prime, Syne, Space Grotesk, Fraunces, Cormorant Garamond, Caveat, UnifrakturMaguntia, Bebas Neue, Montserrat, Cinzel, Italiana, Major Mono Display, Krona One, Old Standard TT, Six Caps, VT323, Libre Caslon Display, Abril Fatface].
      - visualNuance: Describe the specific grain, color grade (e.g., 'raised blacks', 'teal-orange', 'lo-fi matte').
      
      Return ONLY JSON.`;

    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quote: { type: Type.STRING },
              heading: { type: Type.STRING },
              heroFont: { type: Type.STRING },
              supportFont: { type: Type.STRING },
              textColor: { type: Type.STRING },
              textGlowColor: { type: Type.STRING },
              textOpacity: { type: Type.NUMBER },
              letterSpacing: { type: Type.STRING },
              layoutType: { type: Type.STRING },
              visualNuance: { type: Type.STRING },
              verticalAlign: { type: Type.STRING },
              backgroundColor: { type: Type.STRING }
            },
            required: ["quote", "heading", "heroFont", "supportFont", "textColor", "textGlowColor", "textOpacity", "letterSpacing", "layoutType", "visualNuance", "verticalAlign"]
          }
        }
      });
      return JSON.parse(response.text || "{}") as AestheticPlan;
    });
  },

  async generateImage(config: GenerationConfig, plan: AestheticPlan): Promise<string> {
    let atmosphere = "";
    switch (config.mood) {
      case MoodProfile.SOLACE:
        atmosphere = "Foggy mountain solitude, muted teal and grey, desaturated, Kodak Portra 400 texture, raised blacks, low contrast.";
        break;
      case MoodProfile.LUSTRE:
        atmosphere = "Golden hour highway, long shadows, lens flare, warm cinematic glow, Fuji 400H colors, high-end travel photography.";
        break;
      case MoodProfile.INTIMACY:
        atmosphere = "Macro raindrops on organic leaves, bokeh, deep greens, misty atmosphere, emotional quietude, soft lighting.";
        break;
      case MoodProfile.VANGUARD:
        atmosphere = "Minimalist architecture, brutalist lines against vast sky, high contrast black and white or deep monochrome.";
        break;
      case MoodProfile.NOIR:
        atmosphere = "Cyberpunk night rain, neon signs, wet asphalt reflections, deep blue and magenta, cinematic moody lighting.";
        break;
      case MoodProfile.SPIRIT:
        atmosphere = "Airplane wing over clouds at dusk, or train through landscape, transit loneliness, cinematic motion blur, evocative travel.";
        break;
      case MoodProfile.DRIFT:
        atmosphere = "Lo-fi anime aesthetic, hand-painted digital illustration, pensive character, evening city lights, warm cozy bedroom light, nostalgic texture.";
        break;
      default:
        atmosphere = "Cinematic mood, professional color grading, significant negative space.";
    }

    const fullPrompt = `${atmosphere} Subject: ${config.subject || 'Empty landscape'}. Art Style: Professional photography, cinematic grain. Composition: Wide shot with large areas of negative space (empty sky or blur) specifically for text placement. No text in image.`;

    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: {
          imageConfig: { aspectRatio: config.aspectRatio }
        }
      });

      const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (!imgPart) throw new Error("Image generation failed.");
      return `data:image/png;base64,${imgPart.inlineData!.data}`;
    });
  },

  async refineQuote(quote: string): Promise<string> {
    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Refine this into a punchy, profound "impact quote" under 12 words: "${quote}"`,
      });
      return response.text?.trim() || quote;
    });
  }
};
