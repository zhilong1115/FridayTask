import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Friday - Sparkle/star shape (✨ replacement)
export const FridayIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L14.5 8.5L21 12L14.5 15.5L12 22L9.5 15.5L3 12L9.5 8.5L12 2Z" fill="#1a73e8" />
    <path d="M12 6L13.5 10L17 12L13.5 14L12 18L10.5 14L7 12L10.5 10L12 6Z" fill="#4e97f2" />
  </svg>
);

// Alpha - Trading chart with upward trend (📈 replacement)
export const AlphaIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#e8710a" />
    <path d="M5 17L9 11L13 14L19 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 6H19V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Aspen - Bar chart / quant (📊 replacement)
export const AspenIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#1a73e8" />
    <rect x="5" y="13" width="3" height="6" rx="0.5" fill="#a8c7fa" />
    <rect x="10.5" y="8" width="3" height="11" rx="0.5" fill="#d2e3fc" />
    <rect x="16" y="5" width="3" height="14" rx="0.5" fill="white" />
  </svg>
);

// HU - Mahjong tile (🀄 replacement)
export const HUIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="2" width="18" height="20" rx="3" fill="#d93025" />
    <rect x="5" y="4" width="14" height="16" rx="2" fill="white" />
    <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#d93025" fontFamily="serif">胡</text>
  </svg>
);

// Artist - Paint palette / banana brush (🍌 replacement)
export const ArtistIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#f9ab00" />
    <circle cx="8" cy="9" r="1.5" fill="white" />
    <circle cx="13" cy="7" r="1.5" fill="#fff3cd" />
    <circle cx="17" cy="10" r="1.5" fill="white" />
    <circle cx="15" cy="15" r="1.5" fill="#fff3cd" />
    <path d="M6 18C6 14 10 12 12 12C14 12 13 16 11 17C9 18 6 18 6 18Z" fill="white" />
  </svg>
);

// FridayTask - Clipboard/checklist (📋 replacement)
export const FridayTaskIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="3" width="16" height="19" rx="3" fill="#f9ab00" />
    <rect x="8" y="1" width="8" height="4" rx="2" fill="#c48800" />
    <rect x="7" y="9" width="10" height="1.5" rx="0.75" fill="white" />
    <rect x="7" y="13" width="7" height="1.5" rx="0.75" fill="white" />
    <rect x="7" y="17" width="8" height="1.5" rx="0.75" fill="white" />
  </svg>
);

// Knowledge - Open book (📚 replacement)
export const KnowledgeIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#7627bb" />
    <path d="M12 7V18" stroke="white" strokeWidth="1.5" />
    <path d="M12 7C10 5.5 7 5 5 5.5V16.5C7 16 10 16.5 12 18C14 16.5 17 16 19 16.5V5.5C17 5 14 5.5 12 7Z" stroke="white" strokeWidth="1.5" fill="none" />
  </svg>
);

// Social - Chat bubbles (📱 replacement)
export const SocialIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#137333" />
    <path d="M7 8H14C15.1 8 16 8.9 16 10V13C16 14.1 15.1 15 14 15H10L7 17.5V15H7C5.9 15 5 14.1 5 13V10C5 8.9 5.9 8 7 8Z" fill="white" />
    <path d="M17 10H17.5C18.6 10 19.5 10.9 19.5 12V15C19.5 16.1 18.6 17 17.5 17H17V19L14.5 17H12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6" />
  </svg>
);

// Zhilong - Person silhouette (👤 replacement)
export const ZhilongIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#3c4043" />
    <circle cx="12" cy="9" r="3.5" fill="white" />
    <path d="M6 20C6 16 8.5 14 12 14C15.5 14 18 16 18 20" fill="white" />
  </svg>
);

// Default - Pin icon (📌 replacement)
export const DefaultIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#70757a" />
    <circle cx="12" cy="10" r="4" fill="white" />
    <path d="M12 14L12 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Map agent id to icon component
const AGENT_ICON_MAP: Record<string, React.FC<IconProps>> = {
  friday: FridayIcon,
  alpha: AlphaIcon,
  aspen: AspenIcon,
  hu: HUIcon,
  artist: ArtistIcon,
  'friday-task': FridayTaskIcon,
  knowledge: KnowledgeIcon,
  social: SocialIcon,
  zhilong: ZhilongIcon,
};

export const AgentIcon: React.FC<IconProps & { agentId: string }> = ({ agentId, size = 20, className }) => {
  const Icon = AGENT_ICON_MAP[agentId] || DefaultIcon;
  return <Icon size={size} className={className} />;
};

export default AgentIcon;
