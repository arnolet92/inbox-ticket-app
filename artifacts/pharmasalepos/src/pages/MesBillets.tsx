import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { InboxQRCode } from "@/components/InboxQRCode";
import { format, isFuture } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Ticket, Search, Calendar, MapPin, Download, Share2, Printer,
  Clock, CheckCircle2, XCircle, Award, ChevronRight, Sparkles, LogOut, X,
} from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Card, Button, Badge, Input } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getBilletCodes } from "@/lib/billetCodes";
import { useMyOrders } from "@/data/static";
import { useAuth } from "@/context/AuthContext";
import type { Order } from "@/data/static";

function getLoyaltyTier(count: number) {
  if (count >= 10) return { label: "Diamant", color: "#60a5fa", emoji: "💎" };
  if (count >= 5)  return { label: "Or",      color: "#f59e0b", emoji: "🥇" };
  if (count >= 2)  return { label: "Argent",  color: "#94a3b8", emoji: "🥈" };
  return            { label: "Bronze",  color: "#cd7f32", emoji: "🥉" };
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" />Confirmé</Badge>;
  if (status === "pending")   return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
  if (status === "cancelled") return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Annulé</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function QRModal({ order, qrValue, onClose }: { order: Order; qrValue: string; onClose: () => void }) {
  const modalQrRef = React.useRef<HTMLDivElement>(null);
  const { ticketKey, confirmCode, ticketNumber } = getBilletCodes(order.id);
  const orderId = String(order.id).padStart(6, "0");
  const eventDate = order.event?.startDate ? new Date(order.event.startDate) : null;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const shareUrl = `${window.location.origin}${base}/billet?code=${encodeURIComponent(qrValue)}`;
  const shareMsg = encodeURIComponent(
    `🎫 Mon billet — ${order.event?.title ?? "Inbox Ticket"}\n` +
    (eventDate ? `📅 ${format(eventDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}\n` : "") +
    `🔑 Clé : ${ticketKey}\n` +
    `✅ Confirmation : ${confirmCode}\n` +
    `🎟️ N° billet : ${ticketNumber}\n` +
    `🔗 ${shareUrl}`
  );

  const [showLinkFor, setShowLinkFor] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const linkRef = React.useRef<HTMLInputElement>(null);

  const SOCIAL = [
    { label: "WhatsApp", color: "#25D366", icon: "https://cdn.simpleicons.org/whatsapp/ffffff", link: `https://wa.me/?text=${shareMsg}` },
    { label: "Messenger", color: "#0099FF", icon: "https://cdn.simpleicons.org/messenger/ffffff", link: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}` },
    { label: "Instagram", color: "#E1306C", icon: "https://cdn.simpleicons.org/instagram/ffffff", link: null },
    { label: "TikTok",    color: "#010101", icon: "https://cdn.simpleicons.org/tiktok/ffffff",    link: null },
  ];

  const handleDownload = async () => {
    const svg = modalQrRef.current?.querySelector("svg");
    if (!svg) return;

    // 1. Convert QR SVG → Image
    const svgData = new XMLSerializer().serializeToString(svg);
    const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    });

    // 2. Canvas dimensions
    const W = 420, PAD = 28;
    const QR_SIZE = 220;
    const H = 620;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;

    // Helper: rounded rect
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    };

    // ── Background ──
    rr(0, 0, W, H, 20);
    ctx.fillStyle = "#0b1610";
    ctx.fill();

    // ── Top green gradient bar ──
    const topGrad = ctx.createLinearGradient(0, 0, W, 0);
    topGrad.addColorStop(0, "#16a34a");
    topGrad.addColorStop(1, "#15803d");
    ctx.fillStyle = topGrad;
    rr(0, 0, W, 6, 0); ctx.fill();

    // ── INBOX TICKET header ──
    ctx.textAlign = "center";
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("INBOX  TICKET", W / 2, 32);

    // ── Event title ──
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 17px ui-sans-serif, system-ui, sans-serif";
    const title = order.event?.title ?? "Événement";
    ctx.fillText(title.length > 40 ? title.slice(0, 38) + "…" : title, W / 2, 58);

    // ── Date ──
    if (eventDate) {
      ctx.fillStyle = "#86efac";
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(
        format(eventDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr }),
        W / 2, 78
      );
    }

    // ── Dashed separator ──
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#1f4a2f";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, 96); ctx.lineTo(W - PAD, 96); ctx.stroke();
    ctx.setLineDash([]);

    // ── QR code white frame ──
    const qrX = (W - QR_SIZE) / 2;
    const qrY = 112;
    rr(qrX - 14, qrY - 14, QR_SIZE + 28, QR_SIZE + 28, 16);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, QR_SIZE, QR_SIZE);

    // ── Dashed separator ──
    const sep2Y = qrY + QR_SIZE + 26;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#1f4a2f";
    ctx.beginPath(); ctx.moveTo(PAD, sep2Y); ctx.lineTo(W - PAD, sep2Y); ctx.stroke();
    ctx.setLineDash([]);

    // ── Code boxes ──
    const codes = [
      { label: "Clé", value: ticketKey },
      { label: "Confirmation", value: confirmCode },
      { label: "N° billet", value: ticketNumber },
    ];
    const boxY = sep2Y + 14;
    const boxW = (W - PAD * 2 - 8 * 2) / 3;
    codes.forEach((code, i) => {
      const bx = PAD + i * (boxW + 8);
      rr(bx, boxY, boxW, 52, 10);
      ctx.fillStyle = "#0f2218"; ctx.fill();
      ctx.strokeStyle = "#1f4a2f"; ctx.lineWidth = 1; ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#6b9e7a";
      ctx.font = "9px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(code.label.toUpperCase(), bx + boxW / 2, boxY + 16);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px ui-monospace, monospace";
      ctx.fillText(code.value, bx + boxW / 2, boxY + 36);
    });

    // ── Order number ──
    const orderY = boxY + 52 + 18;
    ctx.textAlign = "center";
    ctx.fillStyle = "#6b9e7a";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`Commande  #${orderId}`, W / 2, orderY);

    // ── QR value (small) ──
    ctx.fillStyle = "#2a4a35";
    ctx.font = "8px ui-monospace, monospace";
    ctx.fillText(qrValue.length > 50 ? qrValue.slice(0, 48) + "…" : qrValue, W / 2, orderY + 18);

    // ── Footer ──
    ctx.fillStyle = "#1f4a2f";
    ctx.fillRect(0, H - 36, W, 36);
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🔒  Billet sécurisé — Inbox Ticket", W / 2, H - 16);

    // ── Download ──
    const a = document.createElement("a");
    a.download = `billet-inbox-${orderId}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  };

  const handlePrint = () => {
    const svg = modalQrRef.current?.querySelector("svg");
    if (!svg) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Billet ${ticketNumber}</title>
      <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;padding:24px;color:#000;}.logo{font-size:18px;font-weight:900;color:#15803d;margin-bottom:8px;}.qr{border:3px solid #15803d;border-radius:16px;padding:16px;margin:16px 0;}.codes{display:flex;gap:12px;}.code-box{border:1.5px solid #d1d5db;border-radius:8px;padding:8px 12px;text-align:center;}.code-label{font-size:9px;color:#9ca3af;text-transform:uppercase;}.code-val{font-size:14px;font-weight:700;font-family:monospace;}@media print{button{display:none;}}</style>
      </head><body>
      <div class="logo">INBOX TICKET</div>
      <div>${order.event?.title ?? ""}</div>
      <div style="font-size:12px;color:#6b7280;">${order.ticketType?.name} · ×${order.quantity}</div>
      <div class="qr">${svg.outerHTML}</div>
      ${eventDate ? `<div style="font-size:12px;color:#374151;">${format(eventDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</div>` : ""}
      <div class="codes">
        <div class="code-box"><div class="code-label">Clé</div><div class="code-val">${ticketKey}</div></div>
        <div class="code-box"><div class="code-label">Confirmation</div><div class="code-val">${confirmCode}</div></div>
        <div class="code-box"><div class="code-label">N° billet</div><div class="code-val">${ticketNumber}</div></div>
      </div>
      <div style="font-size:10px;color:#9ca3af;margin-top:16px;">🔒 Billet sécurisé — Inbox Ticket</div>
      <script>window.onload=()=>window.print();<\/script>
    </body></html>`);
    win.document.close();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    const ta = document.createElement("textarea"); ta.value = shareUrl; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-3xl shadow-2xl flex flex-col" style={{ background: "hsl(150 15% 6%)", border: "1.5px solid hsl(145 60% 25% / 0.5)", maxHeight: "92vh" }} onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 flex items-start justify-between shrink-0">
          <div>
            <p className="text-[10px] text-accent font-semibold tracking-widest uppercase mb-0.5">Billet électronique</p>
            <h2 className="font-bold font-display text-base leading-tight">{order.event?.title ?? "Événement"}</h2>
            <p className="text-xs text-muted-foreground">{order.ticketType?.name} · ×{order.quantity}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-xl leading-none shrink-0 ml-2">×</button>
        </div>
        <div className="mx-5 border-t border-dashed border-accent/20 shrink-0" />

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="flex flex-col items-center" ref={modalQrRef}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
              <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                <InboxQRCode value={qrValue} size={200} fgColor="#14532d" />
              </div>
            </div>
            {eventDate && <p className="text-xs text-muted-foreground text-center mt-2">{format(eventDate, "EEE d MMM yyyy, HH:mm", { locale: fr })}</p>}
            <div className="flex gap-2 mt-3 w-full">
              {[{ label: "Clé", value: ticketKey }, { label: "Confirmation", value: confirmCode }, { label: "N° billet", value: ticketNumber }].map(c => (
                <div key={c.label} className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 px-1" style={{ background: "hsl(145 20% 9%)", border: "1px solid hsl(145 40% 18% / 0.6)" }}>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none">{c.label}</span>
                  <span className="font-mono font-bold text-sm tracking-widest text-white">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleDownload}><Download className="w-3.5 h-3.5" /> Télécharger</Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handlePrint}><Printer className="w-3.5 h-3.5" /> Imprimer</Button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Partager via</p>
            <div className="grid grid-cols-4 gap-2">
              {SOCIAL.map(s => (
                <button key={s.label} onClick={() => s.link ? window.open(s.link, "_blank", "noopener") : setShowLinkFor(s.label === showLinkFor ? null : s.label)}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}33` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: s.color }}>
                    <img src={s.icon} alt={s.label} className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{s.label}</span>
                </button>
              ))}
            </div>
            {showLinkFor && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: "hsl(145 20% 9%)", border: "1px solid hsl(145 40% 20% / 0.5)" }}>
                <p className="text-xs text-muted-foreground mb-2">Copiez ce lien dans <span className="text-white font-semibold">{showLinkFor}</span> :</p>
                <div className="flex gap-2">
                  <input ref={linkRef} readOnly value={shareUrl} onClick={e => (e.target as HTMLInputElement).select()}
                    className="flex-1 text-xs bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-muted-foreground font-mono truncate outline-none cursor-text" />
                  <button onClick={handleCopy} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: copied ? "#16a34a" : "hsl(145 60% 30%)", color: "white" }}>
                    {copied ? "✓ Copié" : "Copier"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ order }: { order: Order }) {
  const [showModal, setShowModal] = React.useState(false);
  const eventDate = order.event?.startDate ? new Date(order.event.startDate) : null;
  const isComing = eventDate ? isFuture(eventDate) : false;
  const qrValue = `INBOXTICKET-ORD-${order.id}-${order.customerPhone}`;
  const { ticketKey, confirmCode, ticketNumber } = getBilletCodes(order.id);
  const isConfirmed = order.status === "confirmed";

  return (
    <>
      {showModal && <QRModal order={order} qrValue={qrValue} onClose={() => setShowModal(false)} />}
      <Card className={`overflow-hidden border transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 ${isComing ? "border-primary/30" : "border-border/40 opacity-75"}`}>
        {/* Top accent bar */}
        <div className={`h-1 w-full ${isComing ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : "bg-muted"}`} />

        <div className="p-5">
          {/* Header: badges + price */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.status} />
              {isComing
                ? <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">À venir</span>
                : <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Passé</span>
              }
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-bold text-accent">{formatMGA(order.totalAmount)}</div>
              <div className="text-xs text-muted-foreground">×{order.quantity} billet{order.quantity > 1 ? "s" : ""}</div>
            </div>
          </div>

          {/* Main content: info left, QR right */}
          <div className={`flex gap-4 ${isConfirmed ? "" : ""}`}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base line-clamp-2 leading-tight mb-3">{order.event?.title}</h3>
              <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                {eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                    {format(eventDate, "d MMM yyyy, HH:mm", { locale: fr })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="truncate">{order.event?.location}, {order.event?.city}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-t border-border/40">
                <span className="font-semibold text-foreground">{order.ticketType?.name}</span>
                <span className="font-mono">#{String(order.id).padStart(6, "0")}</span>
              </div>
            </div>

            {/* QR code inline — only for confirmed */}
            {isConfirmed && (
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="relative cursor-pointer" onClick={() => setShowModal(true)}>
                  <div className="absolute inset-0 bg-emerald-500/15 rounded-xl blur-md" />
                  <div className="relative p-2 bg-white rounded-xl shadow-md border border-emerald-200/30">
                    <InboxQRCode value={qrValue} size={90} fgColor="#14532d" />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">Tap pour agrandir</span>
              </div>
            )}
          </div>

          {/* Codes row — only for confirmed */}
          {isConfirmed && (
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/40">
              {[{ label: "Clé", value: ticketKey }, { label: "Confirm.", value: confirmCode }, { label: "N° billet", value: ticketNumber }].map(c => (
                <div key={c.label} className="flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg" style={{ background: "hsl(145 20% 9%)", border: "1px solid hsl(145 40% 18% / 0.5)" }}>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-wider leading-none">{c.label}</span>
                  <span className="font-mono font-bold text-[11px] tracking-widest text-white">{c.value}</span>
                </div>
              ))}
              <button
                onClick={() => setShowModal(true)}
                className="shrink-0 flex items-center justify-center w-10 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-all"
                title="Télécharger / Partager"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

export default function MesBillets() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const allOrders = useMyOrders(user?.phone);

  const filtered = useMemo(() => {
    let orders = allOrders;
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o => o.event?.title.toLowerCase().includes(q));
    }
    if (filter === "upcoming") orders = orders.filter(o => o.event?.startDate && isFuture(new Date(o.event.startDate)));
    if (filter === "past") orders = orders.filter(o => o.event?.startDate && !isFuture(new Date(o.event.startDate)));
    return orders;
  }, [allOrders, search, filter]);

  const tier = getLoyaltyTier(allOrders.length);
  const totalSpent = allOrders.filter(o => o.status === "confirmed").reduce((s, o) => s + o.totalAmount, 0);

  if (!user) {
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto px-4 py-32 text-center">
          <Ticket className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="text-3xl font-bold font-display mb-4">Mes Billets</h1>
          <p className="text-muted-foreground mb-8">Connectez-vous pour accéder à vos billets électroniques.</p>
          <Link href="/auth?redirect=/mes-billets"><Button variant="accent" size="lg" className="w-full">Se connecter</Button></Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-card border-b border-border pt-12 pb-24 african-pattern-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-display">{user.name}</h1>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: tier.color }}>
                    <Award className="w-4 h-4" /> Niveau {tier.label} {tier.emoji}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">{allOrders.length} commande{allOrders.length > 1 ? "s" : ""} · {formatMGA(totalSpent)} dépensé{totalSpent > 0 ? "s" : ""}</p>
            </div>
            <button onClick={() => { logout(); setLocation("/"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-sm font-semibold transition-all">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-24">
        <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Rechercher un événement..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 h-11 rounded-xl border-2 border-border bg-input/50 px-4 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "upcoming", "past"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? "bg-accent text-black" : "border border-border text-muted-foreground hover:border-accent/50"}`}>
                {f === "all" ? "Tous" : f === "upcoming" ? "À venir" : "Passés"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border border-dashed">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold font-display mb-2">
              {allOrders.length === 0 ? "Aucun billet" : "Aucun résultat"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {allOrders.length === 0 ? "Vous n'avez pas encore de billets." : "Modifiez vos filtres."}
            </p>
            {allOrders.length === 0 && (
              <Link href="/events"><Button variant="accent">Découvrir les événements</Button></Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(order => <TicketCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
