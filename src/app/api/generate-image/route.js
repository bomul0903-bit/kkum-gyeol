import { NextResponse } from 'next/server';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (url, options, retries = 5) => {
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
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Imagen API 시도
    try {
      const data = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: { prompt },
            parameters: { sampleCount: 1 }
          })
        }
      );

      if (data.predictions?.[0]?.bytesBase64Encoded) {
        return NextResponse.json({
          imageUrl: `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
        });
      }
    } catch (err) {
      console.warn("Imagen fallback to Gemini...");
    }

    // Gemini 이미지 생성 폴백
    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Depict this dream: ${prompt}. High art.` }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
          })
        }
      );

      const b64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (b64) {
        return NextResponse.json({
          imageUrl: `data:image/png;base64,${b64}`
        });
      }
    } catch (e) {
      console.error("Image generation failed:", e);
    }

    return NextResponse.json({ imageUrl: "error" });

  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
