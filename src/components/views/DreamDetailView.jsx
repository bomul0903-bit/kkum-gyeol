'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Home,
  Trash2,
  Loader2,
  BrainCircuit,
  ScrollText,
  AlertTriangle
} from 'lucide-react';
import { getScenes, deleteDream, auth } from '@/services/firebase';

export default function DreamDetailView({ dream, onBack, showToast }) {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dream || !auth.currentUser) return;

    const fetchScenes = async () => {
      try {
        const data = await getScenes(auth.currentUser.uid, dream.id);
        setScenes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchScenes();
  }, [dream]);

  const handleDelete = async () => {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteDream(auth.currentUser.uid, dream.id);
    onBack();
  };

  if (!dream) return null;

  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={onBack} className="p-3 glass-panel rounded-2xl text-indigo-300 flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase transition-all">
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          <button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300">
            <Home className="w-4 h-4" />
          </button>
        </div>
        <button onClick={handleDelete} className="text-red-400/40 p-3 hover:text-red-500 transition-all">
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <div className="text-center space-y-4">
        <p className="text-purple-400 text-[9px] font-bold uppercase opacity-60 tracking-[0.8em]">
          {new Date(dream.createdAt?.seconds * 1000).toLocaleDateString()}
        </p>
        <h2 className={`font-serif font-bold text-white dream-shadow italic text-center break-keep leading-tight ${dream.title.length > 15 ? 'text-3xl' : 'text-5xl'}`}>
          {dream.title}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="glass-panel p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-l-4 border-purple-500 space-y-2">
          <div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[9px] tracking-widest">
            <BrainCircuit className="w-4 h-4" /> 프로이트 분석
          </div>
          <p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">
            "{dream.freudInterpretation}"
          </p>
        </div>
        <div className="glass-panel p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-l-4 border-indigo-500 space-y-2">
          <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-[9px] tracking-widest">
            <ScrollText className="w-4 h-4" /> 일반 해몽
          </div>
          <p className="text-lg text-gray-100 font-serif italic leading-relaxed break-keep">
            "{dream.generalInterpretation}"
          </p>
        </div>
      </div>

      <div className="space-y-24 pt-10">
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-white/10" />
          </div>
        ) : (
          scenes.map((s, idx) => (
            <div key={s.id} className="space-y-6">
              <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden glass-panel relative group">
                {s.imageUrl === "error" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0b1f] text-indigo-400/30 gap-4">
                    <AlertTriangle className="w-12 h-12" />
                    <p className="text-xs uppercase tracking-widest text-center px-12">시각화 제한</p>
                  </div>
                ) : (
                  <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05040a] to-transparent opacity-80"></div>
                <div className="absolute bottom-8 left-8 sm:bottom-10 sm:left-10 text-[8px] sm:text-[9px] text-purple-400 font-bold uppercase tracking-[0.4em] sm:tracking-[0.6em]">FRAGMENT</div>
              </div>
              <div className="space-y-2 px-4">
                <h4 className="text-3xl font-serif text-white font-black italic break-keep leading-tight">{s.title}</h4>
                <p className="text-indigo-200/40 font-serif text-lg break-keep italic leading-relaxed">"{s.desc}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
