import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const WORD1 = "InBox";
const WORD2 = "Ticket";

export function PageLoader() {
  const [location] = useLocation();
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const prevLocation = useRef(location);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      trigger();
    }
  }, [location]);

  function trigger() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    setExiting(false);
    setShow(true);

    hideTimer.current = setTimeout(() => {
      setExiting(true);
      exitTimer.current = setTimeout(() => setShow(false), 500);
    }, 950);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: "hsl(150 15% 4%)",
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.5s cubic-bezier(0.4,0,0.2,1)" : "none",
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      <style>{`
        @keyframes charDrop {
          0%   { opacity: 0; transform: translateY(-22px) scaleY(1.4); filter: blur(4px); }
          60%  { opacity: 1; transform: translateY(3px) scaleY(0.95); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scaleY(1); filter: blur(0); }
        }
        @keyframes word2Slide {
          0%   { opacity: 0; transform: translateX(20px); letter-spacing: 0.6em; }
          100% { opacity: 1; transform: translateX(0); letter-spacing: 0.18em; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.7; }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .loader-scan {
          animation: scanLine 1.1s ease-in-out 0.1s both;
          pointer-events: none;
        }
        .loader-sub {
          animation: subtlePulse 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Horizontal scan line */}
      <div
        className="loader-scan absolute left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(145 70% 50% / 0.5), transparent)",
          top: 0,
        }}
      />

      <div className="flex flex-col items-center gap-3 select-none">

        {/* InBox — chars drop in one by one */}
        <div className="flex items-baseline gap-0 leading-none">
          {WORD1.split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block font-black font-display text-7xl md:text-8xl text-white"
              style={{
                animation: `charDrop 0.45s cubic-bezier(0.34,1.2,0.64,1) ${i * 55}ms both`,
              }}
            >
              {ch}
            </span>
          ))}

          {/* Blinking cursor between words */}
          <span
            className="inline-block w-[3px] mx-3 self-stretch rounded-full"
            style={{
              background: "hsl(145 70% 55%)",
              animation: "cursorBlink 0.7s step-start 300ms 3",
              minHeight: "0.85em",
              alignSelf: "center",
            }}
          />

          {/* Ticket — slides in with letter spacing */}
          <span
            className="inline-block font-light font-display text-7xl md:text-8xl"
            style={{
              color: "hsl(145 60% 55%)",
              animation: `word2Slide 0.5s cubic-bezier(0.22,1,0.36,1) ${WORD1.length * 55 + 80}ms both`,
              letterSpacing: "0.18em",
            }}
          >
            {WORD2}
          </span>
        </div>

        {/* Tagline */}
        <p
          className="loader-sub text-xs tracking-[0.35em] uppercase"
          style={{ color: "hsl(145 25% 40%)" }}
        >
          Vivez l'événementiel autrement
        </p>
      </div>
    </div>
  );
}
