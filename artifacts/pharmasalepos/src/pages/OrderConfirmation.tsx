import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { InboxQRCode } from "@/components/InboxQRCode";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Download, Calendar, MapPin, Ticket, Share2, ArrowRight, Star, XCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getBilletCodes } from "@/lib/billetCodes";
import { getOrderById } from "@/data/static";

const CONFETTI_COLORS = [
  "#22c55e", "#16a34a", "#f59e0b", "#f97316", "#ffffff",
  "#86efac", "#fde68a", "#bbf7d0", "#6ee7b7", "#fbbf24",
];

type Particle = {
  id: number; x: number; y: number;
  vx: number; vy: number; color: string;
  size: number; rotation: number; rotationSpeed: number;
  shape: "circle" | "rect" | "ticket";
  opacity: number;
};

function useConfetti(active: boolean) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const burst: Particle[] = Array.from({ length: 60 }, (_, i) => {
      const angle = (i / 60) * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      return {
        id: i, x: 50, y: 35,
        vx: Math.cos(angle) * speed * (0.4 + Math.random()),
        vy: Math.sin(angle) * speed * (0.4 + Math.random()) - 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: (["circle", "rect", "ticket"] as const)[Math.floor(Math.random() * 3)],
        opacity: 1,
      };
    });
    setParticles(burst);

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx * 0.4,
          y: p.y + p.vy * 0.4 + 0.15,
          vy: p.vy + 0.18,
          rotation: p.rotation + p.rotationSpeed,
          opacity: Math.max(0, 1 - elapsed / 3000),
        })).filter((p) => p.opacity > 0)
      );
      if (elapsed < 3200) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return particles;
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const order = getOrderById(Number(id));
  const [animPhase, setAnimPhase] = useState<"burst" | "settle" | "done">("burst");
  const particles = useConfetti(animPhase === "burst");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!order) return;
    const t1 = setTimeout(() => setAnimPhase("settle"), 600);
    const t2 = setTimeout(() => setAnimPhase("done"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [order]);

  if (!order) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold font-display mb-4">Commande introuvable</h1>
          <Link href="/mes-billets"><Button variant="accent">Mes billets</Button></Link>
        </div>
      </PublicLayout>
    );
  }

  const { ticketKey, confirmCode, ticketNumber } = getBilletCodes(order.id);
  const qrValue = `INBOXTICKET-ORD-${order.id}-${order.customerPhone}`;
  const orderId = String(order.id).padStart(6, "0");

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 300; canvas.height = 300;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement("a");
      a.download = `billet-inbox-${orderId}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const paymentLabel =
    order.paymentMethod === "orange_money" ? "Orange Money"
    : order.paymentMethod === "mvola" ? "MVola"
    : order.paymentMethod === "mastercard" ? "Mastercard" : "—";

  return (
    <PublicLayout>
      <style>{`
        @keyframes ringExpand {
          0%   { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(4deg); opacity: 1; }
          80%  { transform: scale(0.92) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes checkShimmer {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
          70%  { box-shadow: 0 0 0 30px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes slideUp {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.3); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-120px) rotate(20deg); opacity: 0; }
        }
        @keyframes successGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.3); }
          50%       { box-shadow: 0 0 60px rgba(34,197,94,0.7), 0 0 100px rgba(34,197,94,0.3); }
        }
        .ring1 { animation: ringExpand 1s ease-out 0.1s both; }
        .ring2 { animation: ringExpand 1s ease-out 0.3s both; }
        .ring3 { animation: ringExpand 1s ease-out 0.5s both; }
        .check-icon { animation: checkPop 0.7s cubic-bezier(.36,.07,.19,.97) 0.2s both, checkShimmer 2s 0.9s infinite; }
        .text-slide-1 { animation: slideUp 0.6s ease-out 0.7s both; }
        .text-slide-2 { animation: slideUp 0.6s ease-out 0.9s both; }
        .card-slide   { animation: slideUp 0.7s ease-out 1.1s both; }
        .card-slide-2 { animation: slideUp 0.7s ease-out 1.3s both; }
        .star-spin    { animation: starSpin 3s linear infinite; }
        .success-glow { animation: successGlow 2.5s ease-in-out 0.5s infinite; }
      `}</style>

      {/* Confetti layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.shape === "rect" ? p.size * 0.5 : p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "ticket" ? "2px" : "1px",
              transform: `rotate(${p.rotation}deg)`,
              opacity: p.opacity,
              transition: "none",
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero success section */}
        <div className="text-center mb-14">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="ring1 absolute w-24 h-24 rounded-full border-2 border-emerald-400/50" />
            <div className="ring2 absolute w-24 h-24 rounded-full border-2 border-emerald-300/40" />
            <div className="ring3 absolute w-24 h-24 rounded-full border-2 border-emerald-200/30" />

            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute"
                style={{
                  animation: `floatUp 2s ease-out ${0.5 + deg / 600}s both`,
                  left: `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 55}px - 8px)`,
                  top: `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 55}px - 8px)`,
                }}
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            ))}

            <div className="check-icon success-glow relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="text-slide-1">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-3 bg-gradient-to-r from-emerald-400 via-white to-emerald-300 bg-clip-text text-transparent">
              Paiement Réussi !
            </h1>
          </div>
          <div className="text-slide-2">
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Félicitations <span className="text-white font-semibold">{order.customerName}</span> 🎉{" "}
              Votre billet est confirmé et prêt à l'usage.
            </p>
          </div>
        </div>

        {/* ============================================================
          SECTION TICKET + QR (désactivée temporairement)
          ============================================================
        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="card-slide md:col-span-3">
            ... ticket card ...
          </div>
          <div className="card-slide-2 md:col-span-2 space-y-4">
            ... QR + actions ...
          </div>
        </div>
        ============================================================ */}

        {/* Bottom actions */}
        <div className="card-slide-2 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/mes-billets">
            <Button variant="accent" size="lg" className="gap-2">
              <Ticket className="w-5 h-5" /> Voir tous mes billets <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/payment-failure">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Echec de paiement
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
