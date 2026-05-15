"use client"

// Original SVG mascots — no traced or licensed artwork.
// Left: a stack of poker chips spilling out of an open chest.
// Right: a fan of playing cards rising from a glowing crystal ball.

export function ChestMascot() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="mascot-left"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="chestGlow" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#ffd84a" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#ffb700" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffb700" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b3a1c" />
          <stop offset="100%" stopColor="#2c1a08" />
        </linearGradient>
        <linearGradient id="chestBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a8650" />
          <stop offset="100%" stopColor="#5e4a20" />
        </linearGradient>
        <linearGradient id="chipA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe25c" />
          <stop offset="100%" stopColor="#ff8a18" />
        </linearGradient>
        <linearGradient id="chipB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9eea3a" />
          <stop offset="100%" stopColor="#5aa615" />
        </linearGradient>
      </defs>

      {/* Soft golden glow under the chest */}
      <ellipse cx="120" cy="190" rx="110" ry="36" fill="url(#chestGlow)" />

      {/* Chest base */}
      <rect x="40" y="120" width="160" height="80" rx="6" fill="url(#chestWood)" />
      <rect x="40" y="148" width="160" height="10" fill="url(#chestBand)" />

      {/* Chest lid (open, tilted back) */}
      <g transform="translate(120 120) rotate(-22) translate(-120 -120)">
        <path
          d="M40 120 Q120 70 200 120 L200 132 L40 132 Z"
          fill="url(#chestWood)"
          stroke="#1a0d04"
          strokeWidth="1"
        />
        <rect x="40" y="118" width="160" height="6" fill="url(#chestBand)" />
        {/* keyhole */}
        <circle cx="120" cy="108" r="4" fill="#1a0d04" />
        <rect x="118" y="108" width="4" height="8" fill="#1a0d04" />
      </g>

      {/* Stack of chips spilling out */}
      <g>
        {/* chip stack center */}
        <ellipse cx="120" cy="140" rx="22" ry="6" fill="#c97f00" />
        <rect x="98" y="120" width="44" height="20" fill="url(#chipA)" />
        <ellipse cx="120" cy="120" rx="22" ry="6" fill="url(#chipA)" stroke="#fff6c0" strokeWidth="1.5" />
        <text x="120" y="125" textAnchor="middle" fontSize="10" fontWeight="900" fill="#3a1d00">$</text>

        {/* chip stack right */}
        <ellipse cx="158" cy="148" rx="18" ry="5" fill="#5aa615" />
        <rect x="140" y="132" width="36" height="16" fill="url(#chipB)" />
        <ellipse cx="158" cy="132" rx="18" ry="5" fill="url(#chipB)" stroke="#d6f59c" strokeWidth="1.5" />

        {/* loose chip front */}
        <ellipse cx="92" cy="170" rx="20" ry="6" fill="url(#chipA)" stroke="#fff6c0" strokeWidth="1.5" />

        {/* loose chip tilted */}
        <g transform="translate(170 175) rotate(35)">
          <ellipse cx="0" cy="0" rx="18" ry="5" fill="url(#chipB)" stroke="#d6f59c" strokeWidth="1.5" />
        </g>
      </g>

      {/* A couple of card edges peeking out */}
      <g transform="translate(70 110) rotate(-12)">
        <rect width="22" height="32" rx="3" fill="#fff8e6" stroke="#c8b070" strokeWidth="1" />
        <text x="11" y="14" textAnchor="middle" fontSize="9" fontWeight="900" fill="#b00020">A</text>
        <text x="11" y="26" textAnchor="middle" fontSize="9" fontWeight="900" fill="#b00020">♥</text>
      </g>
      <g transform="translate(146 108) rotate(14)">
        <rect width="22" height="32" rx="3" fill="#fff8e6" stroke="#c8b070" strokeWidth="1" />
        <text x="11" y="14" textAnchor="middle" fontSize="9" fontWeight="900" fill="#1a1a1a">K</text>
        <text x="11" y="26" textAnchor="middle" fontSize="9" fontWeight="900" fill="#1a1a1a">♠</text>
      </g>
    </svg>
  )
}

export function OracleMascot() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="mascot-right"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4b6ff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#7a5cff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7a5cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orbBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9b86ff" />
          <stop offset="100%" stopColor="#3a2d8a" />
        </linearGradient>
        <linearGradient id="standG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a5a28" />
          <stop offset="100%" stopColor="#2a1c08" />
        </linearGradient>
        <linearGradient id="cardBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd84a" />
          <stop offset="100%" stopColor="#c97f00" />
        </linearGradient>
      </defs>

      {/* Ground glow */}
      <ellipse cx="120" cy="210" rx="100" ry="22" fill="url(#orbGlow)" opacity="0.7" />

      {/* Three-legged stand */}
      <path
        d="M70 200 L120 165 L170 200 L160 210 L120 180 L80 210 Z"
        fill="url(#standG)"
        stroke="#0d0703"
        strokeWidth="1"
      />
      <rect x="100" y="155" width="40" height="14" rx="3" fill="url(#standG)" />

      {/* Crystal orb glow halo */}
      <circle cx="120" cy="115" r="58" fill="url(#orbGlow)" />

      {/* Orb body */}
      <circle cx="120" cy="115" r="44" fill="url(#orbBody)" stroke="#d9cdff" strokeWidth="2" />
      {/* Orb highlight */}
      <ellipse cx="106" cy="98" rx="14" ry="9" fill="#fff" opacity="0.6" />
      <ellipse cx="138" cy="135" rx="7" ry="3" fill="#fff" opacity="0.25" />

      {/* Fan of cards rising from behind the orb */}
      <g transform="translate(120 90)">
        <g transform="rotate(-30) translate(-15 -56)">
          <rect width="30" height="44" rx="4" fill="url(#cardBack)" stroke="#fff0a8" strokeWidth="1.5" />
          <text x="15" y="27" textAnchor="middle" fontSize="20" fontWeight="900" fill="#3a1d00">?</text>
        </g>
        <g transform="rotate(-10) translate(-15 -66)">
          <rect width="30" height="44" rx="4" fill="url(#cardBack)" stroke="#fff0a8" strokeWidth="1.5" />
          <text x="15" y="27" textAnchor="middle" fontSize="20" fontWeight="900" fill="#3a1d00">?</text>
        </g>
        <g transform="rotate(10) translate(-15 -66)">
          <rect width="30" height="44" rx="4" fill="url(#cardBack)" stroke="#fff0a8" strokeWidth="1.5" />
          <text x="15" y="27" textAnchor="middle" fontSize="20" fontWeight="900" fill="#3a1d00">?</text>
        </g>
        <g transform="rotate(30) translate(-15 -56)">
          <rect width="30" height="44" rx="4" fill="url(#cardBack)" stroke="#fff0a8" strokeWidth="1.5" />
          <text x="15" y="27" textAnchor="middle" fontSize="20" fontWeight="900" fill="#3a1d00">?</text>
        </g>
      </g>

      {/* Sparkles */}
      <g fill="#fff8c8">
        <circle cx="60" cy="80" r="1.6" />
        <circle cx="180" cy="60" r="1.4" />
        <circle cx="195" cy="120" r="1.8" />
        <circle cx="48" cy="140" r="1.2" />
      </g>
    </svg>
  )
}
