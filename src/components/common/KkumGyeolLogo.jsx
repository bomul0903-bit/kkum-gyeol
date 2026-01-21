'use client';

export default function KkumGyeolLogo({
  className = "w-full",
  color = "#A855F7",
  secondary = "#6366F1",
  accent = "#FBBF24"
}) {
  return (
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
}
