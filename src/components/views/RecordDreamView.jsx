'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Home,
  Palette,
  Mic,
  MicOff,
  Send,
  Lightbulb,
  BrainCircuit,
  ScrollText,
  AlertTriangle
} from 'lucide-react';
import { KkumGyeolLogo } from '../common';
import { ART_STYLES, SUBCONSCIOUS_QUOTES } from '@/constants';
import { compressImage } from '@/lib/utils';
import { saveDream, saveScene, auth } from '@/services/firebase';
import { analyzeDream, generateImage } from '@/services/api';

export default function RecordDreamView({ profile, onBack, showToast }) {
  const [input, setInput] = useState('');
  const [currentStyle, setCurrentStyle] = useState(profile?.artStyle || 'watercolor');
  const [isRecording, setIsRecording] = useState(false);
  const [phase, setPhase] = useState('input');
  const [result, setResult] = useState(null);
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random() * SUBCONSCIOUS_QUOTES.length));
  const recognitionRef = useRef(null);

  useEffect(() => {
    let timer;
    if (phase === 'analyzing' || phase === 'generating') {
      timer = setInterval(() => setQuoteIdx(prev => (prev + 1) % SUBCONSCIOUS_QUOTES.length), 7000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const SpeechRec = typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.lang = 'ko-KR';
      rec.onresult = (e) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) text += e.results[i][0].transcript;
        }
        if (text) setInput(prev => (prev ? prev + ' ' : '') + text);
      };
      rec.onend = () => {
        if (isRecording) rec.start();
      };
      recognitionRef.current = rec;
    }
  }, [isRecording]);

  const toggleRec = () => {
    if (!recognitionRef.current) {
      showToast("음성 인식 불가");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() || !auth.currentUser) return;
    if (isRecording) toggleRec();
    setPhase('analyzing');

    const styleData = ART_STYLES.find(s => s.id === currentStyle);

    try {
      const analysis = await analyzeDream(input);
      if (!analysis) throw new Error("분석 오류");

      setPhase('generating');
      const scenesWithImgs = [];
      const genderMod = profile?.gender === '여성' ? 'woman' : 'man';
      const scene = analysis.scenes[0];
      const finalPrompt = `[STYLE: ${styleData.prompt}]. Subject: A Korean ${genderMod} in fashionable modern clothing in a dream scene: ${scene.imagePrompt}. Aesthetic masterpiece.`;

      const rawImg = await generateImage(finalPrompt);
      const compImg = await compressImage(rawImg, 800);
      scenesWithImgs.push({ ...scene, imageUrl: compImg, index: 0 });

      const dreamId = await saveDream(auth.currentUser.uid, {
        ...analysis,
        originalInput: input,
        artStyle: currentStyle
      });

      for (const s of scenesWithImgs) {
        await saveScene(auth.currentUser.uid, dreamId, s);
      }

      setResult({ ...analysis, id: dreamId, scenes: scenesWithImgs });
      setPhase('complete');
    } catch (err) {
      console.error(err);
      setPhase('input');
      showToast("오류 발생");
    }
  };

  if (phase === 'analyzing' || phase === 'generating') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 w-full">
        <KkumGyeolLogo className="w-32 h-32 animate-pulse mb-16" />
        <div className="space-y-10 max-w-sm">
          <h2 className="text-3xl font-serif text-white font-black">
            {phase === 'analyzing' ? '꿈의 심연을 분석 중...' : '장면 시각화 중'}
          </h2>
          <div className="glass-panel p-8 rounded-[3rem] animate-in fade-in duration-1000 min-h-[160px] flex flex-col justify-center">
            <Lightbulb className="w-6 h-6 text-yellow-400/40 mx-auto mb-6" />
            <p className="text-lg text-indigo-100 italic font-serif leading-relaxed break-keep">
              "{SUBCONSCIOUS_QUOTES[quoteIdx]}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="space-y-10 py-10 animate-in fade-in duration-1000">
        <div className="flex justify-center">
          <button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300 hover:text-white transition-colors">
            <Home className="w-6 h-6" />
          </button>
        </div>
        <h2 className="text-5xl font-serif font-bold text-white dream-shadow italic text-center break-keep leading-tight">
          {result.title}
        </h2>
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-[2rem] border-l-4 border-purple-500 space-y-2">
            <div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[9px] tracking-widest">
              <BrainCircuit className="w-4 h-4" /> 프로이트 분석
            </div>
            <p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">
              "{result.freudInterpretation}"
            </p>
          </div>
          <div className="glass-panel p-6 rounded-[2rem] border-l-4 border-indigo-500 space-y-2">
            <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-[9px] tracking-widest">
              <ScrollText className="w-4 h-4" /> 일반 해몽
            </div>
            <p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">
              "{result.generalInterpretation}"
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-12 pt-6">
          {result.scenes.map((s, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden glass-panel relative">
                {s.imageUrl === "error" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0b1f] text-indigo-400/30 gap-4">
                    <AlertTriangle className="w-12 h-12" />
                    <p className="text-xs uppercase tracking-widest text-center px-12">시각화 제한</p>
                  </div>
                ) : (
                  <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05040a] to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-8 text-[7px] text-purple-400 font-bold uppercase tracking-widest">
                  The Scene
                </div>
              </div>
              <h4 className="text-xl font-serif text-white font-black italic text-center">{s.title}</h4>
            </div>
          ))}
        </div>
        <button
          onClick={onBack}
          className="w-full py-5 glass-panel text-white rounded-full font-serif font-black shadow-xl mt-10"
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 animate-in slide-in-from-bottom duration-700">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="p-3 glass-panel rounded-2xl text-indigo-300 flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-all">
          <ChevronLeft className="w-4 h-4" /> BACK
        </button>
        <KkumGyeolLogo className="w-12 h-12" />
        <button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300">
          <Home className="w-5 h-5" />
        </button>
      </header>

      <div className="glass-panel rounded-[2.5rem] p-6 space-y-6">
        <div className="flex items-center gap-3 text-purple-400 font-serif">
          <Palette className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Lens Style</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ART_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setCurrentStyle(style.id)}
              className={`py-3 rounded-xl border text-[9px] font-black transition-all ${currentStyle === style.id ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-indigo-200'}`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="어젯밤의 무의식을 들려주세요..."
          className="w-full h-[400px] glass-panel rounded-[3.5rem] p-10 text-2xl focus:outline-none focus:border-white/10 resize-none font-bold break-keep leading-relaxed text-white shadow-inner"
        />
        <div className="absolute bottom-10 right-10 flex gap-4">
          <button
            onClick={toggleRec}
            className={`p-6 rounded-full transition-all shadow-xl ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'glass-panel text-indigo-200'}`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!input.trim() || isRecording}
            className="p-6 bg-white text-black rounded-full shadow-2xl active:scale-90 disabled:opacity-20"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
