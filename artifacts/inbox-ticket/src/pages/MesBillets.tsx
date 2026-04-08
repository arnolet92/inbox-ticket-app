import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { format, isFuture, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Ticket, Phone, Lock, Eye, EyeOff, Search, Calendar, MapPin,
  Download, Share2, Printer, Clock, CheckCircle2, XCircle, AlertCircle,
  Award, ChevronRight, Sparkles, TrendingUp, LogOut, ShieldCheck,
} from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useListOrders } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

/* ── Loyalty tiers ── */
function getLoyaltyTier(count: number) {
  if (count >= 10) return { label: "Diamant", color: "#60a5fa", emoji: "💎" };
  if (count >= 5)  return { label: "Or",      color: "#f59e0b", emoji: "🥇" };
  if (count >= 2)  return { label: "Argent",  color: "#94a3b8", emoji: "🥈" };
  return            { label: "Bronze",  color: "#cd7f32", emoji: "🥉" };
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed")
    return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" />Confirmé</Badge>;
  if (status === "pending")
    return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
  if (status === "cancelled")
    return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Annulé</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

/* ── Event timing badge ── */
function TimingBadge({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr);
  if (isFuture(date))
    return <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">À venir</span>;
  return <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Passé</span>;
}

/* ── QR Modal ── */
function QRModal({ order, qrValue, onClose }: { order: any; qrValue: string; onClose: () => void }) {
  const modalQrRef = React.useRef<HTMLDivElement>(null);
  const eventDate = order.event?.startDate ? new Date(order.event.startDate) : null;
  const orderId = String(order.id).padStart(6, "0");
  const shareText = encodeURIComponent(`🎫 Mon billet pour ${order.event?.title ?? "l'événement"} — Inbox Ticket\nCommande #${orderId}`);

  const svgToPng = (size = 400): Promise<string> => {
    return new Promise((resolve) => {
      const svg = modalQrRef.current?.querySelector("svg");
      if (!svg) { resolve(""); return; }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, size, size); resolve(canvas.toDataURL("image/png")); };
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    });
  };

  const handleDownload = async () => {
    const png = await svgToPng();
    if (!png) return;
    const a = document.createElement("a");
    a.download = `billet-inbox-${orderId}.png`;
    a.href = png;
    a.click();
  };

  const handlePrint = () => {
    const svg = modalQrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgHtml = svg.outerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Billet #${orderId}</title>
      <style>
        body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff;color:#000;}
        .logo{font-size:22px;font-weight:900;letter-spacing:.1em;margin-bottom:6px;color:#15803d;}
        .title{font-size:20px;font-weight:700;margin-bottom:4px;}
        .sub{font-size:13px;color:#555;margin-bottom:16px;}
        .qr{border:3px solid #15803d;border-radius:16px;padding:16px;background:#fff;}
        .info{margin-top:16px;font-size:13px;color:#333;text-align:center;}
        .code{margin-top:8px;font-size:11px;color:#888;font-family:monospace;}
        @media print{button{display:none;}}
      </style></head><body>
      <div class="logo">INBOX TICKET</div>
      <div class="title">${order.event?.title ?? "Événement"}</div>
      <div class="sub">${order.ticketType?.name ?? ""} · ×${order.quantity}</div>
      <div class="qr">${svgHtml}</div>
      <div class="info">${eventDate ? format(eventDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr }) : ""}<br/>${order.event?.location ?? ""}</div>
      <div class="code">Commande #${orderId} · ${qrValue}</div>
      <script>window.onload=()=>window.print();<\/script>
    </body></html>`);
    win.document.close();
  };

  /* Public shareable URL — opens /billet?code=... showing the QR */
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const shareUrl = `${window.location.origin}${base}/billet?code=${encodeURIComponent(qrValue)}`;
  const shareMessage = encodeURIComponent(
    `🎫 Mon billet pour ${order.event?.title ?? "l'événement"} — Inbox Ticket\nCommande #${orderId}\n${shareUrl}`
  );

  const SOCIAL = [
    {
      label: "WhatsApp",
      color: "#25D366",
      icon: "https://cdn.simpleicons.org/whatsapp/ffffff",
      shareLink: `https://wa.me/?text=${shareMessage}`,
    },
    {
      label: "Messenger",
      color: "#0099FF",
      icon: "https://cdn.simpleicons.org/messenger/ffffff",
      shareLink: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Instagram",
      color: "#E1306C",
      icon: "https://cdn.simpleicons.org/instagram/ffffff",
      shareLink: null,
    },
    {
      label: "TikTok",
      color: "#010101",
      icon: "https://cdn.simpleicons.org/tiktok/ffffff",
      shareLink: null,
    },
  ];

  const [copied, setCopied] = React.useState<string | null>(null);

  const handleSocial = async (s: typeof SOCIAL[0]) => {
    if (s.shareLink) {
      window.open(s.shareLink, "_blank", "noopener");
    } else {
      /* Instagram / TikTok: copy the link, they'll paste it in their app */
      await navigator.clipboard.writeText(shareUrl);
      setCopied(s.label);
      setTimeout(() => setCopied(null), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "hsl(150 15% 6%)", border: "1.5px solid hsl(145 60% 25% / 0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-accent font-semibold tracking-widest uppercase mb-1">Billet électronique</p>
            <h2 className="font-bold font-display text-lg leading-tight">{order.event?.title ?? "Événement"}</h2>
            <p className="text-sm text-muted-foreground">{order.ticketType?.name} · ×{order.quantity}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-xl leading-none"
          >×</button>
        </div>

        {/* Dashed separator */}
        <div className="mx-6 border-t border-dashed border-accent/20 mb-5" />

        {/* Large QR */}
        <div className="flex flex-col items-center px-6 mb-5" ref={modalQrRef}>
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
            <div className="relative p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG value={qrValue} size={200} level="H" fgColor="#14532d" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3 font-mono tracking-wider">
            #{String(order.id).padStart(6, "0")}
          </p>
          {eventDate && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              {format(eventDate, "EEE d MMM yyyy, HH:mm", { locale: fr })}
            </p>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex gap-2 px-6 mb-4">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" /> Télécharger
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" /> Imprimer
          </Button>
        </div>

        {/* Social share */}
        <div className="px-6 pb-6">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Partager le lien du billet via</p>
          <div className="grid grid-cols-4 gap-2">
            {SOCIAL.map((s) => {
              const isCopied = copied === s.label;
              return (
                <button
                  key={s.label}
                  onClick={() => handleSocial(s)}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: isCopied ? "#16a34a22" : `${s.color}22`, border: `1px solid ${isCopied ? "#16a34a88" : s.color + "44"}` }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-colors"
                    style={{ background: isCopied ? "#16a34a" : s.color }}>
                    {isCopied ? "✓" : <img src={s.icon} alt={s.label} className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-medium transition-colors" style={{ color: isCopied ? "#16a34a" : undefined }}>
                    {isCopied ? "Copié !" : s.shareLink ? s.label : `${s.label} ↗`}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Hint for copy-based platforms */}
          {copied && (
            <p className="text-[10px] text-accent text-center mt-2 animate-pulse">
              Lien copié — collez-le dans {copied}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Ticket card ── */
function TicketCard({ order }: { order: any }) {
  const qrRef = React.useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = React.useState(false);
  const eventDate = order.event?.startDate ? new Date(order.event.startDate) : null;
  const isComing = eventDate ? isFuture(eventDate) : false;
  const qrValue = `INBOXTICKET-ORD-${order.id}-${order.customerPhone ?? order.customerEmail}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 300;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement("a");
      a.download = `billet-inbox-${String(order.id).padStart(6, "0")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <>
      {showModal && (
        <QRModal order={order} qrValue={qrValue} onClose={() => setShowModal(false)} />
      )}

      <Card className={`overflow-hidden border transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 ${isComing ? "border-primary/30" : "border-border/40 opacity-75"}`}>
        <div className={`h-1 w-full ${isComing ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : "bg-muted"}`} />

        {order.status === "confirmed" ? (
          <div className="p-5 flex gap-5 items-start">
            {/* Left: event info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {eventDate && <TimingBadge dateStr={order.event.startDate} />}
                <StatusBadge status={order.status} />
              </div>
              <h3 className="font-bold font-display text-base leading-tight mb-0.5">{order.event?.title ?? "Événement"}</h3>
              <p className="text-sm text-muted-foreground mb-3">{order.ticketType?.name}</p>

              <div className="space-y-1.5 mb-3">
                {eventDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 text-accent shrink-0" />
                    <span>{format(eventDate, "EEE d MMM yyyy, HH:mm", { locale: fr })}</span>
                  </div>
                )}
                {order.event?.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 text-accent shrink-0" />
                    <span>{order.event.location}, {order.event.city}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-bold text-accent text-lg">{formatMGA(order.totalAmount)}</div>
                <div className="text-xs text-muted-foreground">×{order.quantity} billet{order.quantity > 1 ? "s" : ""}</div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </Button>
                <Button variant="outline" size="sm" className="px-3" onClick={() => setShowModal(true)}>
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Right: QR code — click to enlarge */}
            <div
              className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
              ref={qrRef}
              onClick={() => setShowModal(true)}
              title="Agrandir le QR code"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/15 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative p-2.5 bg-white rounded-xl shadow-md group-hover:shadow-emerald-500/20 group-hover:scale-105 transition-all">
                  <QRCodeSVG value={qrValue} size={110} level="H" fgColor="#14532d" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.35)" }}>
                  <span className="text-white text-xs font-semibold">Agrandir</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center leading-tight max-w-[110px]">
                Scanner à l'entrée
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {eventDate && <TimingBadge dateStr={order.event.startDate} />}
                  <StatusBadge status={order.status} />
                </div>
                <h3 className="font-bold font-display text-lg leading-tight">{order.event?.title ?? "Événement"}</h3>
                <p className="text-sm text-muted-foreground">{order.ticketType?.name}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display font-bold text-accent text-xl">{formatMGA(order.totalAmount)}</div>
                <div className="text-xs text-muted-foreground">{order.quantity} billet{order.quantity > 1 ? "s" : ""}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {eventDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{format(eventDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
                </div>
              )}
              {order.event?.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{order.event.location}, {order.event.city}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Cmd #{String(order.id).padStart(6, "0")}
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

/* ── Login form ── */
function LoginForm({ onLogin }: { onLogin: (phone: string, name: string) => void; error: string }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");
    if (!phone.trim()) { setLocalError("Veuillez entrer votre numéro de téléphone."); return; }
    if (!password.trim()) { setLocalError("Veuillez entrer votre mot de passe."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(phone.trim(), password.trim()); }, 600);
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 fade-in">
        <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-5 border border-accent/20">
          <Ticket className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-3xl font-bold font-display mb-2">Mes Billets</h1>
        <p className="text-muted-foreground">Connectez-vous pour accéder à vos réservations</p>
      </div>

      <Card className="p-8 border-accent/20 shadow-xl shadow-black/30 fade-in-1">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">Numéro de téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+261 34 00 000 00"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-background border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-accent" />
              Votre mot de passe est le nom que vous avez utilisé lors de votre achat
            </p>
          </div>

          {/* Error */}
          {localError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {localError}
            </div>
          )}

          <Button type="submit" variant="accent" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Connexion...</>
              : <><Search className="w-4 h-4" /> Accéder à mes billets</>
            }
          </Button>
        </form>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6 fade-in-2">
        Pas encore de billet ?{" "}
        <Link href="/events" className="text-accent hover:underline font-medium">Découvrir les événements</Link>
      </p>
    </div>
  );
}

/* ── Main page ── */
export default function MesBillets() {
  const { user } = useAuth();

  /* Local auth state (fallback when not logged in via AuthContext) */
  const [searchPhone, setSearchPhone] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"tous" | "avenir" | "passes">("avenir");

  /* If the user is logged in via AuthContext, use their phone directly */
  const effectivePhone = user ? (user.phone ?? "") : searchPhone;
  const isGloballyAuthenticated = !!user || isAuthenticated;

  const { data: allOrders, isLoading } = useListOrders(
    { customerPhone: effectivePhone } as any,
    { query: { enabled: !!effectivePhone } }
  );

  const orders = useMemo(() => allOrders ?? [], [allOrders]);

  function handleLogin(phone: string, password: string) {
    setSearchPhone(phone);
    setPasswordInput(password);
    setAuthError("");
    setIsAuthenticated(false);
  }

  /* Validate password once orders are loaded (only for local login, not AuthContext) */
  const isValidated = useMemo(() => {
    if (user) return true; // already authenticated globally
    if (!searchPhone || isLoading || orders.length === 0) return null;
    const nameMatch = orders[0]?.customerName?.trim().toLowerCase();
    const attempt = passwordInput.trim().toLowerCase();
    return nameMatch === attempt || nameMatch?.startsWith(attempt) || attempt?.startsWith(nameMatch);
  }, [user, orders, passwordInput, searchPhone, isLoading]);

  React.useEffect(() => {
    if (user) return; // managed by AuthContext
    if (isValidated === true) {
      setIsAuthenticated(true);
      setAuthError("");
    } else if (isValidated === false && searchPhone) {
      setAuthError("Numéro ou mot de passe incorrect.");
      setIsAuthenticated(false);
    } else if (searchPhone && !isLoading && orders.length === 0) {
      setAuthError("Aucun compte trouvé avec ce numéro.");
      setIsAuthenticated(false);
    }
  }, [user, isValidated, searchPhone, isLoading, orders.length]);

  function handleLogout() {
    setSearchPhone("");
    setPasswordInput("");
    setIsAuthenticated(false);
    setAuthError("");
  }

  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const totalSpent = confirmedOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
  const totalTickets = confirmedOrders.reduce((s, o) => s + o.quantity, 0);
  const uniqueEvents = new Set(orders.map((o) => o.eventId)).size;
  const tier = getLoyaltyTier(confirmedOrders.length);
  const customerName = orders[0]?.customerName ?? "";

  const filteredOrders = useMemo(() => {
    if (activeTab === "avenir")
      return orders.filter((o) => o.event?.startDate && isFuture(new Date(o.event.startDate)));
    if (activeTab === "passes")
      return orders.filter((o) => o.event?.startDate && isPast(new Date(o.event.startDate)));
    return orders;
  }, [orders, activeTab]);

  const tabs = [
    { id: "tous",   label: "Tous",    count: orders.length },
    { id: "avenir", label: "À venir", count: orders.filter((o) => o.event?.startDate && isFuture(new Date(o.event.startDate))).length },
    { id: "passes", label: "Passés",  count: orders.filter((o) => o.event?.startDate && isPast(new Date(o.event.startDate))).length },
  ] as const;

  return (
    <PublicLayout>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in   { animation: fadeSlideIn 0.5s ease-out both; }
        .fade-in-1 { animation: fadeSlideIn 0.5s ease-out 0.1s both; }
        .fade-in-2 { animation: fadeSlideIn 0.5s ease-out 0.2s both; }
        .fade-in-3 { animation: fadeSlideIn 0.5s ease-out 0.3s both; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Loading state */}
        {effectivePhone && isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
            <p className="text-muted-foreground text-sm">Chargement de vos billets...</p>
          </div>
        )}

        {/* Error on local auth fail (only when not globally logged in) */}
        {!user && searchPhone && !isLoading && !isAuthenticated && authError && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 flex items-center gap-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium">{authError}</p>
                <p className="text-xs text-red-300/70 mt-0.5">Vérifiez votre numéro et votre prénom/nom</p>
              </div>
            </div>
            <LoginForm onLogin={handleLogin} error={authError} />
          </div>
        )}

        {/* Not yet searched (and not globally logged in) */}
        {!user && !searchPhone && !isLoading && (
          <LoginForm onLogin={handleLogin} error={authError} />
        )}

        {/* Authenticated view */}
        {isGloballyAuthenticated && !isLoading && (
          <>
            {/* Profile header */}
            <div className="flex items-center justify-between mb-8 fade-in flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-emerald-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                  {(user?.name ?? customerName).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Bienvenue</p>
                  <h1 className="text-2xl font-bold font-display">{user?.name ?? customerName}</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{effectivePhone}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: `${tier.color}40`, background: `${tier.color}10` }}>
                  <span className="text-xl">{tier.emoji}</span>
                  <div>
                    <div className="text-xs text-muted-foreground">Fidélité</div>
                    <div className="font-bold text-xs" style={{ color: tier.color }}>{tier.label}</div>
                  </div>
                </div>
                {!user && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
                    <LogOut className="w-3.5 h-3.5" /> Déconnexion
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 fade-in-1">
              {[
                { icon: <Ticket className="w-5 h-5" />, value: totalTickets, label: "Billets achetés", color: "text-accent" },
                { icon: <Calendar className="w-5 h-5" />, value: uniqueEvents, label: "Événements", color: "text-blue-400" },
                { icon: <TrendingUp className="w-5 h-5" />, value: formatMGA(totalSpent), label: "Total dépensé", color: "text-amber-400" },
                { icon: <Award className="w-5 h-5" />, value: `${tier.emoji} ${tier.label}`, label: "Niveau fidélité", color: "", style: { color: tier.color } },
              ].map((stat, i) => (
                <Card key={i} className="p-4 text-center border-border/50 hover:border-accent/30 transition-colors">
                  <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
                  <div className={`font-bold font-display text-lg ${stat.color}`} style={(stat as any).style ?? {}}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-card rounded-lg border border-border/50 w-fit fade-in-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-accent text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      activeTab === tab.id ? "bg-black/20 text-black" : "bg-muted text-muted-foreground"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tickets */}
            {filteredOrders.length === 0 ? (
              <Card className="p-10 text-center border-dashed fade-in-3">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun billet dans cette catégorie</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5 fade-in-3">
                {filteredOrders.map((order) => (
                  <TicketCard key={order.id} order={order} />
                ))}
              </div>
            )}

            <div className="mt-12 text-center fade-in-3">
              <Link href="/events">
                <Button variant="accent" size="lg" className="gap-2">
                  <Sparkles className="w-4 h-4" /> Découvrir de nouveaux événements
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
