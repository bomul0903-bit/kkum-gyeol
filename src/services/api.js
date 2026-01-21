'use client';

// 꿈 분석 API 호출
export const analyzeDream = async (dreamText) => {
  const response = await fetch('/api/analyze-dream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dreamText })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Analyze API error:', errorData);
    throw new Error(errorData.error || 'Failed to analyze dream');
  }

  return response.json();
};

// 이미지 생성 API 호출
export const generateImage = async (prompt) => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  return data.imageUrl;
};
