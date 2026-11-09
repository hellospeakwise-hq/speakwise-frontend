'use client';

import React from 'react';

interface AwardBadgeIconProps {
  badgeId: number;
  tier: 'bronze' | 'silver' | 'gold';
  isLocked?: boolean;
  size?: number;
  className?: string;
}

export function AwardBadgeIcon({
  badgeId,
  tier,
  isLocked = false,
  size = 72,
  className = '',
}: AwardBadgeIconProps) {
  const width = size;
  const height = Math.round(size * 1.15); // Extra vertical space for ribbon tails
  const idPrefix = `award-${badgeId}-${isLocked ? 'locked' : tier}`;

  // ── Locked Theme Gradients ──────────────────────────────────────────────
  const lockedRibbonLeft = "#334155";
  const lockedRibbonRight = "#1E293B";
  const lockedRimOuter = "#475569";
  const lockedRimInner = "#1E293B";
  const lockedPlate = "#0F172A";
  const lockedEmblem = "#64748B";

  // ── BADGE 1: Genesis Speaker (Bronze Rosette with Microphone & Star) ────
  if (badgeId === 1) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 80 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md ${className}`}
      >
        <defs>
          <linearGradient id={`${idPrefix}-ribbon-left`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRibbonLeft : "#C2410C"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#7C2D12"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-ribbon-right`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRibbonLeft : "#9A3412"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#431407"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-outer`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRimOuter : "#FDBA74"} />
            <stop offset="40%" stopColor={isLocked ? lockedRibbonLeft : "#EA580C"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#9A3412"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-inner`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRimInner : "#7C2D12"} />
            <stop offset="100%" stopColor={isLocked ? lockedPlate : "#431407"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedEmblem : "#FEF08A"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonLeft : "#F59E0B"} />
          </linearGradient>
        </defs>

        {/* Ribbon Tails with V-Notch */}
        <path d="M 28 46 L 15 80 L 26 74 L 37 80 L 33 46 Z" fill={`url(#${idPrefix}-ribbon-left)`} />
        <path d="M 52 46 L 43 80 L 54 74 L 65 80 L 52 46 Z" fill={`url(#${idPrefix}-ribbon-right)`} />

        {/* Rosette Scalloped Petals (Star Ring) */}
        <g transform="translate(40, 38)">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <circle
              key={deg}
              cx={24 * Math.cos((deg * Math.PI) / 180)}
              cy={24 * Math.sin((deg * Math.PI) / 180)}
              r="6.5"
              fill={`url(#${idPrefix}-outer)`}
            />
          ))}
        </g>

        {/* Center Coin Medallion */}
        <circle cx="40" cy="38" r="24" fill={`url(#${idPrefix}-outer)`} stroke={isLocked ? "#475569" : "#FED7AA"} strokeWidth="1.5" />
        <circle cx="40" cy="38" r="20" fill={`url(#${idPrefix}-inner)`} stroke={isLocked ? "#334155" : "#F97316"} strokeWidth="1" strokeDasharray="3 2" />

        {/* Embossed Microphone Crest */}
        <g transform="translate(32, 26)">
          <rect x="5" y="3" width="6" height="11" rx="3" fill={`url(#${idPrefix}-gold)`} />
          <path d="M 3 8 C 3 13 13 13 13 8" stroke={`url(#${idPrefix}-gold)`} strokeWidth="1.75" strokeLinecap="round" fill="none" />
          <path d="M 8 13.5 V 18" stroke={`url(#${idPrefix}-gold)`} strokeWidth="1.75" strokeLinecap="round" />
          <path d="M 5 18 H 11" stroke={`url(#${idPrefix}-gold)`} strokeWidth="1.75" strokeLinecap="round" />
        </g>

        {isLocked ? (
          <circle cx="40" cy="38" r="7" fill="#0F172A" stroke="#475569" strokeWidth="1" />
        ) : (
          <polygon points="40,19 41.5,22.5 45,23 42.5,25.5 43,29 40,27 37,29 37.5,25.5 35,23 38.5,22.5" fill="#FEF08A" />
        )}
      </svg>
    );
  }

  // ── BADGE 2: In Demand (Bronze Starburst Rosette with Star Crest) ────────
  if (badgeId === 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 80 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md ${className}`}
      >
        <defs>
          <linearGradient id={`${idPrefix}-ribbon`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRibbonLeft : "#EA580C"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#7C2D12"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-bronze`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRimOuter : "#FDBA74"} />
            <stop offset="45%" stopColor={isLocked ? lockedRibbonLeft : "#D97706"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#78350F"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-star`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedEmblem : "#FEF08A"} />
            <stop offset="50%" stopColor={isLocked ? lockedRibbonLeft : "#FBBF24"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#D97706"} />
          </linearGradient>
        </defs>

        {/* Ribbon Tails */}
        <path d="M 28 46 L 15 80 L 26 74 L 37 80 L 33 46 Z" fill={`url(#${idPrefix}-ribbon)`} />
        <path d="M 52 46 L 43 80 L 54 74 L 65 80 L 52 46 Z" fill={`url(#${idPrefix}-ribbon)`} />

        {/* Scalloped Medallion */}
        <circle cx="40" cy="38" r="27" fill={`url(#${idPrefix}-bronze)`} stroke={isLocked ? "#475569" : "#FED7AA"} strokeWidth="1.5" />
        <circle cx="40" cy="38" r="21" fill={isLocked ? lockedPlate : "#431407"} stroke={isLocked ? "#334155" : "#EA580C"} strokeWidth="1" />

        {/* Center Star Crest */}
        <polygon
          points="40,24 43.5,33 53,33.5 45.5,39.5 48.5,49 40,43.5 31.5,49 34.5,39.5 27,33.5 36.5,33"
          fill={`url(#${idPrefix}-star)`}
          stroke={isLocked ? "#475569" : "#FFFBEB"}
          strokeWidth="0.75"
        />
        {isLocked ? (
          <g transform="translate(36, 34)">
            <rect x="0" y="3" width="8" height="6" rx="1.5" fill="#94A3B8" />
            <path d="M 2 3 V 1.5 C 2 0.5 3 0 4 0 C 5 0 6 0.5 6 1.5 V 3" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        ) : (
          <circle cx="40" cy="38" r="4" fill="#FFFBEB" opacity="0.6" />
        )}
      </svg>
    );
  }

  // ── BADGE 3: Crowd Catalyst (Silver Rosette with Royal Blue Ribbons) ─────
  if (badgeId === 3) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 80 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md ${className}`}
      >
        <defs>
          <linearGradient id={`${idPrefix}-blue-ribbon`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRibbonLeft : "#2563EB"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#1E3A8A"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRimOuter : "#FFFFFF"} />
            <stop offset="35%" stopColor={isLocked ? lockedRibbonLeft : "#CBD5E1"} />
            <stop offset="70%" stopColor={isLocked ? lockedRibbonRight : "#94A3B8"} />
            <stop offset="100%" stopColor={isLocked ? lockedPlate : "#64748B"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-silver-plate`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRibbonRight : "#1E293B"} />
            <stop offset="100%" stopColor={isLocked ? lockedPlate : "#0F172A"} />
          </linearGradient>
        </defs>

        {/* Ribbon Tails with Silver/Blue Edge */}
        <path d="M 28 46 L 15 80 L 26 74 L 37 80 L 33 46 Z" fill={`url(#${idPrefix}-blue-ribbon)`} stroke={isLocked ? "#475569" : "#93C5FD"} strokeWidth="0.75" />
        <path d="M 52 46 L 43 80 L 54 74 L 65 80 L 52 46 Z" fill={`url(#${idPrefix}-blue-ribbon)`} stroke={isLocked ? "#475569" : "#93C5FD"} strokeWidth="0.75" />

        {/* Scalloped Silver Rosette Rim */}
        <g transform="translate(40, 38)">
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
            <circle
              key={deg}
              cx={24 * Math.cos((deg * Math.PI) / 180)}
              cy={24 * Math.sin((deg * Math.PI) / 180)}
              r="5.5"
              fill={`url(#${idPrefix}-silver)`}
            />
          ))}
        </g>

        {/* Center Silver Medallion */}
        <circle cx="40" cy="38" r="23" fill={`url(#${idPrefix}-silver)`} stroke={isLocked ? "#475569" : "#F8FAFC"} strokeWidth="1.5" />
        <circle cx="40" cy="38" r="19" fill={`url(#${idPrefix}-silver-plate)`} stroke={isLocked ? "#334155" : "#94A3B8"} strokeWidth="1" strokeDasharray="3 2" />

        {/* Crowd Users Crest */}
        <g transform="translate(29, 27)">
          <circle cx="11" cy="7" r="3" fill={isLocked ? "#64748B" : "#E2E8F0"} />
          <path d="M 6 17 C 6 13 16 13 16 17" fill={isLocked ? "#64748B" : "#E2E8F0"} />

          <circle cx="5" cy="9" r="2" fill={isLocked ? "#475569" : "#94A3B8"} />
          <path d="M 2 17 C 2 14.5 9 14.5 9 17" fill={isLocked ? "#475569" : "#94A3B8"} />

          <circle cx="17" cy="9" r="2" fill={isLocked ? "#475569" : "#94A3B8"} />
          <path d="M 13 17 C 13 14.5 20 14.5 20 17" fill={isLocked ? "#475569" : "#94A3B8"} />
        </g>

        {isLocked && (
          <g transform="translate(36, 42)">
            <rect x="0" y="3" width="8" height="6" rx="1.5" fill="#94A3B8" />
            <path d="M 2 3 V 1.5 C 2 0.5 3 0 4 0 C 5 0 6 0.5 6 1.5 V 3" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        )}
      </svg>
    );
  }

  // ── BADGE 4: Road Warrior (Silver Medallion with Teal Ribbons) ───────────
  if (badgeId === 4) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 80 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md ${className}`}
      >
        <defs>
          <linearGradient id={`${idPrefix}-teal-ribbon`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRibbonLeft : "#0D9488"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#115E59"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-silver-2`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRimOuter : "#FFFFFF"} />
            <stop offset="40%" stopColor={isLocked ? lockedRibbonLeft : "#CBD5E1"} />
            <stop offset="100%" stopColor={isLocked ? lockedPlate : "#64748B"} />
          </linearGradient>
        </defs>

        {/* Teal Ribbon Tails */}
        <path d="M 28 46 L 15 80 L 26 74 L 37 80 L 33 46 Z" fill={`url(#${idPrefix}-teal-ribbon)`} stroke={isLocked ? "#475569" : "#5EEAD4"} strokeWidth="0.75" />
        <path d="M 52 46 L 43 80 L 54 74 L 65 80 L 52 46 Z" fill={`url(#${idPrefix}-teal-ribbon)`} stroke={isLocked ? "#475569" : "#5EEAD4"} strokeWidth="0.75" />

        {/* Silver Medallion */}
        <circle cx="40" cy="38" r="26" fill={`url(#${idPrefix}-silver-2)`} stroke={isLocked ? "#475569" : "#F8FAFC"} strokeWidth="1.5" />
        <circle cx="40" cy="38" r="20" fill={isLocked ? lockedPlate : "#042F2E"} stroke={isLocked ? "#334155" : "#14B8A6"} strokeWidth="1" />

        {/* Airplane & Compass Crest */}
        <g transform="translate(30, 27)" fill={isLocked ? "#64748B" : "#5EEAD4"}>
          <path d="M 10 2 L 13 8 L 19 10 L 13 12 L 10 18 L 7 12 L 1 10 L 7 8 Z" fill={isLocked ? "#94A3B8" : "#F8FAFC"} />
          <circle cx="10" cy="10" r="2" fill={isLocked ? "#334155" : "#0D9488"} />
        </g>

        {isLocked && (
          <g transform="translate(36, 42)">
            <rect x="0" y="3" width="8" height="6" rx="1.5" fill="#94A3B8" />
            <path d="M 2 3 V 1.5 C 2 0.5 3 0 4 0 C 5 0 6 0.5 6 1.5 V 3" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        )}
      </svg>
    );
  }

  // ── BADGE 5: Five-Star Orator (Silver & Gold Dual Ribbon Rosette) ────────
  if (badgeId === 5) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 80 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md ${className}`}
      >
        <defs>
          <linearGradient id={`${idPrefix}-purple-ribbon`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRibbonLeft : "#7E22CE"} />
            <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#4C1D95"} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-gold-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLocked ? lockedRimOuter : "#FEF08A"} />
            <stop offset="50%" stopColor={isLocked ? lockedRibbonLeft : "#E2E8F0"} />
            <stop offset="100%" stopColor={isLocked ? lockedPlate : "#F59E0B"} />
          </linearGradient>
        </defs>

        {/* Ribbon Tails */}
        <path d="M 28 46 L 15 80 L 26 74 L 37 80 L 33 46 Z" fill={`url(#${idPrefix}-purple-ribbon)`} stroke={isLocked ? "#475569" : "#C084FC"} strokeWidth="0.75" />
        <path d="M 52 46 L 43 80 L 54 74 L 65 80 L 52 46 Z" fill={`url(#${idPrefix}-purple-ribbon)`} stroke={isLocked ? "#475569" : "#C084FC"} strokeWidth="0.75" />

        {/* Scalloped Rosette Rim */}
        <circle cx="40" cy="38" r="27" fill={`url(#${idPrefix}-gold-silver)`} stroke={isLocked ? "#475569" : "#FFFFFF"} strokeWidth="1.5" />
        <circle cx="40" cy="38" r="21" fill={isLocked ? lockedPlate : "#2E1065"} stroke={isLocked ? "#334155" : "#A855F7"} strokeWidth="1" />

        {/* 5 Stars Arch */}
        <g transform="translate(23, 26)">
          <polygon points="17,6 18.5,10 23,10.5 19.5,13.5 20.5,18 17,15.5 13.5,18 14.5,13.5 11,10.5 15.5,10" fill={isLocked ? "#94A3B8" : "#FACC15"} />
          <polygon points="9,9 10,11.5 12.5,12 10.5,14 11,16.5 9,15 7,16.5 7.5,14 5.5,12 8,11.5" fill={isLocked ? "#64748B" : "#E2E8F0"} />
          <polygon points="25,9 26,11.5 28.5,12 26.5,14 27,16.5 25,15 23,16.5 23.5,14 21.5,12 24,11.5" fill={isLocked ? "#64748B" : "#E2E8F0"} />
          <polygon points="4,15 4.8,17 7,17.4 5.4,19 5.8,21 4,19.8 2.2,21 2.6,19 1,17.4 3.2,17" fill={isLocked ? "#475569" : "#CBD5E1"} />
          <polygon points="30,15 30.8,17 33,17.4 31.4,19 31.8,21 30,19.8 28.2,21 28.6,19 27,17.4 29.2,17" fill={isLocked ? "#475569" : "#CBD5E1"} />
        </g>

        {isLocked && (
          <g transform="translate(36, 42)">
            <rect x="0" y="3" width="8" height="6" rx="1.5" fill="#94A3B8" />
            <path d="M 2 3 V 1.5 C 2 0.5 3 0 4 0 C 5 0 6 0.5 6 1.5 V 3" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          </g>
        )}
      </svg>
    );
  }

  // ── BADGE 6: Keynote Pioneer (Gold Trophy Cup with Laurel Wreath) ────────
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 group-hover:scale-105 filter drop-shadow-lg ${className}`}
    >
      <defs>
        <linearGradient id={`${idPrefix}-gold-ribbon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLocked ? lockedRibbonLeft : "#F59E0B"} />
          <stop offset="100%" stopColor={isLocked ? lockedRibbonRight : "#B45309"} />
        </linearGradient>
        <linearGradient id={`${idPrefix}-gold-trophy`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLocked ? lockedRimOuter : "#FFFBEB"} />
          <stop offset="30%" stopColor={isLocked ? lockedRibbonLeft : "#FDE047"} />
          <stop offset="70%" stopColor={isLocked ? lockedRibbonRight : "#EAB308"} />
          <stop offset="100%" stopColor={isLocked ? lockedPlate : "#A16207"} />
        </linearGradient>
      </defs>

      {/* Gold Ribbon Tails with V-Notch */}
      <path d="M 28 46 L 15 80 L 26 74 L 37 80 L 33 46 Z" fill={`url(#${idPrefix}-gold-ribbon)`} stroke={isLocked ? "#475569" : "#FDE68A"} strokeWidth="0.75" />
      <path d="M 52 46 L 43 80 L 54 74 L 65 80 L 52 46 Z" fill={`url(#${idPrefix}-gold-ribbon)`} stroke={isLocked ? "#475569" : "#FDE68A"} strokeWidth="0.75" />

      {/* Laurel Wreath Medallion */}
      <circle cx="40" cy="38" r="28" fill={isLocked ? lockedPlate : "#78350F"} opacity="0.4" />
      <circle cx="40" cy="38" r="26" fill={`url(#${idPrefix}-gold-trophy)`} stroke={isLocked ? "#475569" : "#FEF08A"} strokeWidth="1.5" />
      <circle cx="40" cy="38" r="20" fill={isLocked ? lockedPlate : "#451A03"} stroke={isLocked ? "#334155" : "#F59E0B"} strokeWidth="1" strokeDasharray="3 2" />

      {/* Golden Trophy Cup Crest */}
      <g transform="translate(28, 25)">
        <path d="M 5 3 H 19 V 11 C 19 16 14 18 12 18 C 10 18 5 16 5 11 Z" fill={`url(#${idPrefix}-gold-trophy)`} />
        <path d="M 5 5 C 1 5 1 12 5 12" stroke={isLocked ? "#64748B" : "#FDE047"} strokeWidth="1.75" fill="none" strokeLinecap="round" />
        <path d="M 19 5 C 23 5 23 12 19 12" stroke={isLocked ? "#64748B" : "#FDE047"} strokeWidth="1.75" fill="none" strokeLinecap="round" />
        <path d="M 10 18 V 21 H 14 V 18" fill={isLocked ? "#475569" : "#F59E0B"} />
        <rect x="7" y="21" width="10" height="3" rx="1" fill={`url(#${idPrefix}-gold-trophy)`} />
        <polygon points="12,6 14,8 16,5 15,10 9,10 8,5 10,8" fill={isLocked ? "#94A3B8" : "#FFFBEB"} />
      </g>

      {isLocked && (
        <g transform="translate(36, 42)">
          <rect x="0" y="3" width="8" height="6" rx="1.5" fill="#94A3B8" />
          <path d="M 2 3 V 1.5 C 2 0.5 3 0 4 0 C 5 0 6 0.5 6 1.5 V 3" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
        </g>
      )}
    </svg>
  );
}
