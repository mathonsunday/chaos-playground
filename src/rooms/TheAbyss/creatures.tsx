import { CSSProperties } from 'react';

interface CreatureProps {
  style?: CSSProperties;
  glowIntensity?: number;
  hue?: number;
}

// Anglerfish - the iconic deep sea predator with bioluminescent lure
export function Anglerfish({ style, glowIntensity = 0.8, hue = 200 }: CreatureProps) {
  return (
    <svg 
      viewBox="0 0 200 120" 
      style={style}
      className="abyss-creature anglerfish"
    >
      <defs>
        <radialGradient id="lure-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue}, 80%, 80%)`} stopOpacity={glowIntensity} />
          <stop offset="50%" stopColor={`hsl(${hue}, 70%, 50%)`} stopOpacity={glowIntensity * 0.5} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="angler-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2535" />
          <stop offset="50%" stopColor="#1a1520" />
          <stop offset="100%" stopColor="#0a0810" />
        </linearGradient>
        <filter id="angler-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Lure glow */}
      <circle cx="45" cy="15" r="25" fill="url(#lure-glow)" />
      
      {/* Illicium (fishing rod appendage) */}
      <path
        d="M 80 45 Q 60 30, 48 20"
        stroke="#3a3040"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Esca (lure bulb) */}
      <circle cx="45" cy="18" r="6" fill={`hsl(${hue}, 70%, 70%)`} filter="url(#angler-glow)" />
      <circle cx="44" cy="16" r="2" fill={`hsl(${hue}, 60%, 90%)`} />
      
      {/* Main body */}
      <ellipse cx="110" cy="60" rx="55" ry="40" fill="url(#angler-body)" />
      
      {/* Mouth */}
      <path
        d="M 60 50 Q 55 60, 60 75 Q 75 65, 60 50"
        fill="#0a0508"
        stroke="#2a2030"
        strokeWidth="1"
      />
      
      {/* Teeth - upper */}
      <path d="M 62 52 L 58 58 L 64 55 Z" fill="#c8c0b8" />
      <path d="M 67 50 L 62 60 L 69 54 Z" fill="#d0c8c0" />
      <path d="M 73 49 L 70 58 L 76 52 Z" fill="#c8c0b8" />
      
      {/* Teeth - lower */}
      <path d="M 62 73 L 58 66 L 64 70 Z" fill="#c8c0b8" />
      <path d="M 68 74 L 65 65 L 71 71 Z" fill="#d0c8c0" />
      
      {/* Eye */}
      <circle cx="85" cy="48" r="8" fill="#1a1518" />
      <circle cx="85" cy="48" r="5" fill="#252030" />
      <circle cx="83" cy="46" r="2" fill={`hsl(${hue}, 50%, 60%)`} opacity="0.8" />
      
      {/* Dorsal fin */}
      <path
        d="M 100 22 Q 110 30, 120 25 Q 125 35, 135 28 Q 130 42, 120 40"
        fill="#1a1520"
        opacity="0.8"
      />
      
      {/* Pectoral fin */}
      <ellipse cx="95" cy="80" rx="15" ry="8" fill="#1a1520" opacity="0.7" 
        transform="rotate(-20 95 80)" />
      
      {/* Tail */}
      <path
        d="M 160 55 Q 180 45, 185 60 Q 180 75, 160 65"
        fill="#1a1520"
      />
      
      {/* Photophores (bioluminescent spots) */}
      <circle cx="90" cy="70" r="2" fill={`hsl(${hue}, 60%, 60%)`} opacity="0.6" />
      <circle cx="105" cy="78" r="1.5" fill={`hsl(${hue}, 60%, 60%)`} opacity="0.5" />
      <circle cx="125" cy="75" r="2" fill={`hsl(${hue}, 60%, 60%)`} opacity="0.4" />
    </svg>
  );
}

