// ─── Sunday Icons — warm, cozy family style ─────────────

interface IconProps {
  size?: number;
  className?: string;
}

// App logo — warm sun with soft rays
export const SunLogo = ({ size = 32, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
    <defs>
      <linearGradient id="sun-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="face-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff7ed" />
        <stop offset="100%" stopColor="#fef3c7" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#sun-grad)" />
    {/* Soft rays */}
    <g opacity="0.5">
      <ellipse cx="20" cy="6" rx="2.5" ry="3" fill="#fde68a" />
      <ellipse cx="20" cy="34" rx="2.5" ry="3" fill="#fde68a" />
      <ellipse cx="6" cy="20" rx="3" ry="2.5" fill="#fde68a" />
      <ellipse cx="34" cy="20" rx="3" ry="2.5" fill="#fde68a" />
      <ellipse cx="10" cy="10" rx="2.5" ry="2.5" fill="#fde68a" transform="rotate(45 10 10)" />
      <ellipse cx="30" cy="30" rx="2.5" ry="2.5" fill="#fde68a" transform="rotate(45 30 30)" />
      <ellipse cx="30" cy="10" rx="2.5" ry="2.5" fill="#fde68a" transform="rotate(-45 30 10)" />
      <ellipse cx="10" cy="30" rx="2.5" ry="2.5" fill="#fde68a" transform="rotate(-45 10 30)" />
    </g>
    {/* Sun face */}
    <circle cx="20" cy="20" r="9" fill="url(#face-grad)" />
    {/* Smile */}
    <path d="M16 21.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Eyes — happy closed */}
    <path d="M15.5 17.5c0 0 0.8-1.5 1.8 0" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    <path d="M22.7 17.5c0 0 0.8-1.5 1.8 0" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    {/* Rosy cheeks */}
    <circle cx="14.5" cy="21" r="1.5" fill="#fcd34d" opacity="0.5" />
    <circle cx="25.5" cy="21" r="1.5" fill="#fcd34d" opacity="0.5" />
  </svg>
);

// Family icon — two people with heart
export const FamilyIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="8" cy="7" r="3" fill="#fbbf24" opacity="0.6" />
    <circle cx="16" cy="7" r="3" fill="#fb923c" opacity="0.6" />
    <path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" fill="#fef3c7" />
    <path d="M12 12.5l-1.2-1.1C9.5 10.2 9 9.3 9 8.5 9 7.7 9.7 7 10.5 7c.5 0 1 .2 1.5.7.5-.5 1-.7 1.5-.7.8 0 1.5.7 1.5 1.5 0 .8-.5 1.7-1.8 2.9L12 12.5z" fill="#f87171" />
  </svg>
);

// Person — male (simple, rounded, warm)
export const PersonMale = ({ size = 16, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" fill="#93c5fd" opacity="0.7" />
    <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="3" fill="none" stroke="#60a5fa" strokeWidth="1.2" />
  </svg>
);

// Person — female (with a small bow detail)
export const PersonFemale = ({ size = 16, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" fill="#f9a8d4" opacity="0.5" />
    <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="#fce7f3" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="3" fill="none" stroke="#f472b6" strokeWidth="1.2" />
    {/* Hair detail */}
    <path d="M9 6.5c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5" stroke="#f472b6" strokeWidth="1" strokeLinecap="round" fill="none" />
  </svg>
);

// Plus — rounded, friendly
export const PlusIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Check — soft rounded
export const CheckIcon = ({ size = 14, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Trash — softer, rounder
export const TrashIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 7h16" />
    <path d="M6 7v11a3 3 0 003 3h6a3 3 0 003-3V7" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
  </svg>
);

// Calendar — warm, rounded
export const CalendarIcon = ({ size = 12, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="16" rx="3" stroke="#d97706" strokeWidth="1.5" fill="#fef3c7" opacity="0.5" />
    <path d="M3 10h18" stroke="#d97706" strokeWidth="1.5" />
    <path d="M8 3v4M16 3v4" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="15" r="1" fill="#d97706" />
    <circle cx="12" cy="15" r="1" fill="#d97706" />
  </svg>
);

// Checklist progress — warm
export const ChecklistIcon = ({ size = 12, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="3" width="16" height="18" rx="3" fill="#fef3c7" opacity="0.5" stroke="#d97706" strokeWidth="1.2" />
    <path d="M8 9l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 15h8" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Empty state — cozy house with heart chimney smoke
export const CozyHouse = ({ size = 80, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
    {/* Chimney smoke hearts */}
    <path d="M55 18l-1-0.9C52.8 16 52.5 15.3 52.5 14.7c0-.6.5-1.1 1.1-1.1.3 0 .6.2 .9.5.3-.3.6-.5.9-.5.6 0 1.1.5 1.1 1.1 0 .6-.3 1.3-1.5 2.3L55 18z" fill="#f9a8d4" opacity="0.6" />
    <path d="M58 12l-.8-.7C56.2 10.4 56 9.9 56 9.4c0-.5.4-.9.9-.9.2 0 .5.1.7.4.2-.3.5-.4.7-.4.5 0 .9.4.9.9 0 .5-.2 1-1.2 1.9L58 12z" fill="#f9a8d4" opacity="0.4" />
    {/* Chimney */}
    <rect x="50" y="22" width="8" height="14" rx="1.5" fill="#d97706" />
    {/* Roof */}
    <path d="M14 40L40 20L66 40" fill="#f59e0b" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
    {/* House body */}
    <rect x="20" y="38" width="40" height="28" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
    {/* Door */}
    <rect x="34" y="48" width="12" height="18" rx="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
    <circle cx="43" cy="58" r="1.2" fill="#d97706" />
    {/* Window left */}
    <rect x="24" y="44" width="8" height="8" rx="1.5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
    <line x1="28" y1="44" x2="28" y2="52" stroke="#d97706" strokeWidth="0.8" />
    <line x1="24" y1="48" x2="32" y2="48" stroke="#d97706" strokeWidth="0.8" />
    {/* Window right */}
    <rect x="48" y="44" width="8" height="8" rx="1.5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
    <line x1="52" y1="44" x2="52" y2="52" stroke="#d97706" strokeWidth="0.8" />
    <line x1="48" y1="48" x2="56" y2="48" stroke="#d97706" strokeWidth="0.8" />
    {/* Ground */}
    <path d="M8 66q16 4 32 0t32 0" stroke="#86efac" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
  </svg>
);

// Priority dot with soft glow
export const PriorityDot = ({ level, size = 8 }: { level: string; size?: number }) => {
  const colors: Record<string, { fill: string; glow: string }> = {
    high: { fill: '#f87171', glow: '#fecaca' },
    medium: { fill: '#fbbf24', glow: '#fef3c7' },
    low: { fill: '#4ade80', glow: '#dcfce7' },
  };
  const c = colors[level] || colors.medium;
  return (
    <svg width={size * 2} height={size * 2} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill={c.glow} />
      <circle cx="8" cy="8" r="3" fill={c.fill} />
    </svg>
  );
};
