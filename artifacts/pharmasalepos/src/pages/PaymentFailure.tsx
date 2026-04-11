import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { XCircle, RefreshCcw, ArrowLeft, AlertTriangle, ShieldX, Wifi } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui";

const FAILURE_REASONS = [
  { icon: <ShieldX className="w-5 h-5" />, text: "Fonds insuffisants sur le compte" },
  { icon: <Wifi className="w-5 h-5" />, text: "Délai de connexion dépassé" },
  { icon: <AlertTriangle className="w-5 h-5" />, text: "Transaction refusée par l'opérateur" },
];

function useRedParticles() {
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.2,
      color: Math.random() > 0.5 ? "#ef4444" : "#b91c1c",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return canvasRef;
}

export default function PaymentFailure() {
  const [, navigate] = useLocation();
  const canvasRef = useRedParticles();

  return (
    <PublicLayout>
      <style>{`
        @keyframes failShake {
          0%, 100% { transform: translateX(0); }
          15%  { transform: translateX(-8px) rotate(-2deg); }
          30%  { transform: translateX(8px) rotate(2deg); }
          45%  { transform: translateX(-6px) rotate(-1deg); }
          60%  { transform: translateX(6px) rotate(1deg); }
          75%  { transform: translateX(-3px); }
          90%  { transform: translateX(3px); }
        }
        @keyframes failGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3), 0 0 60px rgba(239,68,68,0.1); }
          50%       { box-shadow: 0 0 40px rgba(239,68,68,0.6), 0 0 100px rgba(239,68,68,0.2); }
        }
        @keyframes slideUpFade {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseRed {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes ringExpandRed {
          0%   { transform: scale(0); opacity: 0.7; }
          100% { transform: scale(3); opacity: 0; }
        }
        .fail-icon     { animation: failShake 0.7s cubic-bezier(.36,.07,.19,.97) 0.3s both; }
        .fail-glow     { animation: failGlow 2.5s ease-in-out 0.5s infinite; }
        .ring-red-1    { animation: ringExpandRed 1.1s ease-out 0.1s both; }
        .ring-red-2    { animation: ringExpandRed 1.1s ease-out 0.3s both; }
        .slide-1       { animation: slideUpFade 0.6s ease-out 0.6s both; }
        .slide-2       { animation: slideUpFade 0.6s ease-out 0.8s both; }
        .slide-3       { animation: slideUpFade 0.7s ease-out 1.0s both; }
        .slide-4       { animation: slideUpFade 0.7s ease-out 1.2s both; }
        .pulse-red     { animation: pulseRed 2s ease-in-out infinite; }
      `}</style>

      {/* Ambient canvas particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />

      {/* Red radial gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, hsl(0 70% 20% / 0.18) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center">

        {/* Icon hero */}
        <div className="relative inline-flex items-center justify-center mb-10">
          <div className="ring-red-1 absolute w-24 h-24 rounded-full border-2 border-red-500/50" />
          <div className="ring-red-2 absolute w-24 h-24 rounded-full border-2 border-red-400/30" />
          <div className="fail-icon fail-glow relative w-28 h-28 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-2xl border border-red-500/30">
            <XCircle className="w-14 h-14 text-white" strokeWidth={1.8} />
          </div>
        </div>

        {/* Title */}
        <div className="slide-1 mb-3">
          <h1 className="text-5xl md:text-6xl font-bold font-display bg-gradient-to-r from-red-400 via-red-200 to-red-400 bg-clip-text text-transparent">
            Paiement Échoué
          </h1>
        </div>

        {/* Subtitle */}
        <div className="slide-2 mb-10">
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Votre transaction n'a pas pu être complétée.{" "}
            <span className="text-red-400 font-semibold">Aucun montant n'a été débité.</span>
          </p>
        </div>

        {/* Reason cards */}
        <div className="slide-3 w-full mb-10">
          <div
            className="rounded-2xl border p-6"
            style={{
              background: "hsl(0 20% 6%)",
              borderColor: "hsl(0 60% 22% / 0.45)",
              boxShadow: "0 0 30px hsl(0 70% 20% / 0.12)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-300 uppercase tracking-wider">
                Causes possibles
              </span>
            </div>
            <div className="space-y-3">
              {FAILURE_REASONS.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl"
                  style={{
                    background: "hsl(0 20% 9%)",
                    border: "1px solid hsl(0 40% 16%)",
                    animationDelay: `${1.2 + i * 0.1}s`,
                  }}
                >
                  <span className="text-red-400/70">{r.icon}</span>
                  <span className="text-sm text-muted-foreground">{r.text}</span>
                </div>
              ))}
            </div>

            {/* Status indicator */}
            <div className="mt-5 pt-4 border-t flex items-center gap-3" style={{ borderColor: "hsl(0 40% 14%)" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 pulse-red" />
              <span className="text-sm text-red-400 font-semibold">Transaction refusée</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">Code erreur : ERR_PAY_401</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="slide-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="accent"
            size="lg"
            className="gap-2 w-full sm:w-auto"
            style={{
              background: "linear-gradient(135deg, #dc2626, #991b1b)",
              borderColor: "#ef4444",
              boxShadow: "0 0 24px rgba(239,68,68,0.25)",
            }}
            onClick={() => navigate(-1 as unknown as string)}
          >
            <RefreshCcw className="w-5 h-5" />
            Réessayer le paiement
          </Button>
          <Link href="/events">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              Retour aux événements
            </Button>
          </Link>
        </div>

        {/* Note */}
        <div className="slide-4 mt-8 text-xs text-muted-foreground/60 max-w-sm leading-relaxed">
          Si le problème persiste, contactez votre opérateur ou essayez un autre mode de paiement.
        </div>
      </div>
    </PublicLayout>
  );
}
