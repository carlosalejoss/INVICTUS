export function Emblem({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 2 L96 18 V56 C96 88 76 108 50 118 C24 108 4 88 4 56 V18 Z"
        fill="#0a0a0b"
        stroke="url(#goldStroke)"
        strokeWidth="2"
      />
      <path
        d="M50 10 L88 24 V56 C88 83 71 100 50 109 C29 100 12 83 12 56 V24 Z"
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth="1"
        opacity="0.6"
      />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="30"
        fontWeight="bold"
        fill="url(#goldStroke)"
      >
        I
      </text>
      <path d="M32 70 L68 70 M50 62 L50 88 M42 82 L58 82" stroke="url(#goldStroke)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5e8c2" />
          <stop offset="50%" stopColor="#c69a2f" />
          <stop offset="100%" stopColor="#7d5f19" />
        </linearGradient>
      </defs>
    </svg>
  );
}
