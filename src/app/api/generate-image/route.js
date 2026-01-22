import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-ultra-generate-001',
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

    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });

  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
