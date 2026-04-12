import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const WORD1 = "InBox";
const WORD2 = "Ticket";

const INITIAL_LOADER_ROUTES = [
  "/",
  "/admin",
  "/auth",
  "/mes-billets",
  "/organizer/login",
  "/organizer/events",
  "/agent-vente",
  "/agent-scan",
];

export function PageLoader() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showLoader() {
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setExiting(false);
    setShow(true);
  }

  function hideLoader() {
    setExiting(true);
    exitTimer.current = setTimeout(() => setShow(false), 500);
  }

  useEffect(() => {
    // Initial page load — show briefly on key routes
    if (INITIAL_LOADER_ROUTES.includes(router.pathname)) {
      showLoader();
      hideTimer.current = setTimeout(hideLoader, 950);
    }

    // Navigation events — show until page is actually ready
    const handleStart = () => showLoader();
    const handleComplete = () => hideLoader();
    const handleError = () => hideLoader();

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleError);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleError);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        @keyframes loaderBar {
          0%   { width: 0%; opacity: 1; }
          80%  { width: 85%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
        .loader-scan {
          animation: scanLine 1.1s ease-in-out 0.1s both;
          pointer-events: none;
        }
        .loader-sub {
          animation: subtlePulse 1.8s ease-in-out infinite;
        }
        .loader-bar {
          animation: loaderBar 2s cubic-bezier(0.4,0,0.2,1) infinite;
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

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "hsl(145 20% 10%)" }}>
        <div
          className="loader-bar h-full rounded-full"
          style={{ background: "linear-gradient(90deg, hsl(145 70% 45%), hsl(145 70% 60%))" }}
        />
      </div>

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
