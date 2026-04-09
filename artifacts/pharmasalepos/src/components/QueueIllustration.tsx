import React from "react";

export function QueueIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 400 360" className="w-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background glow */}
        <ellipse cx="200" cy="300" rx="160" ry="40" fill="hsl(145 60% 35% / 0.12)" />

        {/* Stage */}
        <rect x="60" y="200" width="280" height="20" rx="4" fill="hsl(145 40% 15%)" stroke="hsl(145 60% 35% / 0.4)" strokeWidth="1" />
        <rect x="40" y="195" width="320" height="10" rx="2" fill="hsl(145 60% 25% / 0.6)" />

        {/* Spotlights */}
        {[100, 200, 300].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="30" x2={x - 30 + i * 30} y2="195" stroke="hsl(60 100% 70% / 0.12)" strokeWidth="20" />
            <circle cx={x} cy="28" r="8" fill="hsl(60 100% 70% / 0.8)" />
          </g>
        ))}

        {/* Ticket shapes */}
        {[
          { x: 80, y: 120, color: "hsl(145 60% 35%)", rotate: -15 },
          { x: 180, y: 100, color: "hsl(145 60% 40%)", rotate: 5 },
          { x: 280, y: 115, color: "hsl(145 60% 30%)", rotate: 12 },
        ].map((t, i) => (
          <g key={i} transform={`rotate(${t.rotate}, ${t.x}, ${t.y})`}>
            <rect x={t.x - 30} y={t.y - 15} width="60" height="30" rx="6" fill={t.color} opacity="0.9" />
            <circle cx={t.x - 30} cy={t.y} r="6" fill="hsl(150 10% 4%)" />
            <circle cx={t.x + 30} cy={t.y} r="6" fill="hsl(150 10% 4%)" />
            <line x1={t.x - 18} y1={t.y} x2={t.x + 18} y2={t.y} stroke="hsl(150 10% 4% / 0.4)" strokeWidth="1" strokeDasharray="4 3" />
            <rect x={t.x - 20} y={t.y - 8} width="16" height="16" rx="3" fill="white" opacity="0.15" />
          </g>
        ))}

        {/* Crowd people */}
        {[
          { cx: 100, color: "#4ade80" },
          { cx: 145, color: "#86efac" },
          { cx: 190, color: "#22c55e" },
          { cx: 235, color: "#4ade80" },
          { cx: 280, color: "#86efac" },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.cx} cy="240" r="16" fill="hsl(145 20% 12%)" stroke={p.color} strokeWidth="1.5" strokeOpacity="0.5" />
            <circle cx={p.cx} cy="233" r="7" fill="hsl(30 30% 60%)" />
            <rect x={p.cx - 10} y="248" width="20" height="24" rx="4" fill="hsl(145 20% 12%)" stroke={p.color} strokeWidth="1" strokeOpacity="0.4" />
          </g>
        ))}

        {/* Stars */}
        {[[50, 50], [350, 60], [170, 20], [310, 30]].map(([x, y], i) => (
          <text key={i} x={x} y={y} fontSize="14" fill="hsl(60 100% 80%)" opacity={0.6 - i * 0.1}>★</text>
        ))}

        {/* Floating badge */}
        <rect x="150" y="55" width="100" height="28" rx="14" fill="hsl(145 60% 35% / 0.2)" stroke="hsl(145 60% 35% / 0.5)" strokeWidth="1" />
        <text x="200" y="74" textAnchor="middle" fontSize="11" fill="hsl(145 60% 60%)" fontWeight="600">🎫 Inbox Ticket</text>
      </svg>
    </div>
  );
}
