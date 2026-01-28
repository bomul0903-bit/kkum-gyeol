import { NextResponse } from 'next/server';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (url, options, retries = 5) => {
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
    1. 분석(제목, 프로이트 해석, 일반 해석).
    2. 핵심 상징 키워드 추출: 꿈의 내용에서 가장 중요한 명사형 상징 2-5개를 추출하세요. 상징은 정규화하여 추출하세요 (예: '바다'와 '넓은 바다'는 모두 '바다'로 추출).
    3. 5가지 정서 수치 측정: joy(기쁨), peace(평온), sadness(슬픔), vitality(활력), anxiety(불안)를 각 0-100 사이 숫자로 측정하세요.
    [이미지 가이드]: 사용자가 '한복'을 명시하지 않는 한 절대로 한복을 그리지 마세요. 한국인 인물은 현대 패션으로 묘사하세요. JSON 응답 필수.`;

    const schema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        freudInterpretation: { type: "STRING" },
        generalInterpretation: { type: "STRING" },
        symbols: { type: "ARRAY", items: { type: "STRING" }, minItems: 2, maxItems: 5 },
        emotions: {
          type: "OBJECT",
          properties: {
            joy: { type: "NUMBER" },
            peace: { type: "NUMBER" },
            sadness: { type: "NUMBER" },
            vitality: { type: "NUMBER" },
            anxiety: { type: "NUMBER" }
          },
          required: ["joy", "peace", "sadness", "vitality", "anxiety"]
        },
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
      required: ["title", "freudInterpretation", "generalInterpretation", "symbols", "scenes", "emotions"]
    };

    const data = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
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
