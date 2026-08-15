import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

const SvgIcon: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </SvgIcon>
);

export const TimerIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M5 3 2 6" />
    <path d="m22 6-3-3" />
  </SvgIcon>
);

export const ClipboardIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </SvgIcon>
);

export const CheckIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </SvgIcon>
);

export const BookIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </SvgIcon>
);

export const EditIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </SvgIcon>
);

export const ChartIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M3 3v18h18" />
    <path d="M7 16l4-8 4 4 6-9" />
  </SvgIcon>
);

export const LightbulbIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.05-.33.09-.66.09-1a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 1.41.5 2.71 1.32 3.74.72.92 1.68 1.43 2.68 2.26h6c1-1 2-1.5 2.68-2.26A5.97 5.97 0 0 0 15 13c0-.34-.04-.67-.09-1z" />
  </SvgIcon>
);

export const GlobeIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
  </SvgIcon>
);

export const ReadingIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </SvgIcon>
);

export const HeadphonesIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M3 14a9 9 0 1 1 18 0" />
    <path d="M21 16a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
    <path d="M3 16a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z" />
  </SvgIcon>
);

export const MicIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
    <path d="M12 19v3" />
  </SvgIcon>
);

export const CalculatorIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8" />
    <path d="M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
  </SvgIcon>
);

export const PackageIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M21 8v13H3V8" />
    <rect x="1" y="3" width="22" height="5" />
    <path d="M10 12h4" />
  </SvgIcon>
);

export const SettingsIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </SvgIcon>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <polyline points="15 18 9 12 15 6" />
  </SvgIcon>
);

export const MinusIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </SvgIcon>
);

export const SquareIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <rect x="5" y="5" width="14" height="14" rx="1" />
  </SvgIcon>
);

export const XIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </SvgIcon>
);

export const MenuIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </SvgIcon>
);

export const PlayIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </SvgIcon>
);

export const PauseIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </SvgIcon>
);

export const StopIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <rect x="5" y="5" width="14" height="14" rx="1" />
  </SvgIcon>
);

export const DownloadIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </SvgIcon>
);

export const PlusIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </SvgIcon>
);

export const SearchIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </SvgIcon>
);

export const SoundIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </SvgIcon>
);

export const KeyIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </SvgIcon>
);

export const InfoIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </SvgIcon>
);

export const BellIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </SvgIcon>
);

export const PaletteIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="13.5" cy="6.5" r=".5" fill={color} />
    <circle cx="17.5" cy="10.5" r=".5" fill={color} />
    <circle cx="8.5" cy="7.5" r=".5" fill={color} />
    <circle cx="6.5" cy="12.5" r=".5" fill={color} />
    <path d="M12 2C6.5 2 2 6.14 2 11.5 2 16.28 6.27 20 12 20a2 2 0 0 0 2-2 2 2 0 0 1 2-2h2.5a4.5 4.5 0 0 0 4.5-4.5C23 6.14 18.5 2 12 2z" />
  </SvgIcon>
);

export const BotIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </SvgIcon>
);

export const ScrollIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
    <path d="M19 17V5a2 2 0 0 0-2-2H4" />
  </SvgIcon>
);

export const TrashIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </SvgIcon>
);

export const HeartIcon: React.FC<IconProps> = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </SvgIcon>
);

export const LogoIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 7h6M9 11h4" />
  </svg>
);