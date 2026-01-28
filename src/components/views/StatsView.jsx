'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Moon,
  BrainCircuit,
  Sparkle,
  MessageSquareQuote,
  TrendingUp,
  TrendingDown,
  Minus,
  Sun,
  CloudRain
} from 'lucide-react';
import { STATS_THRESHOLD } from '@/constants';

export default function StatsView({ dreams, onBack }) {
  const [reportIndex, setReportIndex] = useState(0);

  const currentBatch = dreams.slice(reportIndex * STATS_THRESHOLD, (reportIndex + 1) * STATS_THRESHOLD);
  const nextBatch = dreams.slice((reportIndex + 1) * STATS_THRESHOLD, (reportIndex + 2) * STATS_THRESHOLD);

  const hasComparison = nextBatch.length >= STATS_THRESHOLD;
  const isCompleteBatch = currentBatch.length === STATS_THRESHOLD;
  const isLatest = reportIndex === 0;

  const startDate = currentBatch.length > 0 ? new Date(currentBatch[currentBatch.length - 1].createdAt?.seconds * 1000).toLocaleDateString() : '';
  const endDate = currentBatch.length > 0 ? new Date(currentBatch[0].createdAt?.seconds * 1000).toLocaleDateString() : '';
  const progress = Math.min(100, (currentBatch.length / STATS_THRESHOLD) * 100);

  const calculateStats = (batch) => {
    const emotions = { joy: 0, peace: 0, sadness: 0, vitality: 0, anxiety: 0 };
    let maxPosDream = { score: -1, symbols: [] };
    let maxNegDream = { score: -1, symbols: [] };

    if (batch.length === 0) return { emotions, topEmotion: null, posElements: [], negElements: [] };

    batch.forEach(d => {
      if (d.emotions) {
        Object.keys(emotions).forEach(k => { emotions[k] += (d.emotions[k] || 0); });

        const posScore = (d.emotions.joy || 0) + (d.emotions.peace || 0) + (d.emotions.vitality || 0);
        const negScore = (d.emotions.sadness || 0) + (d.emotions.anxiety || 0);

        if (posScore > maxPosDream.score) {
          maxPosDream = { score: posScore, symbols: d.symbols || [] };
        }
        if (negScore > maxNegDream.score) {
          maxNegDream = { score: negScore, symbols: d.symbols || [] };
        }
      }
    });

    Object.keys(emotions).forEach(k => emotions[k] = Math.round(emotions[k] / batch.length));
    const sortedEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]);

    return {
      emotions,
      topEmotion: sortedEmotions[0],
      posElements: maxPosDream.symbols.slice(0, 3),
      negElements: maxNegDream.symbols.slice(0, 3)
    };
  };

  const currentStats = calculateStats(currentBatch);
  const prevStats = hasComparison ? calculateStats(nextBatch) : null;

  const getComparisonInsight = () => {
    const main = currentStats.topEmotion?.[0];
    if (!hasComparison) {
      const mappings = {
        joy: "무의식이 현재 긍정적인 성취와 연결되어 있습니다. 내면의 에너지가 확장을 시도하고 있습니다.",
        peace: "매우 안정적인 심리적 통합기입니다. 무의식이 현실의 스트레스를 성공적으로 처리하고 있습니다.",
        sadness: "내면의 슬픔이 상징을 통해 정화되고 있습니다. 꿈은 당신의 감정을 돌보라는 신호를 보냅니다.",
        vitality: "창조적인 충동이 강한 시기입니다. 무의식은 당신에게 새로운 행동력을 촉구하고 있습니다.",
        anxiety: "현실의 불안이 상징적 긴장으로 나타나고 있습니다. 반복되는 패턴에 주목할 필요가 있습니다."
      };
      return mappings[main] || "기록이 더 쌓일수록 분석은 정교해집니다.";
    } else {
      const currVal = currentStats.emotions[main];
      const prevVal = prevStats.emotions[main];
      const diff = currVal - prevVal;
      let trendText = "";
      if (Math.abs(diff) < 5) trendText = "지난 리포트와 비슷한 흐름을 유지하고 있습니다.";
      else if (diff > 0) trendText = `지난 리포트보다 감정의 강도가 ${Math.abs(diff)}% 증가했습니다.`;
      else trendText = `지난 리포트보다 감정의 강도가 ${Math.abs(diff)}% 감소했습니다.`;

      const compMappings = {
        joy: `기쁨과 성취의 에너지가 중심이 된 시기입니다. ${trendText}`,
        peace: `내면의 평온함이 가장 두드러집니다. ${trendText}`,
        sadness: `슬픔의 정서가 무의식의 주된 테마입니다. ${trendText}`,
        vitality: `삶의 활력이 꿈을 통해 표출되고 있습니다. ${trendText}`,
        anxiety: `불안 요소가 무의식에 영향을 주고 있습니다. ${trendText}`
      };
      return compMappings[main];
    }
  };

  const ComparisonIndicator = ({ type }) => {
    if (!hasComparison) return null;
    const diff = currentStats.emotions[type] - prevStats.emotions[type];
    if (Math.abs(diff) < 2) return <span className="text-gray-500 text-[8px] flex items-center gap-1"><Minus className="w-2 h-2" /> 유지</span>;
    const isPositive = diff > 0;
    return (
      <span className={`${isPositive ? 'text-red-400' : 'text-blue-400'} text-[8px] flex items-center gap-0.5 font-bold`}>
        {isPositive ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
        {Math.abs(diff)}
      </span>
    );
  };

  const hasNextReport = (reportIndex + 1) * STATS_THRESHOLD < dreams.length;
  const hasPrevReport = reportIndex > 0;

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

      {/* Report Navigation */}
      <div className="flex items-center justify-between px-4">
        <button disabled={!hasNextReport} onClick={() => setReportIndex(i => i + 1)} className="p-2 rounded-full glass-panel disabled:opacity-20 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <span className="text-xs text-purple-400 font-bold uppercase tracking-widest block mb-1">
            {isLatest && !isCompleteBatch ? '작성 중...' : `REPORT CYCLE #${Math.ceil(dreams.length / STATS_THRESHOLD) - reportIndex}`}
          </span>
          <span className="text-[10px] text-gray-400">{startDate} — {endDate}</span>
        </div>
        <button disabled={!hasPrevReport} onClick={() => setReportIndex(i => i - 1)} className="p-2 rounded-full glass-panel disabled:opacity-20 text-white">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {isLatest && !isCompleteBatch ? (
        <div className="glass-panel p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] border-white/5 space-y-6 sm:space-y-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-spin-slow"></div>
            <Moon className="w-16 h-16 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-white italic">리포트 작성 중</h3>
            <p className="text-indigo-200/60 leading-relaxed break-keep text-sm">
              다음 리포트 발행까지 <span className="text-purple-400 font-bold">{STATS_THRESHOLD - currentBatch.length}개</span>의 꿈 조각이 더 필요합니다.
              <br />진행률: <span className="text-white font-bold">{Math.floor(progress)}%</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">

          <section className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] border border-white/10 space-y-4 sm:space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <BrainCircuit className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-3 text-purple-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              <BrainCircuit className="w-5 h-5" /> Subconscious Insight
            </div>
            <div className="space-y-5">
              <p className="text-2xl md:text-3xl font-serif text-white italic leading-tight break-keep">
                {hasComparison ?
                  <span>"지난 리포트와 비교된<br /><span className="text-purple-400 underline underline-offset-8 decoration-purple-500/50">심리적 변화</span> 분석입니다."</span> :
                  <span>"이 기간의 꿈 조각들이 들려주는 <br />당신의 <span className="text-purple-400 underline underline-offset-8 decoration-purple-500/50">심리적 기저</span> 분석입니다."</span>
                }
              </p>
              <div className="p-5 bg-[#ffffff05] backdrop-blur-sm rounded-2xl border border-white/5 text-sm text-indigo-100/70 leading-relaxed break-keep flex gap-3">
                <MessageSquareQuote className="w-10 h-10 text-purple-500/40 shrink-0" />
                <span>{getComparisonInsight()}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            <div className="glass-panel p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] space-y-5 sm:space-y-8 flex flex-col items-center bg-white/[0.02]">
              <div className="w-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>Emotional Map</span>
              </div>
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center py-4">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <polygon points="50,10 90,40 75,85 25,85 10,40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <polygon points="50,25 80,45 68,80 32,80 20,45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  {hasComparison && (
                    <path
                      d={`M 50 ${10 + (100 - prevStats.emotions.joy) * 0.4} L ${90 - (100 - prevStats.emotions.peace) * 0.4} ${40 - (100 - prevStats.emotions.peace) * 0.1} L ${75 - (100 - prevStats.emotions.vitality) * 0.25} ${85 - (100 - prevStats.emotions.vitality) * 0.1} L ${25 + (100 - prevStats.emotions.anxiety) * 0.25} ${85 - (100 - prevStats.emotions.anxiety) * 0.1} L ${10 + (100 - prevStats.emotions.sadness) * 0.4} ${40 - (100 - prevStats.emotions.sadness) * 0.1} Z`}
                      fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2"
                    />
                  )}
                  <path
                    d={`M 50 ${10 + (100 - currentStats.emotions.joy) * 0.4} L ${90 - (100 - currentStats.emotions.peace) * 0.4} ${40 - (100 - currentStats.emotions.peace) * 0.1} L ${75 - (100 - currentStats.emotions.vitality) * 0.25} ${85 - (100 - currentStats.emotions.vitality) * 0.1} L ${25 + (100 - currentStats.emotions.anxiety) * 0.25} ${85 - (100 - currentStats.emotions.anxiety) * 0.1} L ${10 + (100 - currentStats.emotions.sadness) * 0.4} ${40 - (100 - currentStats.emotions.sadness) * 0.1} Z`}
                    fill="rgba(168, 85, 247, 0.25)" stroke="#A855F7" strokeWidth="2" className="animate-pulse"
                  />
                  <g transform="translate(50, 5)"><text fontSize="4" fill="#A855F7" textAnchor="middle" fontWeight="black">기쁨({currentStats.emotions.joy})</text></g>
                  <g transform="translate(95, 42)"><text fontSize="4" fill="#6366F1" textAnchor="start">평온({currentStats.emotions.peace})</text></g>
                  <g transform="translate(80, 92)"><text fontSize="4" fill="#FBBF24" textAnchor="start">활력({currentStats.emotions.vitality})</text></g>
                  <g transform="translate(20, 92)"><text fontSize="4" fill="#EC4899" textAnchor="end">불안({currentStats.emotions.anxiety})</text></g>
                  <g transform="translate(5, 42)"><text fontSize="4" fill="#3B82F6" textAnchor="end">슬픔({currentStats.emotions.sadness})</text></g>
                </svg>
              </div>
              {hasComparison && <div className="text-[8px] text-gray-500 flex items-center gap-2"><div className="w-3 h-0.5 bg-white/20 border-dashed border-t border-white/40"></div>지난 리포트</div>}
            </div>

            {/* Positive vs Negative Elements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-[2.5rem] space-y-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/5">
                <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase text-[9px] tracking-widest">
                  <Sun className="w-4 h-4" /> Positive Elements
                </div>
                <div className="space-y-2">
                  {currentStats.posElements.length > 0 ? currentStats.posElements.map((el, i) => (
                    <div key={i} className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-white text-center">#{el}</div>
                  )) : <p className="text-[10px] text-white/30 text-center py-4">식별된 요소 없음</p>}
                </div>
                <p className="text-[9px] text-indigo-200/40 text-center leading-relaxed">내면의 자원이 되는<br />핵심 상징입니다.</p>
              </div>

              <div className="glass-panel p-6 rounded-[2.5rem] space-y-4 bg-gradient-to-br from-purple-500/10 to-pink-500/5">
                <div className="flex items-center gap-2 text-purple-300 font-bold uppercase text-[9px] tracking-widest">
                  <CloudRain className="w-4 h-4" /> Negative Elements
                </div>
                <div className="space-y-2">
                  {currentStats.negElements.length > 0 ? currentStats.negElements.map((el, i) => (
                    <div key={i} className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-white text-center">#{el}</div>
                  )) : <p className="text-[10px] text-white/30 text-center py-4">식별된 요소 없음</p>}
                </div>
                <p className="text-[9px] text-purple-200/40 text-center leading-relaxed">심리적 해소가 필요한<br />스트레스 요인입니다.</p>
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
            <p className="text-indigo-200/10 text-[9px] break-keep px-4 sm:px-10 leading-relaxed">
              이 리포트는 해당 기간의 꿈 데이터를 기반으로 생성된 정밀 분석 결과입니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
