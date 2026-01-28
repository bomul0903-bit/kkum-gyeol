import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      if (response.status === 429 || response.status >= 500) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      throw new Error(`API error: ${response.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
};

export async function POST(request) {
  try {
    const { prompt, negativePrompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // 1. Imagen 4.0 (Primary) - @google/genai SDK (원본 방식)
    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
          numberOfImages: 1,
        },
      });

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;

      if (imageBytes) {
        return NextResponse.json({
          imageUrl: `data:image/png;base64,${imageBytes}`
        });
      }
    } catch (err) {
      console.warn("Imagen fallback...", err);
    }

    // 2. Gemini Flash Image (Fallback)
    try {
      const fallbackPrompt = negativePrompt
        ? `${prompt}. (IMPORTANT: Avoid the following styles or elements: ${negativePrompt})`
        : prompt;

      const data = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Create an artistic masterpiece for this dream: ${fallbackPrompt}.` }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
          })
        }
      );

      const b64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (b64) {
        return NextResponse.json({
          imageUrl: `data:image/png;base64,${b64}`
        });
      }
    } catch (e) {
      console.error("Image generation failed.", e);
    }

    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });

  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
