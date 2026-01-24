'use client';

import {
  ChevronLeft,
  Home,
  Moon,
  BrainCircuit,
  Layers,
  Sparkle,
  MessageSquareQuote,
  Calendar
} from 'lucide-react';
import { STATS_THRESHOLD } from '@/constants';

export default function StatsView({ dreams, onBack }) {
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
          <div className="flex justify-center">
            <div className="px-6 py-2 rounded-full glass-panel border-purple-500/20 flex items-center gap-3 text-indigo-300 text-[10px] font-bold tracking-widest uppercase">
              <Calendar className="w-3 h-3" /> {startDate} — {endDate}
            </div>
          </div>

          <section className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-8 rounded-[3.5rem] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <BrainCircuit className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              <BrainCircuit className="w-5 h-5" /> Subconscious Insight
            </div>
            <div className="space-y-5">
              <p className="text-2xl md:text-3xl font-serif text-white italic leading-tight break-keep">
                "최근 7개의 꿈 조각이 들려주는 <br />당신의 <span className="text-purple-400 underline underline-offset-8 decoration-purple-500/50">심리적 기저</span> 분석입니다."
              </p>
              <div className="p-5 bg-[#ffffff05] backdrop-blur-sm rounded-2xl border border-white/5 text-sm text-indigo-100/70 leading-relaxed break-keep flex gap-3">
                <MessageSquareQuote className="w-10 h-10 text-purple-500/40 shrink-0" />
                <span>{getInsightText()}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            {/* 감정 맵 - 실제 5개 영역 데이터 반영 */}
            <div className="glass-panel p-8 rounded-[3rem] space-y-8 flex flex-col items-center bg-white/[0.02]">
              <div className="w-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>Emotional Map (7 Units)</span>
                <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[8px] text-purple-300">Live Data</div>
              </div>
              <div className="relative w-56 h-56 flex items-center justify-center py-4">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <polygon points="50,10 90,40 75,85 25,85 10,40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <polygon points="50,25 80,45 68,80 32,80 20,45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <path
                    d={`M 50 ${10 + (100 - avgEmotions.joy) * 0.4} L ${90 - (100 - avgEmotions.peace) * 0.4} ${40 - (100 - avgEmotions.peace) * 0.1} L ${75 - (100 - avgEmotions.vitality) * 0.25} ${85 - (100 - avgEmotions.vitality) * 0.1} L ${25 + (100 - avgEmotions.anxiety) * 0.25} ${85 - (100 - avgEmotions.anxiety) * 0.1} L ${10 + (100 - avgEmotions.sadness) * 0.4} ${40 - (100 - avgEmotions.sadness) * 0.1} Z`}
                    fill="rgba(168, 85, 247, 0.25)"
                    stroke="#A855F7"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <text x="50" y="5" fontSize="4" fill="#A855F7" textAnchor="middle" fontWeight="black">기쁨({avgEmotions.joy})</text>
                  <text x="95" y="42" fontSize="4" fill="#6366F1" textAnchor="start">평온({avgEmotions.peace})</text>
                  <text x="80" y="92" fontSize="4" fill="#FBBF24" textAnchor="start">활력({avgEmotions.vitality})</text>
                  <text x="20" y="92" fontSize="4" fill="#EC4899" textAnchor="end">불안({avgEmotions.anxiety})</text>
                  <text x="5" y="42" fontSize="4" fill="#3B82F6" textAnchor="end">슬픔({avgEmotions.sadness})</text>
                </svg>
              </div>
              <div className="text-center space-y-2 border-t border-white/5 pt-6 w-full">
                <h4 className="text-white font-bold italic">정서 프로파일 분석</h4>
                <p className="text-xs text-indigo-300/60 break-keep leading-relaxed px-4">
                  최근 7회의 기록 중 가장 두드러지는 정서는 <span className="text-purple-400 font-bold uppercase">{Object.entries(avgEmotions).sort((a, b) => b[1] - a[1])[0][0]}</span>입니다.
                  이는 당신의 심리적 자원이 현재 어디에 집중되어 있는지를 잘 보여줍니다.
                </p>
              </div>
            </div>

            {/* 반복 상징 - 실제 데이터 기반 횟수 정확 집계 */}
            <div className="glass-panel p-8 rounded-[3.5rem] space-y-8 bg-[#ffffff02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                  <Layers className="w-5 h-5" /> 반복되는 꿈의 파편들
                </div>
                <span className="text-[8px] text-indigo-500/50 font-black">Accuracy Verified</span>
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
                        이 상징은 최근 7개의 꿈 데이터 중 정확히 <span className="text-white font-bold">{count}회</span> 발견되었습니다.
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-indigo-300/20 italic font-serif">충분한 상징 데이터가 수집되지 않았습니다.</div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center space-y-3 pt-12 pb-10">
            <p className="text-indigo-400/30 text-[10px] uppercase tracking-[0.4em] italic">Deep Dive into Subconscious</p>
            <div className="flex justify-center gap-1 opacity-20">
              <Sparkle className="w-2 h-2" />
              <Sparkle className="w-2 h-2 text-purple-400" />
              <Sparkle className="w-2 h-2" />
            </div>
            <p className="text-indigo-200/10 text-[9px] break-keep px-10 leading-relaxed">
              이 리포트는 최근 7개의 꿈 데이터를 기반으로 생성된 정밀 분석 결과입니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
