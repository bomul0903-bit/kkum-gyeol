import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { IMAGE_MODELS, IMAGEN_MODEL, GEMINI_IMAGE_MODEL } from '@/constants';

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

// Gemini 이미지 생성 (REST API)
async function generateWithGemini(model, prompt, negativePrompt, apiKey) {
  const geminiPrompt = negativePrompt
    ? `${prompt}. (IMPORTANT: Avoid the following styles or elements: ${negativePrompt})`
    : prompt;

  const data = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Create an artistic masterpiece for this dream: ${geminiPrompt}.` }] }],
        generationConfig: { responseModalities: ['IMAGE'] }
      })
    }
  );

  const b64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!b64) throw new Error('No image data in response');
  return `data:image/png;base64,${b64}`;
}

// Imagen 이미지 생성 (@google/genai SDK)
async function generateWithImagen(model, prompt, apiKey) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateImages({
    model,
    prompt,
    config: { numberOfImages: 1 },
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) throw new Error('No image data in response');
  return `data:image/png;base64,${imageBytes}`;
}

export async function POST(request) {
  try {
    const { prompt, negativePrompt, imageModel } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const modelConfig = IMAGE_MODELS.find(m => m.model === imageModel);
    const isGeminiType = modelConfig?.type === 'gemini';

    if (isGeminiType) {
      // Gemini 이미지 모델 → 실패 시 Imagen 폴백
      try {
        const imageUrl = await generateWithGemini(imageModel, prompt, negativePrompt, apiKey);
        return NextResponse.json({ imageUrl });
      } catch (e) {
        console.warn(`Gemini image model (${imageModel}) failed, falling back to Imagen:`, e.message);
      }

      try {
        const imageUrl = await generateWithImagen(IMAGEN_MODEL, prompt, apiKey);
        return NextResponse.json({ imageUrl, fallback: true });
      } catch (e) {
        console.error('Imagen fallback also failed:', e.message);
      }

      return NextResponse.json({ error: '이미지 생성 모델을 사용할 수 없습니다' }, { status: 500 });
    }

    // Imagen 모델 (기본) → 실패 시 Gemini 폴백
    try {
      const imageUrl = await generateWithImagen(imageModel || IMAGEN_MODEL, prompt, apiKey);
      return NextResponse.json({ imageUrl });
    } catch (err) {
      console.warn(`Imagen (${imageModel}) failed, falling back to Gemini:`, err.message);
    }

    try {
      const imageUrl = await generateWithGemini(GEMINI_IMAGE_MODEL, prompt, negativePrompt, apiKey);
      return NextResponse.json({ imageUrl, fallback: true });
    } catch (e) {
      console.error('Gemini fallback also failed:', e.message);
    }

    return NextResponse.json({ error: '이미지 생성 모델을 사용할 수 없습니다' }, { status: 500 });

  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
