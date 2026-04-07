import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { format, isFuture, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Ticket, Phone, Lock, Eye, EyeOff, Search, Calendar, MapPin,
  Download, Share2, Clock, CheckCircle2, XCircle, AlertCircle,
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

/* ── Ticket card ── */
function TicketCard({ order }: { order: any }) {
  const [showQR, setShowQR] = useState(false);
  const eventDate = order.event?.startDate ? new Date(order.event.startDate) : null;
  const isComing = eventDate ? isFuture(eventDate) : false;

  return (
    <Card className={`overflow-hidden border transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 ${isComing ? "border-primary/30" : "border-border/40 opacity-80"}`}>
      <div className={`h-1.5 w-full ${isComing ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : "bg-muted"}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
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

        <div className="space-y-1.5 mb-4">
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
            Cmd #{String(order.id).padStart(6, "0")} ·{" "}
            {order.payment?.method === "orange_money" ? "Orange Money"
            : order.payment?.method === "mvola" ? "MVola"
            : order.payment?.method === "mastercard" ? "Mastercard" : "—"}
          </div>
        </div>

        {order.status === "confirmed" && (
          <div className="mt-4">
            {showQR ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-lg" />
                  <div className="relative p-3 bg-white rounded-xl shadow-lg">
                    <QRCodeSVG
                      value={`INBOXTICKET-ORD-${order.id}-${order.customerEmail}`}
                      size={140} level="H" fgColor="#14532d"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Présentez ce code à l'entrée</p>
                <button onClick={() => setShowQR(false)} className="text-xs text-muted-foreground underline">
                  Masquer
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="accent" size="sm" className="flex-1 gap-1.5" onClick={() => setShowQR(true)}>
                  <Ticket className="w-3.5 h-3.5" /> Afficher le billet
                </Button>
                <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" /></Button>
                <Button variant="outline" size="sm"><Share2 className="w-3.5 h-3.5" /></Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
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
  const [activeTab, setActiveTab] = useState<"tous" | "avenir" | "passes">("tous");

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
