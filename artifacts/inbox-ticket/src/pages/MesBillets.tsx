import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { format, isFuture, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Ticket, Mail, Search, Calendar, MapPin, Download, Share2,
  Clock, CheckCircle2, XCircle, AlertCircle, Star, Award,
  ChevronRight, Sparkles, TrendingUp,
} from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useListOrders } from "@workspace/api-client-react";

/* ── Loyalty tiers ── */
function getLoyaltyTier(count: number) {
  if (count >= 10) return { label: "Diamant", color: "#60a5fa", emoji: "💎", min: 10 };
  if (count >= 5)  return { label: "Or",      color: "#f59e0b", emoji: "🥇", min: 5 };
  if (count >= 2)  return { label: "Argent",  color: "#94a3b8", emoji: "🥈", min: 2 };
  return            { label: "Bronze",  color: "#cd7f32", emoji: "🥉", min: 0 };
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
    return (
      <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
        À venir
      </span>
    );
  return (
    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
      Passé
    </span>
  );
}

/* ── Ticket card ── */
function TicketCard({ order }: { order: any }) {
  const [showQR, setShowQR] = useState(false);
  const eventDate = order.event?.startDate ? new Date(order.event.startDate) : null;
  const isComing = eventDate ? isFuture(eventDate) : false;

  return (
    <Card className={`overflow-hidden border transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 ${isComing ? "border-primary/30" : "border-border/40 opacity-80"}`}>
      {/* Colored top stripe */}
      <div className={`h-1.5 w-full ${isComing ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : "bg-muted"}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {eventDate && <TimingBadge dateStr={order.event.startDate} />}
              <StatusBadge status={order.status} />
            </div>
            <h3 className="font-bold font-display text-lg leading-tight truncate">
              {order.event?.title ?? "Événement"}
            </h3>
            <p className="text-sm text-muted-foreground">{order.ticketType?.name}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display font-bold text-accent text-xl">
              {formatMGA(order.totalAmount)}
            </div>
            <div className="text-xs text-muted-foreground">{order.quantity} billet{order.quantity > 1 ? "s" : ""}</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {eventDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{format(eventDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
            </div>
          )}
          {order.event?.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{order.event.location}, {order.event.city}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Cmd #{String(order.id).padStart(6, "0")}</span>
            <span>·</span>
            <span>
              {order.payment?.method === "orange_money" ? "Orange Money"
              : order.payment?.method === "mvola" ? "MVola"
              : order.payment?.method === "mastercard" ? "Mastercard" : "—"}
            </span>
          </div>
        </div>

        {/* QR toggle */}
        {order.status === "confirmed" && (
          <div className="mt-4">
            {showQR ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={`INBOXTICKET-ORD-${order.id}-${order.customerEmail}`}
                    size={140}
                    level="H"
                    fgColor="#14532d"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Présentez ce code à l'entrée
                </p>
                <button
                  onClick={() => setShowQR(false)}
                  className="text-xs text-muted-foreground underline"
                >
                  Masquer
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="accent" size="sm" className="flex-1 gap-1.5" onClick={() => setShowQR(true)}>
                  <Ticket className="w-3.5 h-3.5" /> Afficher le billet
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ── Main page ── */
export default function MesBillets() {
  const [emailInput, setEmailInput] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"tous" | "avenir" | "passes">("tous");

  const { data: allOrders, isLoading } = useListOrders(
    { customerEmail: searchedEmail } as any,
    { query: { enabled: !!searchedEmail } }
  );

  const orders = useMemo(() => allOrders ?? [], [allOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "avenir")
      return orders.filter((o) => o.event?.startDate && isFuture(new Date(o.event.startDate)));
    if (activeTab === "passes")
      return orders.filter((o) => o.event?.startDate && isPast(new Date(o.event.startDate)));
    return orders;
  }, [orders, activeTab]);

  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const totalSpent = confirmedOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
  const totalTickets = confirmedOrders.reduce((s, o) => s + o.quantity, 0);
  const uniqueEvents = new Set(orders.map((o) => o.eventId)).size;
  const tier = getLoyaltyTier(confirmedOrders.length);
  const customerName = orders[0]?.customerName ?? "";
  const customerPhone = orders[0]?.customerPhone ?? "";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (emailInput.trim()) setSearchedEmail(emailInput.trim().toLowerCase());
  }

  const tabs = [
    { id: "tous", label: "Tous", count: orders.length },
    { id: "avenir", label: "À venir", count: orders.filter((o) => o.event?.startDate && isFuture(new Date(o.event.startDate))).length },
    { id: "passes", label: "Passés", count: orders.filter((o) => o.event?.startDate && isPast(new Date(o.event.startDate))).length },
  ] as const;

  return (
    <PublicLayout>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeSlideIn 0.5s ease-out both; }
        .fade-in-1 { animation: fadeSlideIn 0.5s ease-out 0.1s both; }
        .fade-in-2 { animation: fadeSlideIn 0.5s ease-out 0.2s both; }
        .fade-in-3 { animation: fadeSlideIn 0.5s ease-out 0.3s both; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Mes Billets</h1>
              <p className="text-muted-foreground text-sm">Retrouvez tous vos billets et réservations</p>
            </div>
          </div>
        </div>

        {/* Email search */}
        <Card className="p-6 mb-8 border-accent/20 fade-in-1">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-accent" />
            <div>
              <h2 className="font-semibold">Accédez à vos billets</h2>
              <p className="text-sm text-muted-foreground">Entrez l'adresse email utilisée lors de vos achats</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-colors"
              />
            </div>
            <Button type="submit" variant="accent" className="gap-2 shrink-0">
              <Search className="w-4 h-4" /> Rechercher
            </Button>
          </form>
        </Card>

        {/* Results */}
        {searchedEmail && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="p-12 text-center border-dashed fade-in">
                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucun billet trouvé</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Aucune commande associée à <span className="font-medium text-white">{searchedEmail}</span>
                </p>
                <Link href="/events">
                  <Button variant="accent">Explorer les événements</Button>
                </Link>
              </Card>
            ) : (
              <>
                {/* Profile card */}
                <Card className="p-6 mb-6 border-primary/30 bg-gradient-to-r from-primary/10 to-transparent fade-in">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-emerald-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">{customerName}</h2>
                        <p className="text-sm text-muted-foreground">{searchedEmail}</p>
                        {customerPhone && <p className="text-sm text-muted-foreground">{customerPhone}</p>}
                      </div>
                    </div>
                    {/* Loyalty badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ borderColor: `${tier.color}40`, background: `${tier.color}10` }}>
                      <span className="text-2xl">{tier.emoji}</span>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium">Fidélité</div>
                        <div className="font-bold text-sm" style={{ color: tier.color }}>{tier.label}</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 fade-in-1">
                  {[
                    { icon: <Ticket className="w-5 h-5" />, value: totalTickets, label: "Billets achetés", color: "text-accent" },
                    { icon: <Calendar className="w-5 h-5" />, value: uniqueEvents, label: "Événements", color: "text-blue-400" },
                    { icon: <TrendingUp className="w-5 h-5" />, value: formatMGA(totalSpent), label: "Total dépensé", color: "text-amber-400" },
                    { icon: <Award className="w-5 h-5" />, value: tier.emoji + " " + tier.label, label: "Niveau", color: "", style: { color: tier.color } },
                  ].map((stat, i) => (
                    <Card key={i} className="p-4 text-center border-border/50 hover:border-accent/30 transition-colors">
                      <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
                      <div className={`font-bold font-display text-lg ${stat.color}`} style={(stat as any).style}>{stat.value}</div>
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

                {/* Ticket grid */}
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

                {/* Bottom CTA */}
                <div className="mt-12 text-center fade-in-3">
                  <p className="text-muted-foreground text-sm mb-4">
                    Envie de vivre encore plus d'événements ?
                  </p>
                  <Link href="/events">
                    <Button variant="accent" size="lg" className="gap-2">
                      <Sparkles className="w-4 h-4" /> Découvrir les prochains événements
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}

        {/* Empty state before search */}
        {!searchedEmail && (
          <div className="text-center py-16 fade-in-2">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <Ticket className="w-10 h-10 text-accent/60" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Retrouvez vos billets</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Entrez votre email ci-dessus pour accéder à l'ensemble de vos réservations et billets électroniques.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              {["QR codes inclus", "Téléchargement PDF", "Partage facile"].map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
