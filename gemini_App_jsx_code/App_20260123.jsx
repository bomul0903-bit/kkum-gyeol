import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  serverTimestamp,
  updateDoc,
  getDocs,
  query
} from 'firebase/firestore';
import { 
  Sparkles, 
  Moon, 
  Mic, 
  MicOff, 
  Send, 
  Trash2, 
  User, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Image as ImageIcon,
  BookOpen,
  Loader2,
  Clock, 
  AlertCircle,
  Volume2,
  Compass,
  MessageCircle,
  Palette, 
  Square,
  ShieldCheck,
  Wand2,
  Stars,
  Lock,
  Crown,
  Layout,
  Waves,
  Info,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Lightbulb,
  BarChart3,
  PieChart,
  Share2,
  Copy,
  BrainCircuit,
  ScrollText,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Home,
  TrendingUp,
  Activity,
  Eye,
  Layers,
  Sparkle,
  Hash,
  MessageSquareQuote,
  Calendar
} from 'lucide-react';

// --- Firebase & API 초기화 ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'kkum-gyeol-app';
const apiKey = ""; 

const STATS_THRESHOLD = 7;

const SUBCONSCIOUS_QUOTES = [
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

// --- 브랜드 로고 컴포넌트 ---
const KkumGyeolLogo = ({ className = "w-full", color = "#A855F7", secondary = "#6366F1", accent = "#FBBF24" }) => (
  <svg viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor={secondary} />
      </linearGradient>
    </defs>
    <path d="M20 15L22 21L28 23L22 25L20 31L18 25L12 23L18 21L20 15Z" fill={accent} />
    <g transform="translate(10, 40)">
      <path d="M0 0H35V45" stroke="url(#logoGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 0H80V45" stroke="url(#logoGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(105, 40)">
      <path d="M0 0H45V45" stroke="url(#logoGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <circle cx="150" cy="40" r="3" fill={secondary} className="opacity-60" />
    <path d="M10 105C30 100 50 110 80 105C110 100 130 110 150 105" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" className="opacity-20" />
  </svg>
);

const ART_STYLES = [
  { id: 'watercolor', name: '수채화', prompt: 'watercolor painting, wet-on-wet, bleeding ink, soft edges, paper texture, delicate washes' },
  { id: 'oil_painting', name: '유화', prompt: 'oil painting, thick impasto, visible brushstrokes, rich texture, heavy paint, classical lighting' },
  { id: 'anime', name: '애니메이션', prompt: 'high-quality anime style, Makoto Shinkai aesthetic, vibrant colors, cinematic lighting, sharp outlines' },
  { id: 'oriental', name: '동양화', prompt: 'traditional ink wash painting, Sumi-e style, Zen, negative space, elegant brushwork, rice paper texture' },
  { id: 'abstract', name: '추상화', prompt: 'abstract expressionism, in the style of Wassily Kandinsky and Pablo Picasso, fluid organic shapes, emotional color palette, non-representational, layered textures' },
  { id: 'cyberpunk', name: '사이버펑크', prompt: 'cyberpunk aesthetic, neon glow, futuristic city, night rain, teal and orange, glitch effects' },
  { id: 'lofi_retro', name: '로파이 레트로', prompt: 'Lo-fi hip hop aesthetic, retro 80s/90s, grainy texture, muted nostalgic colors, cozy indoor vibe' },
  { id: 'pop_art_3d', name: '3D 팝아트', prompt: '3D rendering, claymorphism, vibrant pop art colors, glossy finish, stylized characters, playful lighting' },
  { id: 'surrealism', name: '초현실주의', prompt: 'surrealism, dreamlike logic, Salvador Dali style, floating objects, bizarre juxtaposition, impossible physics' }
];

// --- 유틸리티 및 API ---
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (url, options, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      if (response.status === 429 || response.status >= 500) { await sleep(Math.pow(2, i) * 1000); continue; }
      throw new Error(`API error: ${response.status}`);
    } catch (err) { if (i === retries - 1) throw err; await sleep(Math.pow(2, i) * 1000); }
  }
};

const compressImage = (base64Str, maxWidth = 800) => {
  if (!base64Str || base64Str === "error") return "error";
  return new Promise((resolve) => {
    const img = new Image(); img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width; let height = img.height;
      if (width > maxWidth) { height = (maxWidth / width) * height; width = maxWidth; }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve("error");
  });
};

