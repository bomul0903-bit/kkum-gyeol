'use client';

import KkumGyeolLogo from './KkumGyeolLogo';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#05040a] flex flex-col items-center justify-center text-indigo-200">
      <KkumGyeolLogo className="w-32 h-32 animate-pulse mb-8" />
      <p className="text-xl font-serif italic tracking-[0.3em] animate-pulse text-center">
        무의식의 문을 여는 중...
      </p>
    </div>
  );
}
