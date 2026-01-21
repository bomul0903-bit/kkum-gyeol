'use client';

import {
  ChevronLeft,
  Home,
  Moon,
  BrainCircuit,
  TrendingUp,
  Eye,
  Layers,
  Palette,
  Sparkle,
  Hash,
  MessageSquareQuote
} from 'lucide-react';
import { ART_STYLES, STATS_THRESHOLD } from '@/constants';

export default function StatsView({ dreams, onBack }) {
  const dreamCount = dreams.length;
  const isUnlocked = dreamCount >= STATS_THRESHOLD;
  const progress = Math.min(100, (dreamCount / STATS_THRESHOLD) * 100);

  // 실시간 데이터 분석 로직
  const symbolsMap = {};
  let totalJoy = 0, totalAnxiety = 0;
  const stylesCount = {};

  dreams.forEach(d => {
    if (d.symbols) d.symbols.forEach(s => symbolsMap[s] = (symbolsMap[s] || 0) + 1);
    if (d.joyLevel) totalJoy += d.joyLevel;
    if (d.anxietyLevel) totalAnxiety += d.anxietyLevel;
    stylesCount[d.artStyle] = (stylesCount[d.artStyle] || 0) + 1;
  });

  const topSymbols = Object.entries(symbolsMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const avgJoy = dreamCount > 0 ? Math.round(totalJoy / dreamCount) : 0;
  const avgAnxiety = dreamCount > 0 ? Math.round(totalAnxiety / dreamCount) : 0;
  const topStyleId = Object.entries(stylesCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topStyleName = ART_STYLES.find(s => s.id === topStyleId)?.name || '기록 중';

  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-700 pb-24 px-1">
      <header className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={onBack} className="p-3 glass-panel rounded-2xl text-indigo-300 flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-all">
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          <button onClick={onBack} className="p-3 glass-panel rounded-full text-indigo-300">
            <Home className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-3xl font-serif text-white italic dream-shadow">무의식 리포트</h2>
        <div className="w-12"></div>
      </header>

      {!isUnlocked ? (
        <div className="glass-panel p-12 rounded-[3.5rem] border-white/5 space-y-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-spin-slow"></div>
            <Moon className="w-16 h-16 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-white italic">마음의 지도를 그리는 중</h3>
            <p className="text-indigo-200/60 leading-relaxed break-keep text-sm">
              패턴 분석을 위해 <span className="text-purple-400 font-bold">{STATS_THRESHOLD - dreamCount}개</span>의 조각이 더 필요합니다.
              <br />데이터 수집률: <span className="text-white font-bold">{Math.floor(progress)}%</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
          {/* 핵심 인사이트 카드 */}
          <section className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-8 rounded-[3.5rem] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <BrainCircuit className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              <BrainCircuit className="w-5 h-5" /> Subconscious Insight
            </div>
            <div className="space-y-5">
              <p className="text-2xl md:text-3xl font-serif text-white italic leading-tight break-keep">
                "당신의 내면은 현재 <span className="text-purple-400 underline underline-offset-8 decoration-purple-500/50">
                  {avgJoy > avgAnxiety ? '새로운 가능성을 향한 긍정적 전이' : '해결되지 않은 불안의 정화'}
                </span> 단계에 머물러 있습니다."
              </p>
              <div className="p-5 bg-[#ffffff05] backdrop-blur-sm rounded-2xl border border-white/5 text-sm text-indigo-100/70 leading-relaxed break-keep flex gap-3">
                <MessageSquareQuote className="w-10 h-10 text-purple-500/40 shrink-0" />
                <span>지난 {dreamCount}개의 꿈을 종합해 볼 때, 당신은 현실의 제약을 무의식 속에서 예술적 화풍으로 승화시켜 심리적 안정감을 찾으려는 경향을 보입니다.</span>
              </div>
            </div>
          </section>

          {/* 감정 분포 & 통계 대시보드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-[3rem] space-y-8 flex flex-col items-center bg-white/[0.02]">
              <div className="w-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>Emotional Map</span>
                <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[8px] text-purple-300">Live Analytics</div>
              </div>
              <div className="relative w-48 h-48 py-4">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <polygon points="50,10 90,40 75,85 25,85 10,40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <path d="M50 20 L85 45 L70 80 L35 75 L15 40 Z" fill="rgba(168, 85, 247, 0.25)" stroke="#A855F7" strokeWidth="2" className="animate-pulse" />
                  <text x="50" y="5" fontSize="5" fill="#A855F7" textAnchor="middle" fontWeight="black">기쁨</text>
                  <text x="95" y="42" fontSize="5" fill="#6366F1" textAnchor="start">평온</text>
                  <text x="80" y="92" fontSize="5" fill="#FBBF24" textAnchor="start">활력</text>
                  <text x="20" y="92" fontSize="5" fill="#EC4899" textAnchor="end">불안</text>
                  <text x="5" y="42" fontSize="5" fill="#3B82F6" textAnchor="end">슬픔</text>
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-white font-bold italic">심리적 균형 분석</h4>
                <p className="text-xs text-indigo-300/60 break-keep leading-relaxed px-4">
                  현재 당신의 감정 맵은 <span className="text-purple-400 font-bold">'기쁨'</span>과 <span className="text-indigo-400 font-bold">'평온'</span>의 축이 조화롭게 발달해 있습니다. 이는 정서적 탄력성이 높은 상태임을 나타냅니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="glass-panel p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-white/10 transition-all border-l-4 border-l-indigo-500">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-indigo-300 uppercase opacity-60">긍정 정서 비율 (Joy)</div>
                  <div className="text-4xl font-black text-white italic">{avgJoy}%</div>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-white/10 transition-all border-l-4 border-l-pink-500">
                <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400">
                  <Eye className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-pink-300 uppercase opacity-60">자각몽 발현 지수</div>
                  <div className="text-4xl font-black text-white italic">{avgAnxiety / 2}%</div>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-white/10 transition-all border-l-4 border-l-yellow-500">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-400">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-yellow-300 uppercase opacity-60">주요 렌즈 (Style)</div>
                  <div className="text-3xl font-black text-white italic">{topStyleName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 반복 상징 추출 섹션 */}
          <section className="glass-panel p-8 rounded-[3.5rem] space-y-8 bg-[#ffffff02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                <Layers className="w-5 h-5" /> 반복되는 꿈의 파편들
              </div>
              <span className="text-[8px] text-indigo-500/50 font-black">Extracted from {dreamCount} dreams</span>
            </div>
            <div className="space-y-5">
              {topSymbols.length > 0 ? topSymbols.map(([name, count], i) => (
                <div key={i} className="flex gap-5 p-5 bg-white/5 rounded-[2rem] border border-white/5 items-center group hover:bg-white/[0.04] transition-all">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 font-black text-lg border border-indigo-500/20">
                    {count}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-indigo-100 font-bold text-xl flex items-center gap-2">#{name}</div>
                    <p className="text-xs text-indigo-300/50 break-keep leading-relaxed italic">
                      이 상징은 당신의 꿈에서 {count}번 발견되었습니다. {name === '물' ? '감정적 정화와 깊은 내면의 목소리를 의미합니다.' : '현재 당신의 삶에서 중요한 변화를 암시하는 메타포입니다.'}
                    </p>
                  </div>
                  <Hash className="w-5 h-5 text-white/5" />
                </div>
              )) : (
                <div className="py-10 text-center text-indigo-300/20 italic font-serif">데이터 분석 중...</div>
              )}
            </div>
          </section>

          {/* 심리학적 성향 리포트 */}
          <section className="glass-panel p-8 rounded-[3.5rem] space-y-6 border border-white/10 bg-gradient-to-b from-transparent to-purple-900/5">
            <div className="flex items-center gap-3 text-yellow-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              <Palette className="w-5 h-5" /> Subconscious Art Preference
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)] border-4 border-white/10 relative z-10 animate-pulse">
                  <span className="text-xs font-black text-white text-center px-2 break-keep leading-tight uppercase tracking-widest">{topStyleName}</span>
                </div>
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20"></div>
              </div>
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <h4 className="text-2xl font-serif font-black text-white italic">당신은 '감성적 탐구자'입니다.</h4>
                <p className="text-sm text-indigo-200/60 leading-relaxed break-keep">
                  주로 **{topStyleName}** 화풍을 선호하시는군요. {topStyleName === '수채화' ? '이는 당신이 현실의 경계를 유연하게 받아들이며, 직관적이고 감성적인 메시지에 민감하게 반응하는 성향임을 나타냅니다.' : '이는 당신이 무의식을 명확하고 구체적인 형태로 정의하려는 심리적 태도를 가지고 있음을 보여줍니다.'}
                </p>
              </div>
            </div>
          </section>

          <div className="text-center space-y-3 pt-12 pb-10">
            <p className="text-indigo-400/30 text-[10px] uppercase tracking-[0.4em] italic">Deep Dive into Subconscious</p>
            <div className="flex justify-center gap-1 opacity-20">
              <Sparkle className="w-2 h-2" />
              <Sparkle className="w-2 h-2 text-purple-400" />
              <Sparkle className="w-2 h-2" />
            </div>
            <p className="text-indigo-200/10 text-[9px] break-keep px-10 leading-relaxed">
              이 리포트는 AI와 심리학적 알고리즘의 결합으로 생성되었습니다. 결과는 당신의 정서적 성장을 돕기 위한 보조 도구로 사용해 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
