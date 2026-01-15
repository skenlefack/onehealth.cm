interface OneHealthLogoProps {
  size?: number;
  className?: string;
}

export function OneHealthLogo({ size = 60, className }: OneHealthLogoProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        {/* Outer arcs */}
        <path
          d="M50 5 A45 45 0 0 1 95 50"
          fill="none"
          stroke="#2196F3"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M95 50 A45 45 0 0 1 27.5 92.5"
          fill="none"
          stroke="#FF9800"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M27.5 92.5 A45 45 0 0 1 50 5"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Inner circle */}
        <circle cx="50" cy="50" r="28" fill="white" />
        {/* Pillar dots */}
        <circle cx="50" cy="25" r="8" fill="#2196F3" opacity="0.9" />
        <circle cx="72" cy="68" r="8" fill="#FF9800" opacity="0.9" />
        <circle cx="28" cy="68" r="8" fill="#4CAF50" opacity="0.9" />
      </svg>
    </div>
  );
}
