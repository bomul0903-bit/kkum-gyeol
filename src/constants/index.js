export const STATS_THRESHOLD = 7;

export const SUBCONSCIOUS_QUOTES = [
  "꿈은 무의식이라는 거대한 대륙에서 날아온 전갈이다.",
  "무의식은 논리로 말하지 않는다. 오직 꿈이라는 은유와 상징으로 속삭일 뿐이다.",
  "꿈은 현실의 반사가 아니라, 우리가 미처 보지 못한 진실의 투영이다.",
  "우리가 잠들 때, 무의식은 비로소 깨어나 자신만의 연극을 시작한다.",
  "꿈속의 모든 인물은 결국 나 자신의 파편들이다.",
  "이해되지 않는 꿈은 읽지 않은 편지와 같다. – 탈무드",
  "꿈은 마음의 심연을 비추는 거울이며, 그 속에는 가공되지 않은 자아가 있다.",
  "꿈은 낮 동안 억눌렸던 무의식의 감정들이 숨을 쉬러 나오는 구멍이다.",
  "꿈을 기록하는 행위는 무의식의 심해로 낚싯줄을 던지는 것과 같다.",
  "현실에서 해결하지 못한 숙제는 밤마다 무의식의 문을 두드린다."
];

export const ART_STYLES = [
  {
    id: 'watercolor',
    name: '수채화',
    prompt: 'A hand-painted watercolor illustration on cold-press paper, wet-on-wet technique, pigment bleeding naturally into water, soft feathered edges, translucent color layers, visible paper grain, light pastel tones, airy atmosphere, no hard outlines, no digital sharpness',
    negativePrompt: 'no oil paint, no acrylic, no sharp edges, no digital illustration, no anime, no 3D'
  },
  {
    id: 'oil_painting',
    name: '유화',
    prompt: 'Classical oil painting with thick impasto, heavy layered oil paint, visible expressive brushstrokes, rich earthy pigments, strong chiaroscuro lighting, canvas texture clearly visible, museum-quality fine art painting',
    negativePrompt: 'no watercolor, no flat color, no digital smoothness, no anime, no illustration'
  },
  {
    id: 'anime',
    name: '애니메이션',
    prompt: 'High-quality Japanese anime illustration, Makoto Shinkai-inspired background art, clean sharp lineart, vibrant saturated colors, cinematic sunlight and lens flare, ultra-detailed sky and clouds, emotional atmosphere, 2D anime aesthetic',
    negativePrompt: 'no oil painting, no watercolor, no realistic photography, no rough brushstrokes'
  },
  {
    id: 'oriental',
    name: '동양화',
    prompt: 'Traditional East Asian ink wash painting (Sumi-e), monochrome black ink with subtle gray gradations, minimalist composition, strong negative space, rice paper texture, soft brush diffusion, Zen aesthetic, calm and meditative atmosphere',
    negativePrompt: 'no bright colors, no oil paint, no digital shading, no anime'
  },
  {
    id: 'abstract',
    name: '추상화',
    prompt: 'Abstract expressionist painting inspired by Wassily Kandinsky and early Picasso, bold geometric lines mixed with fragmented organic forms, non-representational composition, emotion-driven color contrasts, painterly texture, museum-style modern art',
    negativePrompt: 'no realism, no characters, no anime, no photorealism'
  },
  {
    id: 'cyberpunk',
    name: '사이버펑크',
    prompt: 'Cyberpunk cityscape at night, dense futuristic megacity, neon signs in Japanese and English, wet streets reflecting neon lights, teal and orange color contrast, glitch effects, holograms, high-tech dystopian atmosphere, cinematic sci-fi concept art',
    negativePrompt: 'no medieval, no fantasy, no watercolor, no oil painting'
  },
  {
    id: 'lofi_retro',
    name: '로파이 레트로',
    prompt: 'Lo-fi hip hop illustration, 90s retro anime-inspired scene, muted pastel colors, warm nostalgic lighting, film grain, VHS noise, soft blur, cozy and melancholic mood, low-detail background',
    negativePrompt: 'no ultra HD, no sharp realism, no 3D render'
  },
  {
    id: 'pop_art_3d',
    name: '3D 팝아트',
    prompt: '3D clay-style illustration, claymorphism aesthetic, soft rounded shapes, plasticine texture, glossy surface, vibrant pop art colors, toy-like proportions, studio lighting, clean background',
    negativePrompt: 'no 2D illustration, no watercolor, no oil painting'
  },
  {
    id: 'surrealism',
    name: '초현실주의',
    prompt: 'Surrealist painting in the style of Salvador Dalí, dreamlike atmosphere, impossible physics, floating objects, melting architecture, hyper-detailed yet irrational composition, symbolic imagery, subconscious logic',
    negativePrompt: 'no realism, no anime, no cartoon'
  }
];