// Viperfish - elongated with huge fangs and photophores
export function Viperfish({ style, glowIntensity = 0.7, hue = 220 }: CreatureProps) {
  return (
    <svg 
      viewBox="0 0 240 80" 
      style={style}
      className="abyss-creature viperfish"
    >
      <defs>
        <linearGradient id="viper-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#252535" />
          <stop offset="50%" stopColor="#151520" />
          <stop offset="100%" stopColor="#0a0a10" />
        </linearGradient>
        <filter id="photophore-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Main body - elongated */}
      <path
        d="M 30 40 Q 50 20, 100 25 Q 150 20, 190 35 Q 210 40, 230 38 
           Q 210 45, 190 45 Q 150 55, 100 50 Q 50 55, 30 40"
        fill="url(#viper-body)"
      />
      
      {/* Head */}
      <ellipse cx="35" cy="40" rx="20" ry="18" fill="#1a1a25" />
      
      {/* Mouth - massive with fangs */}
      <path
        d="M 15 35 Q 10 40, 15 48 L 40 45 L 40 38 Z"
        fill="#050508"
      />
      
      {/* Upper fangs */}
      <path d="M 18 36 L 12 48 L 20 40 Z" fill="#e8e0d8" />
      <path d="M 25 35 L 22 52 L 28 38 Z" fill="#e0d8d0" />
      <path d="M 33 36 L 32 48 L 36 38 Z" fill="#e8e0d8" />
      
      {/* Lower fangs */}
      <path d="M 20 47 L 16 35 L 23 44 Z" fill="#e0d8d0" />
      <path d="M 30 48 L 30 36 L 34 45 Z" fill="#e8e0d8" />
      
      {/* Eye - large */}
      <circle cx="45" cy="35" r="7" fill="#101015" />
      <circle cx="45" cy="35" r="4" fill="#1a1a25" />
      <circle cx="43" cy="33" r="1.5" fill={`hsl(${hue}, 50%, 70%)`} opacity="0.9" />
      
      {/* Dorsal fin */}
      <path
        d="M 70 22 L 75 10 L 85 20 L 95 8 L 100 22"
        fill="#151520"
        opacity="0.8"
      />
      
      {/* Tail fin */}
      <path
        d="M 225 38 Q 240 30, 238 40 Q 240 50, 225 42"
        fill="#151520"
      />
      
      {/* Photophores along body */}
      {[60, 80, 100, 120, 140, 160, 180].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={40 + Math.sin(i) * 3}
          r={1.5}
          fill={`hsl(${hue}, 70%, 70%)`}
          opacity={glowIntensity * (0.5 + Math.random() * 0.3)}
          filter="url(#photophore-glow)"
        />
      ))}
      
      {/* Chin barbel with light */}
      <path
        d="M 35 52 Q 30 65, 25 70"
        stroke="#252530"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="25" cy="72" r="3" fill={`hsl(${hue}, 70%, 65%)`} filter="url(#photophore-glow)" opacity={glowIntensity} />
    </svg>
  );
}

