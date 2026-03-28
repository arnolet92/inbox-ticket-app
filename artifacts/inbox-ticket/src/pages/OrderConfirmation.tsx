import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Download, Calendar, MapPin, Ticket, Share2, ArrowRight, Star } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useGetOrder } from "@workspace/api-client-react";

/* ── Confetti particle ── */
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
  const { data: order, isLoading } = useGetOrder(Number(id));
  const [animPhase, setAnimPhase] = useState<"burst" | "settle" | "done">("burst");
  const particles = useConfetti(animPhase === "burst");

  useEffect(() => {
    if (!order) return;
    const t1 = setTimeout(() => setAnimPhase("settle"), 600);
    const t2 = setTimeout(() => setAnimPhase("done"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [order]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
        </div>
      </PublicLayout>
    );
  }
  if (!order) {
    return (
      <PublicLayout>
        <div className="text-center py-32">Commande introuvable</div>
      </PublicLayout>
    );
  }

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
          {/* Rings + icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Expanding rings */}
            <div className="ring1 absolute w-24 h-24 rounded-full border-2 border-emerald-400/50" />
            <div className="ring2 absolute w-24 h-24 rounded-full border-2 border-emerald-300/40" />
            <div className="ring3 absolute w-24 h-24 rounded-full border-2 border-emerald-200/30" />

            {/* Stars floating */}
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

            {/* Central success circle */}
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
              Félicitations <span className="text-white font-semibold">{order.customerName}</span> 🎉
              Votre billet est confirmé et prêt à l'usage.
            </p>
          </div>
        </div>

        {/* Kente stripe */}
        <div className="card-slide mb-8 h-2 rounded-full overflow-hidden flex">
          {["#22c55e","#f59e0b","#ffffff","#f97316","#22c55e","#f59e0b","#ffffff","#f97316"].map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">

          {/* Main ticket card */}
          <div className="card-slide md:col-span-3">
            <Card className="overflow-hidden border-2 border-accent/30 shadow-2xl" style={{ boxShadow: "0 0 40px rgba(34,197,94,0.08)" }}>
              {/* Ticket header with event info */}
              <div className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpolygon points='10 0 20 10 10 20 0 10'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: "20px" }}
                />
                <div className="relative">
                  <Badge variant="outline" className="text-white border-white/30 mb-2 text-xs">
                    Commande #{String(order.id).padStart(6, "0")}
                  </Badge>
                  <h2 className="text-2xl font-bold font-display text-white">{order.event?.title}</h2>
                  <p className="text-white/60 text-sm mt-1">{order.ticketType?.name}</p>
                </div>
              </div>

              {/* Perforated separator */}
              <div className="relative flex items-center px-6 py-0">
                <div className="absolute -left-4 w-8 h-8 rounded-full bg-background border border-border" />
                <div className="flex-1 border-t-2 border-dashed border-border/60 mx-4" />
                <div className="absolute -right-4 w-8 h-8 rounded-full bg-background border border-border" />
              </div>

              <div className="p-8 space-y-5 bg-card">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Date & Heure</div>
                    <div className="font-medium">
                      {order.event && format(new Date(order.event.startDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Lieu</div>
                    <div className="font-medium">{order.event?.location}, {order.event?.city}</div>
                  </div>
                </div>

                <div className="h-px border-t border-dashed border-border/60" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Titulaire</div>
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                    {order.customerPhone && (
                      <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Billet</div>
                    <div className="font-semibold">{order.quantity}x {order.ticketType?.name}</div>
                    <div className="font-display font-bold text-2xl text-accent mt-1">{formatMGA(order.totalAmount)}</div>
                  </div>
                </div>

                <div className="h-px border-t border-dashed border-border/60" />

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-semibold">Paiement confirmé</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    {order.payment?.method === "orange_money" ? "Orange Money"
                    : order.payment?.method === "mvola" ? "MVola"
                    : order.payment?.method === "mastercard" ? "Mastercard" : "—"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* QR + actions */}
          <div className="card-slide-2 md:col-span-2 space-y-4">
            <Card className="p-6 flex flex-col items-center text-center border-accent/20">
              <div className="relative mb-4">
                {/* Glow behind QR */}
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl scale-110" />
                <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                  <QRCodeSVG
                    value={`INBOXTICKET-ORD-${order.id}-${order.customerEmail}`}
                    size={160}
                    level="H"
                    fgColor="#14532d"
                  />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Billet Électronique</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Présentez ce QR code à l'entrée. Il sera scanné par le staff.
              </p>
              <Button variant="accent" className="w-full mb-3">
                <Download className="w-4 h-4 mr-2" /> Télécharger le billet
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" /> Partager
              </Button>
            </Card>

            {/* Quick tips */}
            <Card className="p-5 border-primary/30 bg-primary/5">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-accent" /> À savoir
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">✓</span> Arrivez 30 minutes avant le début</li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">✓</span> Présentez le QR code sur votre téléphone</li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">✓</span> Une pièce d'identité peut être demandée</li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold mt-0.5">✓</span> Billet non remboursable, non échangeable</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="card-slide-2 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/mes-billets">
            <Button variant="accent" size="lg" className="gap-2">
              <Ticket className="w-5 h-5" /> Voir tous mes billets <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="outline" size="lg">
              Explorer d'autres événements
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
