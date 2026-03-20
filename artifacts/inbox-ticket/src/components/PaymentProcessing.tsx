import React, { useEffect, useState } from "react";

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

  const methodIcon =
    paymentMethod === "orange_money"
      ? "OM"
      : paymentMethod === "mvola"
      ? "M"
      : "💳";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, hsl(145 48% 8% / 1) 0%, hsl(150 10% 3% / 1) 70%)",
      }}
    >
      {/* African kente pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpolygon points='40,4 76,40 40,76 4,40' fill='none' stroke='%234caf50' stroke-width='1.5' opacity='0.07'/%3E%3Cpolygon points='40,18 62,40 40,62 18,40' fill='none' stroke='%234caf50' stroke-width='1' opacity='0.05'/%3E%3Ccircle cx='40' cy='40' r='5' fill='%234caf50' opacity='0.04'/%3E%3Cline x1='0' y1='40' x2='80' y2='40' stroke='%23ffffff' stroke-width='0.5' opacity='0.03'/%3E%3Cline x1='40' y1='0' x2='40' y2='80' stroke='%23ffffff' stroke-width='0.5' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top kente stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{
          background: `repeating-linear-gradient(90deg, hsl(145 60% 35%) 0px, hsl(145 60% 35%) 28px, ${methodColor} 28px, ${methodColor} 48px, hsl(0 0% 100% / 0.08) 48px, hsl(0 0% 100% / 0.08) 58px, hsl(145 48% 20%) 58px, hsl(145 48% 20%) 88px)`,
        }}
      />

      {/* Pulsing rings behind logo */}
      <div className="relative flex items-center justify-center mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${130 + i * 55}px`,
              height: `${130 + i * 55}px`,
              border: `1.5px solid hsl(145 60% 35% / ${0.4 - i * 0.08})`,
              animation: `pulse-ring 2.8s ease-out ${i * 0.45}s infinite`,
            }}
          />
        ))}

        {/* Orbiting payment method dot */}
        <div className="absolute" style={{ width: 0, height: 0 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: methodColor,
              boxShadow: `0 0 16px ${methodColor}`,
              animation: "orbit 2.2s linear infinite",
            }}
          />
        </div>
        <div className="absolute" style={{ width: 0, height: 0 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "hsl(145 60% 45%)",
              boxShadow: "0 0 10px hsl(145 60% 45%)",
              animation: "orbit-reverse 3.5s linear infinite",
            }}
          />
        </div>
        <div className="absolute" style={{ width: 0, height: 0 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#ffffff80",
              animation: "orbit 5s linear infinite",
            }}
          />
        </div>

        {/* Central logo circle */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{
            width: 120,
            height: 120,
            background:
              "radial-gradient(circle, hsl(145 40% 12%) 0%, hsl(150 10% 6%) 100%)",
            border: "2px solid hsl(145 60% 30% / 0.6)",
            boxShadow:
              "0 0 50px hsl(145 60% 35% / 0.25), inset 0 0 30px hsl(145 48% 8% / 0.8)",
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/logo-inbox-transparent.png`}
            alt="inbox"
            style={{
              width: 88,
              height: "auto",
              filter:
                "drop-shadow(0 0 8px hsl(145 60% 40% / 0.7)) brightness(1.1)",
              animation: "pulse-logo 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* TICKET subtitle under logo */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-px w-8 rounded"
          style={{ background: "hsl(145 60% 35% / 0.5)" }}
        />
        <span
          className="font-display font-extrabold text-sm tracking-[0.4em] uppercase"
          style={{
            color: "hsl(145 60% 40%)",
            textShadow: "0 0 16px hsl(145 60% 35% / 0.5)",
          }}
        >
          TICKET
        </span>
        <div
          className="h-px w-8 rounded"
          style={{ background: "hsl(145 60% 35% / 0.5)" }}
        />
      </div>

      {/* Payment method badge */}
      <div
        className="mb-8 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2"
        style={{
          background: `${methodColor}18`,
          border: `1.5px solid ${methodColor}55`,
          color: methodColor,
        }}
      >
        <span
          className="flex items-center justify-center text-xs font-black rounded-md w-6 h-6"
          style={{ background: methodColor, color: "white" }}
        >
          {methodIcon}
        </span>
        Paiement via {methodLabel}
      </div>

      {/* Progress bar */}
      <div className="w-80 mb-5">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "hsl(145 20% 10%)" }}
        >
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-300"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, hsl(145 48% 18%), hsl(145 60% 40%))",
            }}
          >
            <div
              className="absolute inset-y-0 w-16 skew-x-12"
              style={{
                background: "hsl(0 0% 100% / 0.25)",
                animation: "shimmer-bar 1.4s ease-in-out infinite",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-1.5 px-0.5">
          <span className="text-xs text-muted-foreground font-mono">{progress}%</span>
          <span className="text-xs text-muted-foreground">🔒 Sécurisé SSL</span>
        </div>
      </div>

      {/* Step text with fade */}
      <p
        key={step}
        className="text-muted-foreground text-sm text-center max-w-xs mb-10"
        style={{ animation: "step-fade 0.4s ease" }}
      >
        {STEPS[step]}
      </p>

      {/* Animated dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === step ? 22 : 7,
              height: 7,
              background:
                i === step
                  ? "hsl(145 60% 40%)"
                  : "hsl(145 20% 20%)",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      {/* Bottom kente stripe */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{
          background: `repeating-linear-gradient(90deg, hsl(145 48% 20%) 0px, hsl(145 48% 20%) 28px, ${methodColor} 28px, ${methodColor} 48px, hsl(145 60% 35%) 48px, hsl(145 60% 35%) 68px, hsl(0 0% 100% / 0.06) 68px, hsl(0 0% 100% / 0.06) 78px)`,
        }}
      />

      <style>{`
        @keyframes pulse-logo {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px hsl(145 60% 40% / 0.7)) brightness(1.1); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 14px hsl(145 60% 45% / 0.9)) brightness(1.2); }
        }
        @keyframes step-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