const generateImage = async (promptText) => {
  try {
    const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: { prompt: promptText }, parameters: { sampleCount: 1 } })
    });
    if (data.predictions?.[0]?.bytesBase64Encoded) return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
  } catch (err) { console.warn("Imagen fallback..."); }
  try {
    const result = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Create an artistic masterpiece for this dream: ${promptText}.` }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      })
    });
    const b64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    if (b64) return `data:image/png;base64,${b64}`;
  } catch (e) { console.error("Image failed."); }
  return "error";
};

const callGemini = async (prompt, systemInstruction) => {
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
          properties: { title: { type: "STRING" }, desc: { type: "STRING" }, imagePrompt: { type: "STRING" } },
          required: ["title", "desc", "imagePrompt"]
        },
        minItems: 1, maxItems: 1
      }
    },
    required: ["title", "freudInterpretation", "generalInterpretation", "symbols", "scenes", "emotions"]
  };

  try {
    const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: "application/json", responseSchema: schema }
      })
    });
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) { return null; }
};

// --- 메인 App 컴포넌트 ---
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('onboarding'); 
  const [selectedDreamId, setSelectedDreamId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (err) { console.error("Auth Failed", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), (docSnap) => {
      if (docSnap.exists()) { setProfile(docSnap.data()); setCurrentView('home'); }
      setLoading(false);
    });
    const unsubDreams = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'dreams'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDreams(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => { unsubProfile(); unsubDreams(); };
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#05040a] flex flex-col items-center justify-center text-indigo-200">
      <KkumGyeolLogo className="w-32 h-32 animate-pulse mb-8" />
      <p className="text-xl font-serif italic tracking-[0.3em] animate-pulse text-center">무의식의 문을 여는 중...</p>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'onboarding': return <OnboardingView onComplete={() => setCurrentView('home')} />;
      case 'record': return <RecordDreamView profile={profile} onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'detail': return <DreamDetailView profile={profile} dream={dreams.find(d => d.id === selectedDreamId)} onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'stats': return <StatsView dreams={dreams} onBack={() => setCurrentView('home')} />;
      default: return <HomeView dreams={dreams} profile={profile} onRecord={() => setCurrentView('record')} onStats={() => setCurrentView('stats')} onViewDetail={(id) => { setSelectedDreamId(id); setCurrentView('detail'); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05040a] text-gray-100 font-sans relative pb-safe flex flex-col items-center overflow-x-hidden selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-2%] w-[60%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute bottom-[-5%] right-[-2%] w-[70%] h-[50%] bg-indigo-900/15 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
      </div>
      <div className="w-full max-w-2xl px-4 pt-safe relative z-10 flex flex-col flex-1 min-h-0">
        <div className="flex-1 w-full overflow-y-auto no-scrollbar">{renderView()}</div>
      </div>
      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl z-[100] text-sm animate-in slide-in-from-bottom">{toast}</div>}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        :root { --safe-top: env(safe-area-inset-top); --safe-bottom: env(safe-area-inset-bottom); }
        .font-serif { font-family: 'Playfair Display', serif; }
        .dream-shadow { text-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
        .glass-panel { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.06); }
        .pt-safe { padding-top: max(1rem, var(--safe-top)); }
        .pb-safe { padding-bottom: max(1rem, var(--safe-bottom)); }
        .break-keep { word-break: keep-all; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { -webkit-tap-highlight-color: transparent; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 50% { transform: translate(20px, -30px) scale(1.05); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
}

// --- 온보딩 ---
function OnboardingView({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nickname: '', age: '', gender: '기타', artStyle: 'watercolor' });
  const handleSave = async () => { if (!auth.currentUser) return; await setDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'profile', 'data'), form); onComplete(); };
  const steps = [
    { id: 1, content: (<div className="min-h-[85vh] flex flex-col items-center justify-center space-y-12 py-16 text-center animate-in fade-in zoom-in duration-700"><KkumGyeolLogo className="w-28 h-28" /><div className="space-y-6"><h1 className="text-8xl font-serif font-bold text-white dream-shadow italic tracking-tighter">꿈결</h1><p className="text-xl text-indigo-100/60 font-serif italic leading-relaxed tracking-widest break-keep">어젯밤 당신의 무의식이 보낸<br/>장면을 예술로 기록합니다.</p></div><button onClick={() => setStep(2)} className="w-64 py-5 bg-white text-black font-black rounded-full shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">여정 시작하기 <ChevronRight className="w-5 h-5" /></button></div>) },
    { id: 2, content: (<div className="space-y-8 py-6 w-full animate-in slide-in-from-right"><div className="text-center space-y-2"><h2 className="text-3xl font-serif font-bold text-white dream-shadow">꿈결 가이드</h2><p className="text-indigo-400 font-serif text-[10px] uppercase tracking-widest">How to Explore</p></div><div className="space-y-4">{[{ icon: <Mic className="w-5 h-5" />, title: "목소리로 기록", desc: "잊기 전 음성으로 생생하게 들려주세요." }, { icon: <Palette className="w-5 h-5" />, title: "다양한 화풍", desc: "수채화부터 초현실주의까지 선택 가능합니다." }, { icon: <Wand2 className="w-5 h-5" />, title: "AI 시각화", desc: "무의식을 1개의 상징적인 장면으로 구현합니다." }].map((item, i) => (<div key={i} className="glass-panel p-6 rounded-[2rem] flex items-center gap-6"><div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-300">{item.icon}</div><div className="text-left"><h4 className="font-bold text-white">{item.title}</h4><p className="text-xs text-indigo-300/50">{item.desc}</p></div></div>))}</div><div className="flex gap-4 pt-8"><button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 rounded-full text-white text-sm font-bold">이전</button><button onClick={() => setStep(3)} className="flex-[2] py-4 bg-white text-black font-black rounded-full">알겠어요</button></div></div>) },
    { id: 3, content: (<div className="space-y-8 py-6 w-full animate-in slide-in-from-right"><div className="text-center space-y-2"><h2 className="text-3xl font-serif font-bold text-white dream-shadow">당신을 알려주세요</h2><p className="text-indigo-400 font-serif text-[10px] uppercase tracking-widest">Profile</p></div><div className="glass-panel p-8 rounded-[3rem] space-y-8"><div className="space-y-2 text-left"><label className="text-[10px] font-black text-indigo-400 uppercase">Nickname</label><input type="text" value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} placeholder="닉네임" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" /></div><div className="space-y-2 text-left"><label className="text-[10px] font-black text-indigo-400 uppercase">Age Group</label><select value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full bg-[#151221] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold cursor-pointer"><option value="">선택</option>{['10대', '20대', '30대', '40대', '50대', '60대 이상'].map(a => <option key={a} value={a}>{a}</option>)}</select></div><div className="space-y-2 text-left"><label className="text-[10px] font-black text-indigo-400 uppercase">Gender</label><div className="grid grid-cols-3 gap-3">{['남성', '여성', '기타'].map(g => (<button key={g} onClick={() => setForm({...form, gender: g})} className={`py-4 rounded-xl border text-sm font-black transition-all ${form.gender === g ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-indigo-200'}`}>{g}</button>))}</div></div></div><div className="flex gap-4 pt-8"><button onClick={() => setStep(2)} className="flex-1 py-4 bg-white/5 rounded-full text-white text-sm font-bold">이전</button><button disabled={!form.nickname || !form.age} onClick={() => setStep(4)} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-full disabled:opacity-20">계속하기</button></div></div>) },
    { id: 4, content: (<div className="space-y-8 py-6 w-full animate-in slide-in-from-right"><div className="text-center space-y-2"><h2 className="text-3xl font-serif font-bold text-white dream-shadow">선호 화풍</h2><p className="text-indigo-400 font-serif text-[10px] uppercase tracking-widest">Default Style</p></div><div className="grid grid-cols-2 gap-4">{ART_STYLES.filter(s => !s.premium).map(style => (<button key={style.id} onClick={() => setCurrentStyle(style.id)} className={`p-6 rounded-[2rem] border transition-all text-sm font-black font-serif ${form.artStyle === style.id ? 'bg-white text-black border-white shadow-xl scale-105' : 'glass-panel border-white/10 text-indigo-200'}`}>{style.name}</button>))}</div><div className="flex gap-4 pt-8"><button onClick={() => setStep(3)} className="flex-1 py-4 bg-white/5 rounded-full text-white text-sm font-bold">이전</button><button onClick={handleSave} className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-full shadow-xl">꿈결 시작하기</button></div></div>) }
  ];
  return <div className="w-full flex flex-col items-center justify-center">{steps.find(s => s.id === step).content}</div>;
}

// --- 홈 화면 ---
function HomeView({ dreams, profile, onRecord, onStats, onViewDetail }) {
  const [previews, setPreviews] = useState({});
  useEffect(() => {
    if (dreams.length === 0) return;
    const fetchPreviews = async () => {
      const newPreviews = { ...previews };
      for (const dream of dreams) {
        if (!newPreviews[dream.id]) {
          const snap = await getDocs(collection(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'dreams', dream.id, 'scenes'));
          if (!snap.empty) newPreviews[dream.id] = snap.docs.find(d => d.data().index === 0)?.data().imageUrl;
        }
      }
      setPreviews(newPreviews);
    };
    fetchPreviews();
  }, [dreams]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 w-full py-6">
      <header className="flex justify-between items-end pb-6 border-b border-white/5">
        <div className="flex items-center gap-4"><KkumGyeolLogo className="w-12 h-12" /><div className="space-y-0.5"><p className="text-purple-400 font-serif tracking-[0.4em] uppercase text-[7px]">Beta 2.0</p><h1 className="text-4xl font-serif font-bold text-white dream-shadow italic tracking-tighter">꿈결</h1></div></div>
        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border-white/10"><User className="w-4 h-4 text-indigo-400" /><span className="text-xs font-black">{profile?.nickname}</span></div>
      </header>
      <section className="grid grid-cols-2 gap-4">
        <button onClick={onRecord} className="col-span-2 h-40 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 border border-white/10 flex flex-col items-center justify-center gap-4 active:scale-95 transition-all shadow-xl"><Plus className="w-8 h-8 text-white" /><span className="text-xl font-serif text-white font-black tracking-widest">새로운 꿈 조각</span></button>
        <div onClick={onStats} className="glass-panel rounded-[2.5rem] p-6 flex flex-col items-center justify-center border-white/5 active:scale-95 transition-all cursor-pointer"><BarChart3 className="w-8 h-8 text-indigo-400 mb-2" /><p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">리포트</p></div>
        <div className="glass-panel rounded-[2.5rem] p-6 flex flex-col items-center justify-center border-white/5"><p className="text-4xl font-black text-white dream-shadow">{dreams.length}</p><p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">저장됨</p></div>
      </section>
      <section className="space-y-8 pb-10">
        <div className="flex items-center gap-4"><h2 className="text-2xl font-serif text-white italic border-l-2 border-purple-500 pl-4">기록부</h2><div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div></div>
        {dreams.length === 0 ? (<div className="text-center py-20 glass-panel rounded-[3rem] border-dashed border-white/10 text-indigo-400/40 font-serif font-bold uppercase">기록된 꿈이 없습니다</div>) : (
          <div className="grid grid-cols-1 gap-6">{dreams.map((dream) => (<div key={dream.id} onClick={() => onViewDetail(dream.id)} className="group active:scale-[0.98] transition-all rounded-[2.5rem] overflow-hidden glass-panel border-white/5 shadow-xl cursor-pointer"><div className="aspect-[16/9] relative bg-[#0d0b1f]">{previews[dream.id] ? (<img src={previews[dream.id]} alt="Preview" className="w-full h-full object-cover opacity-60" />) : (<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/10" /></div>)}<div className="absolute inset-0 bg-gradient-to-t from-[#05040a] to-transparent opacity-80"></div><div className="absolute bottom-6 left-8 right-8"><p className="text-[8px] text-purple-400 font-bold uppercase mb-1">{new Date(dream.createdAt?.seconds * 1000).toLocaleDateString()}</p><h3 className="font-serif text-white dream-shadow line-clamp-2 italic font-bold text-xl">{dream.title || "무제"}</h3></div></div></div>))}</div>
        )}
      </section>
    </div>
  );
}

// --- 기록 화면 (정확한 상징 추출 프롬프트 강화) ---
function RecordDreamView({ profile, onBack, showToast }) {
  const [input, setInput] = useState('');
  const [currentStyle, setCurrentStyle] = useState(profile?.artStyle || 'watercolor'); 
  const [isRecording, setIsRecording] = useState(false);
  const [phase, setPhase] = useState('input'); 
  const [result, setResult] = useState(null);
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random() * SUBCONSCIOUS_QUOTES.length));
  const recognitionRef = useRef(null);

  useEffect(() => {
    let timer; if (phase === 'analyzing' || phase === 'generating') timer = setInterval(() => setQuoteIdx(prev => (prev + 1) % SUBCONSCIOUS_QUOTES.length), 7000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec(); rec.continuous = true; rec.lang = 'ko-KR';
      rec.onresult = (e) => { let text = ''; for (let i = e.resultIndex; i < e.results.length; ++i) if (e.results[i].isFinal) text += e.results[i][0].transcript; if (text) setInput(prev => (prev ? prev + ' ' : '') + text); };
      rec.onend = () => { if (isRecording) rec.start(); };
      recognitionRef.current = rec;
    }
  }, [isRecording]);

  const toggleRec = () => { if (!recognitionRef.current) { showToast("음성 인식 불가"); return; } if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); } else { recognitionRef.current.start(); setIsRecording(true); } };

  const handleAnalyze = async () => {
    if (!input.trim() || !auth.currentUser) return;
    if (isRecording) toggleRec();
    setPhase('analyzing');
    const styleData = ART_STYLES.find(s => s.id === currentStyle);
    const systemPrompt = `꿈 분석 전문가 '꿈결'. 
    1. 분석(제목, 프로이트 해석, 일반 해석).
    2. 핵심 상징 키워드 추출: 꿈의 내용에서 가장 중요한 명사형 상징 2-5개를 추출하세요. 상징은 정규화하여 추출하세요 (예: '바다'와 '넓은 바다'는 모두 '바다'로 추출).
    3. 5가지 정서 수치 측정: joy(기쁨), peace(평온), sadness(슬픔), vitality(활력), anxiety(불안)를 각 0-100 사이 숫자로 측정하세요.
    [이미지 가이드]: 사용자가 '한복'을 명시하지 않는 한 절대로 한복을 그리지 마세요. 한국인 인물은 현대 패션으로 묘사하세요. JSON 응답 필수.`;
    try {
      const analysis = await callGemini(input, systemPrompt);
      if (!analysis) throw new Error("분석 오류");
      setPhase('generating');
      const scenesWithImgs = [];
      const genderMod = profile?.gender === '여성' ? 'woman' : 'man';
      const scene = analysis.scenes[0];
      
      const topicContent = `${scene.imagePrompt} featuring a Korean ${genderMod} in stylish modern fashion (Strictly NO Hanbok unless requested in text: "${input}")`;
      const finalPrompt = `${styleData.prompt}, ${topicContent}, high resolution, masterpiece, detailed`;
      
      const rawImg = await generateImage(finalPrompt);
      const compImg = await compressImage(rawImg, 800);
      scenesWithImgs.push({ ...scene, imageUrl: compImg, index: 0 });

      const dreamRef = await addDoc(collection(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'dreams'), {
        ...analysis, originalInput: input, artStyle: currentStyle, createdAt: serverTimestamp()
      });
      for (const s of scenesWithImgs) await addDoc(collection(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'dreams', dreamRef.id, 'scenes'), s);
      setResult({ ...analysis, id: dreamRef.id, scenes: scenesWithImgs });
      setPhase('complete');
    } catch (err) { setPhase('input'); showToast("오류 발생"); }
  };

  if (phase === 'analyzing' || phase === 'generating') return (<div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 w-full"><KkumGyeolLogo className="w-32 h-32 animate-pulse mb-16" /><div className="space-y-10 max-w-sm"><h2 className="text-3xl font-serif text-white font-black">{phase === 'analyzing' ? '꿈의 심연을 분석 중...' : `장면 시각화 중`}</h2><div className="glass-panel p-8 rounded-[3rem] animate-in fade-in duration-1000 min-h-[160px] flex flex-col justify-center"><Lightbulb className="w-6 h-6 text-yellow-400/40 mx-auto mb-6" /><p className="text-lg text-indigo-100 italic font-serif leading-relaxed break-keep">"{SUBCONSCIOUS_QUOTES[quoteIdx]}"</p></div></div></div>);
  if (phase === 'complete') return (<div className="space-y-10 py-10 animate-in fade-in duration-1000"><div className="flex justify-center"><button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300 hover:text-white transition-colors"><Home className="w-6 h-6" /></button></div><h2 className="text-5xl font-serif font-bold text-white dream-shadow italic text-center break-keep leading-tight">{result.title}</h2><div className="space-y-4"><div className="glass-panel p-6 rounded-[2rem] border-l-4 border-purple-500 space-y-2"><div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[9px] tracking-widest"><BrainCircuit className="w-4 h-4" /> 프로이트 분석</div><p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">"{result.freudInterpretation}"</p></div><div className="glass-panel p-6 rounded-[2rem] border-l-4 border-indigo-500 space-y-2"><div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-[9px] tracking-widest"><ScrollText className="w-4 h-4" /> 일반 해몽</div><p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">"{result.generalInterpretation}"</p></div></div><div className="grid grid-cols-1 gap-12 pt-6">{result.scenes.map((s, i) => (<div key={i} className="space-y-4"><div className="aspect-[4/5] rounded-[3rem] overflow-hidden glass-panel relative">{s.imageUrl === "error" ? (<div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0b1f] text-indigo-400/30 gap-4"><AlertTriangle className="w-12 h-12" /><p className="text-xs uppercase tracking-widest text-center px-12">시각화 제한</p></div>) : (<img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />)}<div className="absolute inset-0 bg-gradient-to-t from-[#05040a] to-transparent opacity-80"></div><div className="absolute bottom-6 left-8 text-[7px] text-purple-400 font-bold uppercase tracking-widest">The Scene</div></div><h4 className="text-xl font-serif text-white font-black italic text-center">{s.title}</h4></div>))}</div><button onClick={onBack} className="w-full py-5 glass-panel text-white rounded-full font-serif font-black shadow-xl mt-10">목록으로</button></div>);

  return (
    <div className="space-y-10 py-6 animate-in slide-in-from-bottom duration-700">
      <header className="flex items-center justify-between"><button onClick={onBack} className="p-3 glass-panel rounded-2xl text-indigo-300 flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-all"><ChevronLeft className="w-4 h-4" /> BACK</button><KkumGyeolLogo className="w-12 h-12" /><button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300"><Home className="w-5 h-5" /></button></header>
      <div className="glass-panel rounded-[2.5rem] p-6 space-y-6"><div className="flex items-center gap-3 text-purple-400 font-serif"><Palette className="w-5 h-5" /><span className="text-[9px] font-bold uppercase tracking-[0.3em]">Lens Style</span></div><div className="grid grid-cols-3 gap-2">{ART_STYLES.map(style => (<button key={style.id} onClick={() => setCurrentStyle(style.id)} className={`py-3 rounded-xl border text-[9px] font-black transition-all ${currentStyle === style.id ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-indigo-200'}`}>{style.name}</button>))}</div></div>
      <div className="relative"><textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="어젯밤의 무의식을 들려주세요..." className="w-full h-[400px] glass-panel rounded-[3.5rem] p-10 text-2xl focus:outline-none focus:border-white/10 resize-none font-bold break-keep leading-relaxed text-white shadow-inner" /><div className="absolute bottom-10 right-10 flex gap-4"><button onClick={toggleRec} className={`p-6 rounded-full transition-all shadow-xl ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'glass-panel text-indigo-200'}`}>{isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}</button><button onClick={handleAnalyze} disabled={!input.trim() || isRecording} className="p-6 bg-white text-black rounded-full shadow-2xl active:scale-90 disabled:opacity-20"><Send className="w-6 h-6" /></button></div></div>
    </div>
  );
}

