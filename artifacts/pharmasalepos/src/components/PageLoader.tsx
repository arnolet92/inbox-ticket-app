import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const LOADER_ROUTES = [
  "/",
  "/admin",
  "/auth",
  "/mes-billets",
  "/organizer/login",
  "/organizer/events",
  "/agent-vente",
  "/agent-scan",
];

function shouldShowLoader(path: string): boolean {
  return LOADER_ROUTES.includes(path);
}

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
    if (shouldShowLoader(location)) trigger();
  }, []);

  useEffect(() => {
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      if (shouldShowLoader(location)) {
        trigger();
      }
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

      <div className="flex flex-col items-center gap-2 select-none px-6 w-full max-w-sm sm:max-w-none">

        {/* InBox + Ticket — stacked on mobile, inline on larger */}
        <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-0 leading-none">

          {/* InBox — chars drop in one by one */}
          <div className="flex items-baseline">
            {WORD1.split("").map((ch, i) => (
              <span
                key={i}
                className="inline-block font-black font-display text-[clamp(2.8rem,12vw,6rem)] text-white"
                style={{
                  animation: `charDrop 0.45s cubic-bezier(0.34,1.2,0.64,1) ${i * 55}ms both`,
                }}
              >
                {ch}
              </span>
            ))}
          </div>

          {/* Blinking cursor — hidden on mobile */}
          <span
            className="hidden sm:inline-block w-[3px] mx-3 rounded-full"
            style={{
              background: "hsl(145 70% 55%)",
              animation: "cursorBlink 0.7s step-start 300ms 3",
              height: "0.75em",
              alignSelf: "center",
            }}
          />

          {/* Ticket — slides in */}
          <span
            className="inline-block font-light font-display text-[clamp(2.8rem,12vw,6rem)]"
            style={{
              color: "hsl(145 60% 55%)",
              animation: `word2Slide 0.5s cubic-bezier(0.22,1,0.36,1) ${WORD1.length * 55 + 80}ms both`,
              letterSpacing: "0.12em",
            }}
          >
            {WORD2}
          </span>
        </div>

        {/* Tagline */}
        <p
          className="loader-sub text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase text-center"
          style={{ color: "hsl(145 25% 40%)" }}
        >
          Vivez l'événementiel autrement
        </p>
      </div>
    </div>
  );
}
