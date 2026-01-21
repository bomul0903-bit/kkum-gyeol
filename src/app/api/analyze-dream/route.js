import { NextResponse } from 'next/server';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();

      const errorText = await response.text();
      console.error(`API response error (${response.status}):`, errorText);

      if (response.status === 429 || response.status >= 500) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      throw new Error(`API error: ${response.status} - ${errorText}`);
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
};

export async function POST(request) {
  try {
    const { dreamText } = await request.json();

    if (!dreamText) {
      return NextResponse.json({ error: 'dreamText is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemInstruction = `꿈 분석 전문가 '꿈결'.
    1. 분석(제목, 프로이트 해석, 일반 해석), 2. 핵심 상징 키워드 추출(2-5개), 3. 감정 수치 추출(기쁨/불안 지수 0-100).
    연령 지칭 금지. 한국인 묘사(한복 제외). JSON 응답 필수.`;

    const schema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        freudInterpretation: { type: "STRING" },
        generalInterpretation: { type: "STRING" },
        symbols: { type: "ARRAY", items: { type: "STRING" }, minItems: 2, maxItems: 5 },
        joyLevel: { type: "NUMBER" },
        anxietyLevel: { type: "NUMBER" },
        scenes: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              desc: { type: "STRING" },
              imagePrompt: { type: "STRING" }
            },
            required: ["title", "desc", "imagePrompt"]
          },
          minItems: 1,
          maxItems: 1
        }
      },
      required: ["title", "freudInterpretation", "generalInterpretation", "symbols", "scenes", "joyLevel", "anxietyLevel"]
    };

    const data = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: dreamText }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        })
      }
    );

    const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Analyze dream error:', error);
    return NextResponse.json({ error: 'Failed to analyze dream' }, { status: 500 });
  }
}
