import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { InboxQRCode } from "@/components/InboxQRCode";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Download, Calendar, MapPin, Ticket, Share2, ArrowRight, Star } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getBilletCodes } from "@/lib/billetCodes";
import { getOrderById } from "@/data/static";

const CONFETTI_COLORS = ["#22c55e", "#16a34a", "#f59e0b", "#f97316", "#ffffff", "#86efac", "#fde68a", "#bbf7d0", "#6ee7b7", "#fbbf24"];

type Particle = { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotationSpeed: number; shape: "circle" | "rect"; opacity: number };

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
        size: 5 + Math.random() * 10, rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.5 ? "circle" : "rect", opacity: 1,
      };
    });
    setParticles(burst);
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      setParticles((prev) => prev.map((p) => ({
        ...p, x: p.x + p.vx * 0.4, y: p.y + p.vy * 0.4 + 0.15,
        vy: p.vy + 0.18, rotation: p.rotation + p.rotationSpeed,
        opacity: Math.max(0, 1 - elapsed / 3000),
      })));
      if (elapsed < 3000) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return particles;
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const order = getOrderById(Number(id));
  const particles = useConfetti(!!order);
  const qrRef = useRef<HTMLDivElement>(null);

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

  return (
    <PublicLayout>
      <div className="relative overflow-hidden pointer-events-none" style={{ height: 0 }}>
        <svg className="absolute inset-0 w-full h-screen" style={{ zIndex: 100, pointerEvents: "none" }}>
          {particles.map((p) => (
            p.shape === "circle"
              ? <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size / 2} fill={p.color} opacity={p.opacity} />
              : <rect key={p.id} x={`${p.x}%`} y={`${p.y}%`} width={p.size} height={p.size / 1.5} fill={p.color} opacity={p.opacity} transform={`rotate(${p.rotation} ${p.x} ${p.y})`} />
          ))}
        </svg>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 border-2 border-accent/40">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl font-bold font-display mb-2 text-white">Commande confirmée !</h1>
          <p className="text-muted-foreground">Commande #{orderId} · {formatMGA(order.totalAmount)}</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Ticket className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h2 className="font-bold text-lg">{order.event.title}</h2>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-accent" />{format(new Date(order.event.startDate), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}</div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-accent" />{order.event.location}, {order.event.city}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            {[
              { label: "Type", value: order.ticketType.name },
              { label: "Quantité", value: `×${order.quantity}` },
              { label: "Total", value: formatMGA(order.totalAmount) },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                <div className="font-bold">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center" ref={qrRef}>
            <div className="p-4 bg-white rounded-2xl shadow-lg mb-4">
              <InboxQRCode value={qrValue} size={180} fgColor="#14532d" />
            </div>
            <div className="flex gap-2 w-full">
              {[
                { label: "Clé de sécurité", value: ticketKey },
                { label: "Confirmation", value: confirmCode },
                { label: "N° billet", value: ticketNumber },
              ].map((c) => (
                <div key={c.label} className="flex-1 p-2 rounded-xl text-center border border-border/40 bg-muted/20">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{c.label}</div>
                  <div className="font-mono font-bold text-sm tracking-wider">{c.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" /> Télécharger
            </Button>
            <Link href="/mes-billets" className="flex-1">
              <Button variant="accent" size="sm" className="w-full gap-2">
                <Ticket className="w-4 h-4" /> Mes billets
              </Button>
            </Link>
          </div>
        </Card>

        <div className="text-center">
          <Link href="/events" className="inline-flex items-center gap-2 text-accent font-semibold hover:underline">
            Découvrir d'autres événements <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
