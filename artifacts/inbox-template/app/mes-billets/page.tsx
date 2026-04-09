"use client";
import { useState } from "react";
import { Ticket, Phone, Lock, Eye, EyeOff, Calendar, MapPin, Download, Share2, X, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { PublicLayout } from "@/components/public-layout";
import { ORDERS, getEvent } from "@/lib/mock-data";
import { getBilletCodes } from "@/lib/billet-codes";
import { formatMGA, formatDate, isFuture } from "@/lib/utils";

function TicketCard({ order }: { order: typeof ORDERS[0] }) {
  const [showQR, setShowQR] = useState(false);
  const event = getEvent(order.eventId);
  const ticketType = event?.ticketTypes.find((t) => t.id === order.ticketTypeId);
  const qrValue = `INBOXTICKET-ORD-${order.id}-${order.customerPhone}`;
  const { ticketKey, confirmCode, ticketNumber } = getBilletCodes(order.id);
  const coming = event ? isFuture(event.startDate) : false;

  if (!event) return null;

  if (showQR) {
    return (
      <div className={`overflow-hidden rounded-2xl border bg-card ${coming ? "border-accent/30" : "border-border/40 opacity-80"}`}>
        <div className={`h-1 w-full ${coming ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : "bg-muted"}`} />
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setShowQR(false)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors">
              <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Retour au billet
            </button>
            <button onClick={() => setShowQR(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-muted-foreground hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
              <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG value={qrValue} size={200} level="H" fgColor="#14532d" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{formatDate(event.startDate)}</p>
            <div className="flex gap-2 w-full">
              {[{ label: "Clé", value: ticketKey }, { label: "Conf.", value: confirmCode }, { label: "N°", value: ticketNumber }].map((c) => (
                <div key={c.label} className="flex-1 flex flex-col items-center rounded-xl py-1.5 px-1 bg-muted/50">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{c.label}</span>
                  <span className="font-mono font-bold text-xs tracking-widest">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold hover:border-accent/40 transition-all">
            <Download className="w-4 h-4" /> Télécharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border bg-card transition-all ${coming ? "border-accent/20 hover:border-accent/40" : "border-border/40 opacity-80"}`}>
      <div className={`h-1 w-full ${coming ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : "bg-muted"}`} />
      <div className="p-5 flex gap-5 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${coming ? "bg-accent text-black" : "bg-muted text-muted-foreground"}`}>
              {coming ? "À venir" : "Passé"}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              order.status === "confirmed" ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" :
              order.status === "pending" ? "border-yellow-500/40 text-yellow-400 bg-yellow-500/10" :
              "border-red-500/40 text-red-400 bg-red-500/10"
            }`}>
              {order.status === "confirmed" ? "Confirmé" : order.status === "pending" ? "En attente" : "Annulé"}
            </span>
          </div>
          <h3 className="font-bold font-display text-base leading-tight mb-0.5">{event.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{ticketType?.name}</p>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 text-accent shrink-0" />
              <span>{formatDate(event.startDate, true)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 text-accent shrink-0" />
              <span>{event.location}, {event.city}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-bold text-accent text-lg">{formatMGA(order.totalAmount)}</div>
            <div className="text-xs text-muted-foreground">×{order.quantity} billet{order.quantity > 1 ? "s" : ""}</div>
          </div>
          {order.status === "confirmed" && (
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-semibold hover:border-accent/40 transition-all">
                <Download className="w-3.5 h-3.5" /> Télécharger
              </button>
              <button onClick={() => setShowQR(true)}
                className="px-3 py-2 rounded-lg border border-border flex items-center justify-center hover:border-accent/40 transition-all">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        {order.status === "confirmed" && (
          <div className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
            onClick={() => setShowQR(true)}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/15 rounded-xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative p-2.5 bg-white rounded-xl shadow-md group-hover:scale-105 transition-all">
                <QRCodeSVG value={qrValue} size={90} level="H" fgColor="#14532d" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.35)" }}>
                <span className="text-white text-xs font-semibold">Agrandir</span>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground text-center">Scanner à l&apos;entrée</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MesBilletsPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [phone, setPhone] = useState("+261340000001");
  const [password, setPassword] = useState("Rakoto Jean");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const orders = ORDERS.filter((o) => o.customerPhone === "+261340000001");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoggedIn(true); setLoading(false); }, 800);
  };

  return (
    <PublicLayout>
      <div className="py-16 border-b border-border" style={{ background: "linear-gradient(180deg, hsl(145 55% 8%) 0%, transparent 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "hsl(145 55% 40% / 0.15)", border: "1px solid hsl(145 55% 40% / 0.3)" }}>
            <Ticket className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-display font-extrabold text-4xl mb-2">Mes Billets</h1>
          <p className="text-muted-foreground">Retrouvez toutes vos réservations</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!loggedIn ? (
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display font-bold text-2xl mb-1 text-center">Connectez-vous</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">Pour accéder à vos réservations</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent/60" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent/60" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Votre mot de passe est le nom utilisé lors de l&apos;achat</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-all"
                style={{ background: "hsl(145 55% 40%)" }}>
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Accéder à mes billets"}
              </button>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Pas encore de billet ?{" "}
              <Link href="/inbox-template/events" className="text-accent hover:underline">Découvrir les événements</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">{orders.length} billet{orders.length > 1 ? "s" : ""} trouvé{orders.length > 1 ? "s" : ""}</h2>
              <button onClick={() => setLoggedIn(false)} className="text-xs text-muted-foreground hover:text-white transition-colors">Déconnexion</button>
            </div>
            {orders.map((order) => <TicketCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