// Deep sea jellyfish - ethereal and translucent
export function DeepJellyfish({ style, glowIntensity = 0.6, hue = 280 }: CreatureProps) {
  return (
    <svg 
      viewBox="0 0 100 160" 
      style={style}
      className="abyss-creature jellyfish"
    >
      <defs>
        <radialGradient id="jelly-bell" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={`hsla(${hue}, 50%, 70%, 0.4)`} />
          <stop offset="50%" stopColor={`hsla(${hue}, 40%, 50%, 0.25)`} />
          <stop offset="100%" stopColor={`hsla(${hue}, 30%, 30%, 0.1)`} />
        </radialGradient>
        <linearGradient id="tentacle-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`hsla(${hue}, 50%, 60%, 0.5)`} />
          <stop offset="100%" stopColor={`hsla(${hue}, 40%, 40%, 0.1)`} />
        </linearGradient>
        <filter id="jelly-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer glow */}
      <ellipse cx="50" cy="35" rx="45" ry="35" fill={`hsla(${hue}, 60%, 60%, ${glowIntensity * 0.15})`} filter="url(#jelly-glow)" />
      
      {/* Bell */}
      <path
        d="M 10 40 Q 10 10, 50 8 Q 90 10, 90 40 Q 85 50, 50 48 Q 15 50, 10 40"
        fill="url(#jelly-bell)"
        stroke={`hsla(${hue}, 50%, 60%, 0.3)`}
        strokeWidth="1"
      />
      
      {/* Bell details - radial canals */}
      <path d="M 50 12 L 50 45" stroke={`hsla(${hue}, 40%, 50%, 0.2)`} strokeWidth="1" />
      <path d="M 30 18 Q 35 35, 35 45" stroke={`hsla(${hue}, 40%, 50%, 0.15)`} strokeWidth="1" />
      <path d="M 70 18 Q 65 35, 65 45" stroke={`hsla(${hue}, 40%, 50%, 0.15)`} strokeWidth="1" />
      
      {/* Gonads */}
      <ellipse cx="35" cy="30" rx="8" ry="10" fill={`hsla(${hue}, 60%, 60%, 0.3)`} />
      <ellipse cx="50" cy="32" rx="7" ry="9" fill={`hsla(${hue}, 60%, 60%, 0.35)`} />
      <ellipse cx="65" cy="30" rx="8" ry="10" fill={`hsla(${hue}, 60%, 60%, 0.3)`} />
      
      {/* Oral arms */}
      <path
        d="M 40 48 Q 35 70, 38 90 Q 32 100, 35 110"
        stroke={`hsla(${hue}, 50%, 55%, 0.4)`}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 50 50 Q 52 75, 48 95 Q 55 108, 50 120"
        stroke={`hsla(${hue}, 50%, 55%, 0.45)`}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 60 48 Q 65 70, 62 90 Q 68 100, 65 110"
        stroke={`hsla(${hue}, 50%, 55%, 0.4)`}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Trailing tentacles */}
      {[20, 30, 40, 50, 60, 70, 80].map((x, i) => (
        <path
          key={i}
          d={`M ${x} 45 Q ${x + (i % 2 ? 5 : -5)} ${80 + i * 5}, ${x} ${120 + i * 8} Q ${x + (i % 2 ? -3 : 3)} ${140 + i * 5}, ${x + (i % 2 ? 5 : -5)} ${155}`}
          stroke="url(#tentacle-grad)"
          strokeWidth={1 + (i === 3 ? 1 : 0)}
          fill="none"
          strokeLinecap="round"
          opacity={0.6 - i * 0.05}
        />
      ))}
    </svg>
  );
}

// Dragonfish - elongated with barbel and bioluminescence
export function Dragonfish({ style, glowIntensity = 0.7, hue = 190 }: CreatureProps) {
  return (
    <svg 
      viewBox="0 0 200 60" 
      style={style}
      className="abyss-creature dragonfish"
    >
      <defs>
        <linearGradient id="dragon-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1825" />
          <stop offset="50%" stopColor="#0f0d18" />
          <stop offset="100%" stopColor="#080610" />
        </linearGradient>
        <filter id="dragon-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Body - sleek and elongated */}
      <path
        d="M 20 30 Q 40 18, 80 20 L 160 25 Q 180 28, 190 30 
           Q 180 32, 160 35 L 80 38 Q 40 40, 20 30"
        fill="url(#dragon-body)"
      />
      
      {/* Head */}
      <ellipse cx="25" cy="30" rx="15" ry="12" fill="#12101a" />
      
      {/* Mouth */}
      <path
        d="M 10 28 L 5 30 L 10 33 L 25 32 L 25 29 Z"
        fill="#050408"
      />
      
      {/* Teeth */}
      <path d="M 12 29 L 8 32 L 14 30 Z" fill="#d8d0c8" />
      <path d="M 18 28 L 15 33 L 20 30 Z" fill="#e0d8d0" />
      <path d="M 14 32 L 10 28 L 16 31 Z" fill="#d8d0c8" />
      
      {/* Eye with red bioluminescence (characteristic of dragonfish) */}
      <circle cx="30" cy="26" r="5" fill="#0a0810" />
      <circle cx="30" cy="26" r="3" fill="#1a0815" />
      <circle cx="29" cy="25" r="1.5" fill="#ff3030" opacity={glowIntensity} filter="url(#dragon-glow)" />
      
      {/* Suborbital photophore (red light organ) */}
      <ellipse cx="22" cy="32" rx="3" ry="2" fill="#ff2020" opacity={glowIntensity * 0.6} filter="url(#dragon-glow)" />
      
      {/* Barbel with bioluminescent tip */}
      <path
        d="M 20 35 Q 15 50, 25 55"
        stroke="#151520"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="26" cy="56" r="4" fill={`hsl(${hue}, 70%, 60%)`} opacity={glowIntensity} filter="url(#dragon-glow)" />
      <circle cx="26" cy="56" r="2" fill={`hsl(${hue}, 60%, 80%)`} opacity={glowIntensity} />
      
      {/* Dorsal fin */}
      <path
        d="M 60 18 L 65 8 L 75 15 L 85 6 L 95 14 L 100 18"
        fill="#0f0d15"
        opacity="0.7"
      />
      
      {/* Adipose fin */}
      <ellipse cx="150" cy="22" rx="10" ry="5" fill="#0f0d15" opacity="0.6" />
      
      {/* Anal fin */}
      <path
        d="M 120 40 L 125 50 L 140 42 L 150 48 L 155 40"
        fill="#0f0d15"
        opacity="0.6"
      />
      
      {/* Tail */}
      <path
        d="M 185 28 Q 200 20, 198 30 Q 200 40, 185 32"
        fill="#0f0d15"
      />
      
      {/* Photophores along lateral line */}
      {[50, 70, 90, 110, 130, 150, 170].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={30}
          r={1}
          fill={`hsl(${hue}, 70%, 70%)`}
          opacity={glowIntensity * 0.5}
          filter="url(#dragon-glow)"
        />
      ))}
    </svg>
  );
}

