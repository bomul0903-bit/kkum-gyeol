'use client';

import { useState, useEffect } from 'react';
import { Plus, User, BarChart3, Loader2 } from 'lucide-react';
import { KkumGyeolLogo } from '../common';
import { getDreamPreview, auth } from '@/services/firebase';

export default function HomeView({ dreams, profile, onRecord, onStats, onViewDetail }) {
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    if (dreams.length === 0 || !auth.currentUser) return;

    const fetchPreviews = async () => {
      const newPreviews = { ...previews };
      for (const dream of dreams) {
        if (!newPreviews[dream.id]) {
          const preview = await getDreamPreview(auth.currentUser.uid, dream.id);
          if (preview) newPreviews[dream.id] = preview;
        }
      }
      setPreviews(newPreviews);
    };

    fetchPreviews();
  }, [dreams]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 w-full py-6">
      <header className="flex justify-between items-end pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <KkumGyeolLogo className="w-12 h-12" />
          <div className="space-y-0.5">
            <p className="text-purple-400 font-serif tracking-[0.4em] uppercase text-[7px]">Beta 2.0</p>
            <h1 className="text-4xl font-serif font-bold text-white dream-shadow italic tracking-tighter">꿈결</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border-white/10">
          <User className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-black">{profile?.nickname}</span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <button
          onClick={onRecord}
          className="col-span-2 h-40 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 border border-white/10 flex flex-col items-center justify-center gap-4 active:scale-95 transition-all shadow-xl"
        >
          <Plus className="w-8 h-8 text-white" />
          <span className="text-xl font-serif text-white font-black tracking-widest">새로운 꿈 조각</span>
        </button>
        <div
          onClick={onStats}
          className="glass-panel rounded-[2.5rem] p-6 flex flex-col items-center justify-center border-white/5 active:scale-95 transition-all cursor-pointer"
        >
          <BarChart3 className="w-8 h-8 text-indigo-400 mb-2" />
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">리포트</p>
        </div>
        <div className="glass-panel rounded-[2.5rem] p-6 flex flex-col items-center justify-center border-white/5">
          <p className="text-4xl font-black text-white dream-shadow">{dreams.length}</p>
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">저장됨</p>
        </div>
      </section>

      <section className="space-y-8 pb-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-serif text-white italic border-l-2 border-purple-500 pl-4">기록부</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        {dreams.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-[3rem] border-dashed border-white/10 text-indigo-400/40 font-serif font-bold uppercase">
            기록된 꿈이 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {dreams.map((dream) => (
              <div
                key={dream.id}
                onClick={() => onViewDetail(dream.id)}
                className="group active:scale-[0.98] transition-all rounded-[2.5rem] overflow-hidden glass-panel border-white/5 shadow-xl cursor-pointer"
              >
                <div className="aspect-[16/9] relative bg-[#0d0b1f]">
                  {previews[dream.id] ? (
                    <img src={previews[dream.id]} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05040a] to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-8 right-8">
                    <p className="text-[8px] text-purple-400 font-bold uppercase mb-1">
                      {new Date(dream.createdAt?.seconds * 1000).toLocaleDateString()}
                    </p>
                    <h3 className="font-serif text-white dream-shadow line-clamp-2 italic font-bold text-xl">
                      {dream.title || "무제"}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
