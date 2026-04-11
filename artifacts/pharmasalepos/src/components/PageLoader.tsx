import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { logoIcon } from "@/assets/images";

const LETTERS = "INBOX TICKET".split("");

function LetterAnim({ char, delay }: { char: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (char === " ") return <span className="inline-block w-4" />;
  return (
    <span
      className="inline-block transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.7)",
        transitionDelay: `0ms`,
      }}
    >
      {char}
    </span>
  );
}

export function PageLoader() {
  const [location] = useLocation();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const prevLocation = useRef(location);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // First mount: show initial loader
  useEffect(() => {
    trigger();
  }, []);

  // Route change
  useEffect(() => {
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      trigger();
    }
  }, [location]);

  function trigger() {
    // Clear any existing timers
    if (progressRef.current) clearInterval(progressRef.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setExiting(false);
    setShow(true);
    setProgress(0);

    // Animate progress bar to ~85% quickly, then to 100% at exit
    let p = 0;
    progressRef.current = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p >= 85) {
        p = 85;
        clearInterval(progressRef.current!);
      }
      setProgress(p);
    }, 60);

    // Complete and fade out after 900ms
    hideTimer.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setShow(false);
          setProgress(0);
        }, 500);
      }, 180);
    }, 900);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: "hsl(150 15% 4%)",
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      <style>{`
        @keyframes loaderPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes loaderGlow {
          0%, 100% { box-shadow: 0 0 20px hsl(145 70% 40% / 0.3); }
          50%       { box-shadow: 0 0 50px hsl(145 70% 40% / 0.7), 0 0 90px hsl(145 70% 40% / 0.2); }
        }
        @keyframes loaderDot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40%           { transform: scale(1.2); opacity: 1; }
        }
        @keyframes loaderRing {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes loaderShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes logoScale {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .loader-logo   { animation: logoScale 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
        .loader-glow   { animation: loaderGlow 2s ease-in-out infinite; }
        .loader-ring   { animation: loaderRing 1.4s ease-out infinite; }
        .loader-ring-2 { animation: loaderRing 1.4s ease-out 0.5s infinite; }
        .loader-shimmer-text {
          background: linear-gradient(
            90deg,
            hsl(145 60% 55%) 0%,
            hsl(145 90% 85%) 30%,
            hsl(145 60% 55%) 50%,
            hsl(145 70% 65%) 70%,
            hsl(145 60% 55%) 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: loaderShimmer 2s linear infinite;
        }
      `}</style>

      {/* Subtle radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, hsl(145 40% 12% / 0.7) 0%, transparent 70%)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40H0z' stroke='%2322c55e' stroke-width='0.5' opacity='0.4' fill='none'/%3E%3Cpath d='M0 0v1h40V0zM0 40v1h40V0z' stroke='%2322c55e' stroke-width='0.5' opacity='0.4' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center content */}
      <div className="relative flex flex-col items-center">

        {/* Logo with rings */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="loader-ring absolute w-24 h-24 rounded-full border border-emerald-500/30" />
          <div className="loader-ring-2 absolute w-24 h-24 rounded-full border border-emerald-400/20" />
          <div
            className="loader-logo loader-glow relative w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(145 60% 12%), hsl(145 70% 18%))",
              border: "1px solid hsl(145 60% 30% / 0.6)",
            }}
          >
            <img
              src={logoIcon}
              alt="InBox"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        {/* "INBOX TICKET" animated letters */}
        <div className="flex items-center gap-0 mb-2 overflow-hidden">
          {LETTERS.map((char, i) => (
            <span
              key={i}
              className="loader-shimmer-text text-2xl font-black font-display tracking-[0.18em]"
            >
              <LetterAnim char={char} delay={80 + i * 45} />
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="text-xs tracking-[0.25em] uppercase mb-10"
          style={{
            color: "hsl(145 30% 45%)",
            animation: "loaderPulse 2s ease-in-out infinite",
          }}
        >
          Vivez l'événementiel autrement
        </p>

        {/* Progress bar */}
        <div
          className="w-64 h-[3px] rounded-full overflow-hidden mb-4"
          style={{ background: "hsl(145 20% 12%)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(145 70% 35%), hsl(145 90% 60%), hsl(145 70% 40%))",
              backgroundSize: "200% 100%",
              animation: "loaderShimmer 1.2s linear infinite",
              boxShadow: "0 0 8px hsl(145 70% 50% / 0.6)",
              transition: "width 0.12s ease-out",
            }}
          />
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "hsl(145 60% 45%)",
                animation: `loaderDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