// Lanternfish - small with large eyes and photophores
export function Lanternfish({ style, glowIntensity = 0.6, hue = 210 }: CreatureProps) {
  return (
    <svg 
      viewBox="0 0 80 50" 
      style={style}
      className="abyss-creature lanternfish"
    >
      <defs>
        <linearGradient id="lantern-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2840" />
          <stop offset="50%" stopColor="#1a1830" />
          <stop offset="100%" stopColor="#101020" />
        </linearGradient>
        <filter id="lantern-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Body */}
      <ellipse cx="35" cy="25" rx="25" ry="15" fill="url(#lantern-body)" />
      
      {/* Head */}
      <ellipse cx="15" cy="25" rx="12" ry="12" fill="#1a1830" />
      
      {/* Large eye (characteristic) */}
      <circle cx="12" cy="22" r="7" fill="#0a0815" />
      <circle cx="12" cy="22" r="5" fill="#151525" />
      <circle cx="10" cy="20" r="2" fill={`hsl(${hue}, 40%, 70%)`} opacity="0.8" />
      
      {/* Mouth */}
      <path d="M 3 26 Q 2 28, 5 29 L 12 28" stroke="#0a0810" strokeWidth="1.5" fill="none" />
      
      {/* Dorsal fin */}
      <path d="M 30 12 L 35 5 L 45 10" fill="#151525" opacity="0.7" />
      
      {/* Adipose fin */}
      <ellipse cx="55" cy="15" rx="5" ry="3" fill="#151525" opacity="0.6" />
      
      {/* Tail */}
      <path d="M 58 22 Q 72 15, 75 25 Q 72 35, 58 28" fill="#151525" />
      
      {/* Anal fin */}
      <path d="M 40 38 L 45 45 L 55 40" fill="#151525" opacity="0.6" />
      
      {/* Pectoral fin */}
      <ellipse cx="22" cy="32" rx="8" ry="4" fill="#151525" opacity="0.6" transform="rotate(-15 22 32)" />
      
      {/* Photophores - pattern characteristic of lanternfish */}
      <circle cx="18" cy="30" r="1.5" fill={`hsl(${hue}, 70%, 65%)`} opacity={glowIntensity} filter="url(#lantern-glow)" />
      <circle cx="28" cy="32" r="1.5" fill={`hsl(${hue}, 70%, 65%)`} opacity={glowIntensity * 0.9} filter="url(#lantern-glow)" />
      <circle cx="38" cy="30" r="1.5" fill={`hsl(${hue}, 70%, 65%)`} opacity={glowIntensity * 0.8} filter="url(#lantern-glow)" />
      <circle cx="48" cy="28" r="1.5" fill={`hsl(${hue}, 70%, 65%)`} opacity={glowIntensity * 0.7} filter="url(#lantern-glow)" />
      
      {/* Ventral photophores */}
      <circle cx="25" cy="36" r="1" fill={`hsl(${hue}, 70%, 70%)`} opacity={glowIntensity * 0.6} filter="url(#lantern-glow)" />
      <circle cx="35" cy="37" r="1" fill={`hsl(${hue}, 70%, 70%)`} opacity={glowIntensity * 0.5} filter="url(#lantern-glow)" />
    </svg>
  );
}
