'use client';

import { useState } from 'react';
import { ChevronRight, Mic, Palette, Wand2 } from 'lucide-react';
import { KkumGyeolLogo } from '../common';
import { ART_STYLES } from '@/constants';
import { saveProfile } from '@/services/firebase';
import { auth } from '@/services/firebase';

export default function OnboardingView({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nickname: '',
    age: '',
    gender: '기타',
    artStyle: 'watercolor'
  });

  const handleSave = async () => {
    if (!auth.currentUser) return;
    await saveProfile(auth.currentUser.uid, form);
    onComplete();
  };

  const steps = [
    {
      id: 1,
      content: (
        <div className="min-h-[70vh] sm:min-h-[80vh] flex flex-col items-center justify-center space-y-8 sm:space-y-12 py-10 sm:py-16 text-center animate-in fade-in zoom-in duration-700">
          <KkumGyeolLogo className="w-28 h-28" />
          <div className="space-y-6">
            <h1 className="text-8xl font-serif font-bold text-white dream-shadow italic tracking-tighter">꿈결</h1>
            <p className="text-xl text-indigo-100/60 font-serif italic leading-relaxed tracking-widest break-keep">
              어젯밤 당신의 무의식이 보낸<br />장면을 예술로 기록합니다.
            </p>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full sm:w-64 py-4 sm:py-5 bg-white text-black font-black rounded-full shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            여정 시작하기 <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )
    },
    {
      id: 2,
      content: (
        <div className="space-y-8 py-6 w-full animate-in slide-in-from-right">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold text-white dream-shadow">꿈결 가이드</h2>
            <p className="text-indigo-400 font-serif text-[10px] uppercase tracking-widest">How to Explore</p>
          </div>
          <div className="space-y-4">
            {[
              { icon: <Mic className="w-5 h-5" />, title: "목소리로 기록", desc: "잊기 전 음성으로 생생하게 들려주세요." },
              { icon: <Palette className="w-5 h-5" />, title: "다양한 화풍", desc: "수채화부터 초현실주의까지 선택 가능합니다." },
              { icon: <Wand2 className="w-5 h-5" />, title: "AI 시각화", desc: "무의식을 1개의 상징적인 장면으로 구현합니다." }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-[2rem] flex items-center gap-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-300">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-indigo-300/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 pt-8">
            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 rounded-full text-white text-sm font-bold">이전</button>
            <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-white text-black font-black rounded-full">알겠어요</button>
          </div>
        </div>
      )
    },
    {
      id: 3,
      content: (
        <div className="space-y-8 py-6 w-full animate-in slide-in-from-right">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold text-white dream-shadow">당신을 알려주세요</h2>
            <p className="text-indigo-400 font-serif text-[10px] uppercase tracking-widest">Profile</p>
          </div>
          <div className="glass-panel p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] space-y-5 sm:space-y-8">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-indigo-400 uppercase">Nickname</label>
              <input
                type="text"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                placeholder="닉네임"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-indigo-400 uppercase">Age Group</label>
              <select
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                className="w-full bg-[#151221] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold cursor-pointer"
              >
                <option value="">선택</option>
                {['10대', '20대', '30대', '40대', '50대', '60대 이상'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-indigo-400 uppercase">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {['남성', '여성', '기타'].map(g => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`py-4 rounded-xl border text-sm font-black transition-all ${form.gender === g ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-indigo-200'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-8">
            <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white/5 rounded-full text-white text-sm font-bold">이전</button>
            <button
              disabled={!form.nickname || !form.age}
              onClick={() => setStep(4)}
              className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-full disabled:opacity-20"
            >
              계속하기
            </button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      content: (
        <div className="space-y-8 py-6 w-full animate-in slide-in-from-right">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold text-white dream-shadow">선호 화풍</h2>
            <p className="text-indigo-400 font-serif text-[10px] uppercase tracking-widest">Default Style</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ART_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setForm({ ...form, artStyle: style.id })}
                className={`p-6 rounded-[2rem] border transition-all text-sm font-black font-serif ${form.artStyle === style.id ? 'bg-white text-black border-white shadow-xl scale-105' : 'glass-panel border-white/10 text-indigo-200'}`}
              >
                {style.name}
              </button>
            ))}
          </div>
          <div className="flex gap-4 pt-8">
            <button onClick={() => setStep(3)} className="flex-1 py-4 bg-white/5 rounded-full text-white text-sm font-bold">이전</button>
            <button
              onClick={handleSave}
              className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-full shadow-xl"
            >
              꿈결 시작하기
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {steps.find(s => s.id === step)?.content}
    </div>
  );
}
