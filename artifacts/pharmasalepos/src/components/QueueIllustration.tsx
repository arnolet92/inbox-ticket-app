import React from "react";

export function QueueIllustration() {
  return (
    <div className="relative w-full h-[560px] flex items-center justify-center select-none">
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, hsl(145 48% 12% / 0.9) 0%, hsl(150 10% 4% / 0.5) 70%)",
        }}
      />

      <svg
        viewBox="0 0 560 480"
        className="relative z-10 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: 560 }}
      >
        <defs>
          {/* Scan beam gradient */}
          <linearGradient id="scanBeam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4caf50" stopOpacity="0" />
            <stop offset="50%" stopColor="#4caf50" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
          </linearGradient>

          {/* Person gradient */}
          <linearGradient id="person1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id="person2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="person3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="person4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Kiosk gradient */}
          <linearGradient id="kioskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a4a2e" />
            <stop offset="100%" stopColor="#0d2218" />
          </linearGradient>

          {/* Screen glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="screenClip">
            <rect x="72" y="120" width="86" height="55" rx="4" />
          </clipPath>
        </defs>

        {/* Ground line */}
        <rect x="30" y="370" width="500" height="3" rx="2" fill="#4caf50" opacity="0.15" />
        <rect x="30" y="373" width="500" height="1" rx="1" fill="#4caf50" opacity="0.06" />

        {/* === SCANNING KIOSK === */}
        {/* Kiosk base */}
        <rect x="52" y="230" width="120" height="140" rx="10" fill="url(#kioskGrad)" stroke="#4caf50" strokeWidth="1.5" strokeOpacity="0.5" />
        {/* Kiosk counter top */}
        <rect x="44" y="218" width="136" height="18" rx="6" fill="#1f6b42" stroke="#4caf50" strokeWidth="1" strokeOpacity="0.4" />
        {/* Screen */}
        <rect x="72" y="120" width="86" height="55" rx="6" fill="#0a1f14" stroke="#4caf50" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Scan animation on screen */}
        <rect x="72" y="120" width="86" height="55" rx="4" fill="url(#scanBeam)" clipPath="url(#screenClip)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,-55;0,55;0,-55"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Grid lines on screen (barcode style) */}
        {[0,1,2,3,4,5,6,7].map((i) => (
          <rect key={i} x={76 + i * 9} y="125" width={i % 3 === 0 ? 4 : 2} height="45" fill="#4caf50" opacity={i % 3 === 0 ? 0.5 : 0.25} rx="1" />
        ))}

        {/* Screen glow effect */}
        <rect x="72" y="120" width="86" height="55" rx="6" fill="none" stroke="#4caf50" strokeWidth="1" opacity="0.8" filter="url(#glow)" />

        {/* Kiosk screen pole */}
        <rect x="109" y="175" width="6" height="55" rx="3" fill="#1f6b42" />

        {/* Scan indicator light */}
        <circle cx="115" cy="300" r="6" fill="#4caf50" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="115" cy="300" r="10" fill="#4caf50" opacity="0.15">
          <animate attributeName="r" values="6;14;6" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0;0.15" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Kiosk logo text */}
        <text x="115" y="258" textAnchor="middle" fill="#4caf50" fontSize="9" fontFamily="monospace" opacity="0.8">INBOX</text>
        <text x="115" y="269" textAnchor="middle" fill="#4caf50" fontSize="9" fontFamily="monospace" opacity="0.8">TICKET</text>

        {/* Gate bars */}
        <rect x="42" y="210" width="3" height="160" rx="2" fill="#4caf50" opacity="0.3" />
        <rect x="179" y="210" width="3" height="160" rx="2" fill="#4caf50" opacity="0.3" />

        {/* === PERSON 1 — At scanner, holding phone === */}
        <g transform="translate(195,200)">
          {/* Body */}
          <ellipse cx="30" cy="95" rx="22" ry="58" fill="url(#person1)" opacity="0.9" />
          {/* Head */}
          <circle cx="30" cy="28" r="22" fill="url(#person1)" />
          {/* Arm holding phone */}
          <path d="M8 75 Q-8 65 -12 50" stroke="#d1fae5" strokeWidth="12" strokeLinecap="round" fill="none" />
          {/* Phone */}
          <rect x="-22" y="36" width="14" height="22" rx="3" fill="#0d2218" stroke="#4caf50" strokeWidth="1.5" />
          <rect x="-20" y="39" width="10" height="14" rx="1" fill="#4caf50" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </rect>
          {/* Scan beam from phone */}
          <line x1="-14" y1="46" x2="52" y2="155" stroke="#4caf50" strokeWidth="1" opacity="0.4" strokeDasharray="4 3">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" />
          </line>
          {/* Ticket in other hand */}
          <rect x="50" y="60" width="28" height="20" rx="3" fill="white" opacity="0.85" />
          <rect x="56" y="63" width="6" height="14" rx="1" fill="#10b981" opacity="0.7" />
          <line x1="66" y1="65" x2="74" y2="65" stroke="#6ee7b7" strokeWidth="1.5" />
          <line x1="66" y1="69" x2="72" y2="69" stroke="#6ee7b7" strokeWidth="1.5" />
          <line x1="66" y1="73" x2="74" y2="73" stroke="#6ee7b7" strokeWidth="1.5" />
        </g>

        {/* Check icon (scan success) */}
        <g filter="url(#glow)">
          <circle cx="185" cy="215" r="14" fill="#4caf50" opacity="0.15">
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="185" cy="215" r="10" fill="#4caf50" opacity="0.8">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <polyline points="179,215 183,220 192,208" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0;1;1;0;1" dur="2s" repeatCount="indefinite" />
          </polyline>
        </g>

        {/* === PERSON 2 — waiting, holding ticket up === */}
        <g transform="translate(275,220)">
          <ellipse cx="28" cy="90" rx="20" ry="52" fill="url(#person2)" opacity="0.85" />
          <circle cx="28" cy="26" r="20" fill="url(#person2)" />
          {/* Arm raised with ticket */}
          <path d="M48 60 Q62 40 58 20" stroke="#a7f3d0" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* Floating ticket */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="2.5s" repeatCount="indefinite" additive="sum" />
            <rect x="44" y="-2" width="32" height="22" rx="3" fill="white" opacity="0.9" />
            <rect x="50" y="1" width="7" height="16" rx="1" fill="#10b981" opacity="0.7" />
            <line x1="61" y1="4" x2="71" y2="4" stroke="#6ee7b7" strokeWidth="1.5" />
            <line x1="61" y1="8" x2="69" y2="8" stroke="#6ee7b7" strokeWidth="1.5" />
            <line x1="61" y1="12" x2="71" y2="12" stroke="#6ee7b7" strokeWidth="1.5" />
          </g>
        </g>

        {/* === PERSON 3 — waiting, looking at phone === */}
        <g transform="translate(348,230)">
          <ellipse cx="26" cy="88" rx="19" ry="50" fill="url(#person3)" opacity="0.8" />
          <circle cx="26" cy="26" r="19" fill="url(#person3)" />
          {/* Head slightly down (looking at phone) */}
          <path d="M6 72 Q-5 68 -5 56" stroke="#6ee7b7" strokeWidth="10" strokeLinecap="round" fill="none" />
          <rect x="-18" y="48" width="15" height="22" rx="3" fill="#0d2218" stroke="#4caf50" strokeWidth="1.5" />
          <rect x="-16" y="51" width="11" height="13" rx="1" fill="#4caf50" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* === PERSON 4 — chatting, relaxed === */}
        <g transform="translate(415,238)">
          <ellipse cx="24" cy="84" rx="18" ry="48" fill="url(#person4)" opacity="0.75" />
          <circle cx="24" cy="25" r="18" fill="url(#person4)" />
          <path d="M42 65 Q54 55 52 44" stroke="#34d399" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M42 80 Q54 85 55 96" stroke="#34d399" strokeWidth="9" strokeLinecap="round" fill="none" />
        </g>

        {/* === PERSON 5 — back of queue === */}
        <g transform="translate(476,248)">
          <ellipse cx="22" cy="78" rx="16" ry="44" fill="#059669" opacity="0.65" />
          <circle cx="22" cy="24" r="16" fill="#059669" />
        </g>

        {/* Dotted queue line on ground */}
        <line x1="182" y1="372" x2="500" y2="372" stroke="#4caf50" strokeWidth="2" strokeDasharray="10 8" opacity="0.25" />

        {/* Floating ticket icons */}
        <g opacity="0.6">
          <g transform="translate(360,130)">
            <animateTransform attributeName="transform" type="translate" values="360,130;356,115;360,130" dur="4s" repeatCount="indefinite" />
            <rect width="36" height="24" rx="4" fill="none" stroke="#4caf50" strokeWidth="1.5" />
            <circle cx="0" cy="12" r="5" fill="#0d2218" stroke="#4caf50" strokeWidth="1.5" />
            <circle cx="36" cy="12" r="5" fill="#0d2218" stroke="#4caf50" strokeWidth="1.5" />
            <line x1="10" y1="12" x2="26" y2="12" stroke="#4caf50" strokeWidth="1" strokeDasharray="3 2" />
          </g>
        </g>

        <g opacity="0.5">
          <g transform="translate(440,105)">
            <animateTransform attributeName="transform" type="translate" values="440,105;444,92;440,105" dur="5s" repeatCount="indefinite" />
            <rect width="28" height="18" rx="3" fill="none" stroke="#6ee7b7" strokeWidth="1.2" />
            <circle cx="0" cy="9" r="4" fill="#0d2218" stroke="#6ee7b7" strokeWidth="1.2" />
            <circle cx="28" cy="9" r="4" fill="#0d2218" stroke="#6ee7b7" strokeWidth="1.2" />
          </g>
        </g>

        {/* Stars / sparkles */}
        {[[158, 95], [310, 88], [490, 130]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="2" fill="#4caf50">
              <animate attributeName="opacity" values="0;1;0" dur={`${2 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
            </circle>
          </g>
        ))}

        {/* Label */}
        <rect x="130" y="415" width="300" height="34" rx="17" fill="#4caf50" fillOpacity="0.08" stroke="#4caf50" strokeWidth="1" strokeOpacity="0.3" />
        <text x="280" y="437" textAnchor="middle" fill="#4caf50" fontSize="12" fontFamily="'DM Sans', sans-serif" fontWeight="600" opacity="0.8">
          Réservez · Scannez · Profitez
        </text>
      </svg>
    </div>
  );
}
