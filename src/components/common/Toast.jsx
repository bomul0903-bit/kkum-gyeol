'use client';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl z-[100] text-sm animate-in slide-in-from-bottom">
      {message}
    </div>
  );
}
