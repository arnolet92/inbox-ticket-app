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

  const BASE = import.meta.env.BASE_URL;

  const METHOD_CONFIG: Record<string, { color: string; label: string; logo: string; logoBg: string }> = {
    orange_money: { color: "#ff6600", label: "Orange Money", logo: `${BASE}images/om_logo.png`, logoBg: "#1a0d00" },
    mvola: { color: "#16a34a", label: "MVola", logo: `${BASE}images/mvola_logo.jpg`, logoBg: "#0a1f0a" },
    mastercard: { color: "#2563eb", label: "Visa / Mastercard", logo: `${BASE}images/visa_mastercard_logo.jpg`, logoBg: "#ffffff" },
  };

  const method = METHOD_CONFIG[paymentMethod] ?? METHOD_CONFIG["mastercard"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(145 48% 8% / 1) 0%, hsl(150 10% 3% / 1) 70%)" }}>
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#22c55e 0,#22c55e 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#f59e0b 0,#f59e0b 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full px-8">
        <div className="mb-10 relative">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: method.color }} />
          <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl" style={{ background: method.logoBg, border: `2px solid ${method.color}44` }}>
            <img src={method.logo} alt={method.label} className="w-16 h-16 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="color:${method.color};font-size:1.5rem;font-weight:900">${method.label[0]}</span>`;
              }} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 flex items-center justify-center" style={{ borderColor: method.color }}>
            <span className="w-3 h-3 rounded-full animate-ping absolute" style={{ background: method.color, opacity: 0.7 }} />
            <span className="w-3 h-3 rounded-full" style={{ background: method.color }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-display text-white mb-1">Paiement en cours</h2>
        <p className="text-muted-foreground text-sm mb-8">Ne quittez pas cette page</p>

        <div className="w-full bg-muted/30 rounded-full h-2 mb-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${method.color}, ${method.color}bb)` }} />
        </div>
        <p className="text-sm" style={{ color: method.color }}>{progress}%</p>

        <div className="mt-8 space-y-3 w-full">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i <= step ? "opacity-100" : "opacity-30"}`}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: i < step ? method.color : i === step ? `${method.color}33` : "hsl(var(--muted))", border: `1.5px solid ${i <= step ? method.color : "hsl(var(--border))"}`, color: i < step ? "#fff" : method.color }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-sm text-left" style={{ color: i === step ? method.color : i < step ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{s}</span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>🔒</span> Transaction sécurisée 256-bit SSL
        </p>
      </div>
    </div>
  );
}