// --- 상세 화면 ---
function DreamDetailView({ profile, dream, onBack, showToast }) {
  const [scenes, setScenes] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!dream) return;
    const fetchScenes = async () => { try { const snap = await getDocs(collection(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'dreams', dream.id, 'scenes')); setScenes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.index - b.index)); } catch (e) { console.error(e); } finally { setLoading(false); } };
    fetchScenes();
  }, [dream]);
  const handleDelete = async () => { if (!confirm("삭제하시겠습니까?")) return; await deleteDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'dreams', dream.id)); onBack(); };
  if (!dream) return null;
  return (<div className="space-y-12 py-6 animate-in fade-in duration-700"><header className="flex justify-between items-center"><div className="flex gap-2"><button onClick={onBack} className="p-3 glass-panel rounded-2xl text-indigo-300 flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase transition-all"><ChevronLeft className="w-4 h-4" /> BACK</button><button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300"><Home className="w-4 h-4" /></button></div><button onClick={handleDelete} className="text-red-400/40 p-3 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button></header><div className="text-center space-y-4"><p className="text-purple-400 text-[9px] font-bold uppercase opacity-60 tracking-[0.8em]">{new Date(dream.createdAt?.seconds * 1000).toLocaleDateString()}</p><h2 className={`font-serif font-bold text-white dream-shadow italic text-center break-keep leading-tight ${dream.title.length > 15 ? 'text-3xl' : 'text-5xl'}`}>{dream.title}</h2></div><div className="space-y-4"><div className="glass-panel p-8 rounded-[3rem] border-l-4 border-purple-500 space-y-2"><div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[9px] tracking-widest"><BrainCircuit className="w-4 h-4" /> 프로이트 분석</div><p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">"{dream.freudInterpretation}"</p></div><div className="glass-panel p-8 rounded-[3rem] border-l-4 border-indigo-500 space-y-2"><div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-[9px] tracking-widest"><ScrollText className="w-4 h-4" /> 일반 해몽</div><p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">"{dream.generalInterpretation}"</p></div></div><div className="space-y-24 pt-10">{loading ? (<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-white/10" /></div>) : (scenes.map((s, idx) => (<div key={s.id} className="space-y-6"><div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden glass-panel relative group">{s.imageUrl === "error" ? (<div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0b1f] text-indigo-400/30 gap-4"><AlertTriangle className="w-12 h-12" /><p className="text-xs uppercase tracking-widest text-center px-12">시각화 제한</p></div>) : (<img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />)}<div className="absolute inset-0 bg-gradient-to-t from-[#05040a] to-transparent opacity-80"></div><div className="absolute bottom-10 left-10 text-[7px] text-purple-400 font-bold uppercase tracking-[0.6em]">FRAGMENT</div></div><div className="space-y-2 px-4"><h4 className="text-3xl font-serif text-white font-black italic break-keep leading-tight">{s.title}</h4><p className="text-indigo-200/40 font-serif text-lg break-keep italic leading-relaxed">"{s.desc}"</p></div></div>)))}</div></div>);
}

// --- 리포트 화면 (정확한 수치 집계 시스템) ---
function StatsView({ dreams, onBack }) {
  const dreamCount = dreams.length;
  const isUnlocked = dreamCount >= STATS_THRESHOLD;
  const progress = Math.min(100, (dreamCount / STATS_THRESHOLD) * 100);

  // 최신 7개 데이터 기반 정밀 분석
  const lastSeven = dreams.slice(0, STATS_THRESHOLD);
  const hasData = lastSeven.length > 0;

  const startDate = hasData ? new Date(lastSeven[lastSeven.length - 1].createdAt?.seconds * 1000).toLocaleDateString() : '';
  const endDate = hasData ? new Date(lastSeven[0].createdAt?.seconds * 1000).toLocaleDateString() : '';

  const avgEmotions = { joy: 0, peace: 0, sadness: 0, vitality: 0, anxiety: 0 };
  const symbolsMap = {};

  if (hasData) {
    lastSeven.forEach(d => {
      // 1. 감정 수치 합산
      if (d.emotions) {
        Object.keys(avgEmotions).forEach(k => { avgEmotions[k] += (d.emotions[k] || 0); });
      }
      // 2. 상징 키워드 출현 횟수 집계 (정확한 매칭을 위해 트림 처리)
      if (d.symbols) {
        // 한 꿈 내에 중복된 키워드가 있어도 출현 여부(1회)만 집계하여 7번 중 몇 번 나왔는지 정확히 계산
        const uniqueInDream = [...new Set(d.symbols.map(s => s.trim()))];
        uniqueInDream.forEach(s => { symbolsMap[s] = (symbolsMap[s] || 0) + 1; });
      }
    });
    // 평균값 산출
    Object.keys(avgEmotions).forEach(k => avgEmotions[k] = Math.round(avgEmotions[k] / lastSeven.length));
  }

  // 출현 빈도가 높은 상징 정렬 (내림차순)
  const topSymbols = Object.entries(symbolsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const getInsightText = () => {
    const sorted = Object.entries(avgEmotions).sort((a, b) => b[1] - a[1]);
    const main = sorted[0][0];
    const mappings = {
      joy: "무의식이 현재 긍정적인 성취와 연결되어 있습니다. 내면의 에너지가 확장을 시도하고 있습니다.",
      peace: "매우 안정적인 심리적 통합기입니다. 무의식이 현실의 스트레스를 성공적으로 처리하고 있습니다.",
      sadness: "내면의 슬픔이 상징을 통해 정화되고 있습니다. 꿈은 당신의 감정을 돌보라는 신호를 보냅니다.",
      vitality: "창조적인 충동이 강한 시기입니다. 무의식은 당신에게 새로운 행동력을 촉구하고 있습니다.",
      anxiety: "현실의 불안이 상징적 긴장으로 나타나고 있습니다. 반복되는 패턴에 주목할 필요가 있습니다."
    };
    return mappings[main] || "기록이 더 쌓일수록 분석은 정교해집니다.";
  };

  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-700 pb-24 px-1">
      <header className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={onBack} className="p-3 glass-panel rounded-2xl text-indigo-300 flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-all"><ChevronLeft className="w-4 h-4" /> BACK</button>
          <button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300"><Home className="w-5 h-5" /></button>
        </div>
        <h2 className="text-3xl font-serif text-white italic dream-shadow">무의식 리포트</h2>
        <div className="w-12"></div>
      </header>

      {!isUnlocked ? (
        <div className="glass-panel p-12 rounded-[3.5rem] border-white/5 space-y-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5"><div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
          <div className="relative w-44 h-44 flex items-center justify-center"><div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-spin-slow"></div><Moon className="w-16 h-16 text-purple-400 animate-pulse" /></div>
          <div className="space-y-4"><h3 className="text-2xl font-serif text-white italic">마음의 지도를 그리는 중</h3><p className="text-indigo-200/60 leading-relaxed break-keep text-sm">패턴 분석을 위해 <span className="text-purple-400 font-bold">{STATS_THRESHOLD - dreamCount}개</span>의 조각이 더 필요합니다.<br/>데이터 수집률: <span className="text-white font-bold">{Math.floor(progress)}%</span></p></div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="flex justify-center"><div className="px-6 py-2 rounded-full glass-panel border-purple-500/20 flex items-center gap-3 text-indigo-300 text-[10px] font-bold tracking-widest uppercase"><Calendar className="w-3 h-3" /> {startDate} — {endDate}</div></div>

          <section className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-8 rounded-[3.5rem] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -bottom-10 opacity-10"><BrainCircuit className="w-40 h-40" /></div>
            <div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[10px] tracking-[0.2em]"><BrainCircuit className="w-5 h-5" /> Subconscious Insight</div>
            <div className="space-y-5">
               <p className="text-2xl md:text-3xl font-serif text-white italic leading-tight break-keep">"최근 7개의 꿈 조각이 들려주는 <br/>당신의 <span className="text-purple-400 underline underline-offset-8 decoration-purple-500/50">심리적 기저</span> 분석입니다."</p>
               <div className="p-5 bg-[#ffffff05] backdrop-blur-sm rounded-2xl border border-white/5 text-sm text-indigo-100/70 leading-relaxed break-keep flex gap-3"><MessageSquareQuote className="w-10 h-10 text-purple-500/40 shrink-0" /><span>{getInsightText()}</span></div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
             {/* 감정 맵 - 실제 5개 영역 데이터 반영 */}
             <div className="glass-panel p-8 rounded-[3rem] space-y-8 flex flex-col items-center bg-white/[0.02]">
                <div className="w-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex justify-between items-center"><span>Emotional Map (7 Units)</span><div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[8px] text-purple-300">Live Data</div></div>
                <div className="relative w-56 h-56 flex items-center justify-center py-4">
                   <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <polygon points="50,10 90,40 75,85 25,85 10,40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <polygon points="50,25 80,45 68,80 32,80 20,45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <path d={`M 50 ${10 + (100 - avgEmotions.joy) * 0.4} L ${90 - (100 - avgEmotions.peace) * 0.4} ${40 - (100 - avgEmotions.peace) * 0.1} L ${75 - (100 - avgEmotions.vitality) * 0.25} ${85 - (100 - avgEmotions.vitality) * 0.1} L ${25 + (100 - avgEmotions.anxiety) * 0.25} ${85 - (100 - avgEmotions.anxiety) * 0.1} L ${10 + (100 - avgEmotions.sadness) * 0.4} ${40 - (100 - avgEmotions.sadness) * 0.1} Z`} fill="rgba(168, 85, 247, 0.25)" stroke="#A855F7" strokeWidth="2" className="animate-pulse" />
                      <text x="50" y="5" fontSize="4" fill="#A855F7" textAnchor="middle" fontWeight="black">기쁨({avgEmotions.joy})</text>
                      <text x="95" y="42" fontSize="4" fill="#6366F1" textAnchor="start">평온({avgEmotions.peace})</text>
                      <text x="80" y="92" fontSize="4" fill="#FBBF24" textAnchor="start">활력({avgEmotions.vitality})</text>
                      <text x="20" y="92" fontSize="4" fill="#EC4899" textAnchor="end">불안({avgEmotions.anxiety})</text>
                      <text x="5" y="42" fontSize="4" fill="#3B82F6" textAnchor="end">슬픔({avgEmotions.sadness})</text>
                   </svg>
                </div>
                <div className="text-center space-y-2 border-t border-white/5 pt-6 w-full"><h4 className="text-white font-bold italic">정서 프로파일 분석</h4><p className="text-xs text-indigo-300/60 break-keep leading-relaxed px-4">최근 7회의 기록 중 가장 두드러지는 정서는 <span className="text-purple-400 font-bold uppercase">{Object.entries(avgEmotions).sort((a, b) => b[1] - a[1])[0][0]}</span>입니다. 이는 당신의 심리적 자원이 현재 어디에 집중되어 있는지를 잘 보여줍니다.</p></div>
             </div>

             {/* 반복 상징 - 실제 데이터 기반 횟수 정확 집계 */}
             <div className="glass-panel p-8 rounded-[3.5rem] space-y-8 bg-[#ffffff02]">
                <div className="flex items-center justify-between"><div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em]"><Layers className="w-5 h-5" /> 반복되는 꿈의 파편들</div><span className="text-[8px] text-indigo-500/50 font-black">Accuracy Verified</span></div>
                <div className="space-y-5">
                   {topSymbols.length > 0 ? topSymbols.map(([name, count], i) => (
                     <div key={i} className="flex gap-5 p-5 bg-white/5 rounded-[2rem] border border-white/5 items-center group hover:bg-white/[0.04] transition-all">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 font-black text-lg border border-indigo-500/20">{count}</div>
                        <div className="flex-1 space-y-1">
                           <div className="text-indigo-100 font-bold text-xl flex items-center gap-2">#{name}</div>
                           <p className="text-xs text-indigo-300/50 break-keep leading-relaxed italic">이 상징은 최근 7개의 꿈 데이터 중 정확히 <span className="text-white font-bold">{count}회</span> 발견되었습니다. </p>
                        </div>
                     </div>
                   )) : (<div className="py-10 text-center text-indigo-300/20 italic font-serif">충분한 상징 데이터가 수집되지 않았습니다.</div>)}
                </div>
             </div>
          </div>

          <div className="text-center space-y-3 pt-12 pb-10"><p className="text-indigo-400/30 text-[10px] uppercase tracking-[0.4em] italic">Deep Dive into Subconscious</p><div className="flex justify-center gap-1 opacity-20"><Sparkle className="w-2 h-2" /><Sparkle className="w-2 h-2 text-purple-400" /><Sparkle className="w-2 h-2" /></div><p className="text-indigo-200/10 text-[9px] break-keep px-10 leading-relaxed">이 리포트는 최근 7개의 꿈 데이터를 기반으로 생성된 정밀 분석 결과입니다.</p></div>
        </div>
      )}
    </div>
  );
}
