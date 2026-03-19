import React, { useEffect, useState } from "react";

const LETTERS = "INBOXTICKET".split("");

const STEPS = [
  "Connexion sécurisée...",
  "Vérification du paiement...",
  "Confirmation de la commande...",
  "Génération du billet électronique...",
];

export function PaymentProcessing({ paymentMethod }: { paymentMethod: string }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 900);
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 95));
    }, 80);
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const methodColor =
    paymentMethod === "orange_money"
      ? "#ff6600"
      : paymentMethod === "mvola"
      ? "#e02020"
      : "#3b82f6";

  const methodLabel =
    paymentMethod === "orange_money"
      ? "Orange Money"
      : paymentMethod === "mvola"
      ? "MVola"
      : "Mastercard";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, hsl(145 48% 10% / 1) 0%, hsl(150 10% 4% / 1) 70%)",
      }}
    >
      {/* African pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpolygon points='40,4 76,40 40,76 4,40' fill='none' stroke='%234caf50' stroke-width='1.5'/%3E%3Cpolygon points='40,18 62,40 40,62 18,40' fill='none' stroke='%234caf50' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='5' fill='%234caf50'/%3E%3Cline x1='0' y1='40' x2='80' y2='40' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cline x1='40' y1='0' x2='40' y2='80' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center mb-12">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${120 + i * 50}px`,
              height: `${120 + i * 50}px`,
              borderColor: `hsl(145 60% 35% / ${0.35 - i * 0.1})`,
              animation: `pulse-ring 2.4s ease-out ${i * 0.5}s infinite`,
            }}
          />
        ))}

        {/* Orbiting payment dots */}
        <div className="absolute" style={{ width: 0, height: 0 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: methodColor,
              boxShadow: `0 0 12px ${methodColor}`,
              animation: "orbit 2s linear infinite",
            }}
          />
        </div>
        <div className="absolute" style={{ width: 0, height: 0 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "hsl(145 60% 35%)",
              boxShadow: "0 0 8px hsl(145 60% 35%)",
              animation: "orbit-reverse 3s linear infinite",
            }}
          />
        </div>

        {/* Central logo circle */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 110,
            height: 110,
            background:
              "radial-gradient(circle, hsl(145 48% 15%) 0%, hsl(150 10% 6%) 100%)",
            border: "2px solid hsl(145 60% 35% / 0.5)",
            boxShadow:
              "0 0 40px hsl(145 60% 35% / 0.3), inset 0 0 20px hsl(145 48% 10% / 0.5)",
          }}
        >
          {/* SVG ticket icon */}
          <svg
            width="46"
            height="46"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(145 60% 45%)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px hsl(145 60% 35%))" }}
          >
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2M13 17v2M13 11v2" />
          </svg>
        </div>
      </div>

      {/* Animated logo text */}
      <div className="flex items-baseline gap-0 mb-3 select-none" aria-hidden>
        {LETTERS.map((letter, i) => {
          const isSecond = i >= 5;
          return (
            <span
              key={i}
              className="font-display font-extrabold text-3xl tracking-widest"
              style={{
                color: isSecond ? "hsl(145 60% 40%)" : "white",
                display: "inline-block",
                animation: `letter-wave 1.8s ease-in-out ${i * 0.09}s infinite`,
                textShadow: isSecond
                  ? "0 0 20px hsl(145 60% 35% / 0.8)"
                  : "none",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Payment method badge */}
      <div
        className="mb-8 px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{
          background: `${methodColor}20`,
          border: `1px solid ${methodColor}50`,
          color: methodColor,
        }}
      >
        Paiement via {methodLabel}
      </div>

      {/* Progress bar */}
      <div className="w-72 mb-4">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "hsl(145 20% 12%)" }}
        >
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-300"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, hsl(145 48% 20%), hsl(145 60% 35%))",
            }}
          >
            <div
              className="absolute inset-y-0 w-12 skew-x-12"
              style={{
                background: "hsl(0 0% 100% / 0.3)",
                animation: "shimmer-bar 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-muted-foreground">{progress}%</span>
          <span className="text-xs text-muted-foreground">Sécurisé</span>
        </div>
      </div>

      {/* Step text */}
      <p
        key={step}
        className="text-muted-foreground text-sm text-center max-w-xs"
        style={{ animation: "fade-in 0.4s ease" }}
      >
        {STEPS[step]}
      </p>

      {/* Kente bottom stripe */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `repeating-linear-gradient(90deg, hsl(145 60% 35%) 0px, hsl(145 60% 35%) 30px, ${methodColor} 30px, ${methodColor} 50px, hsl(0 0% 100% / 0.1) 50px, hsl(0 0% 100% / 0.1) 60px, hsl(145 48% 20%) 60px, hsl(145 48% 20%) 90px)`,
        }}
      />
    </div>
  );
}
