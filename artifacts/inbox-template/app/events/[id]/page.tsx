"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, Plus, Minus, ShoppingCart, ArrowLeft, Ticket, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PublicLayout } from "@/components/public-layout";
import { EVENTS } from "@/lib/mock-data";
import { formatMGA, formatDate } from "@/lib/utils";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const event = EVENTS.find((e) => e.id === Number(id));
  const [cart, setCart] = useState<Record<number, number>>({});

  if (!event) {
    return (
      <PublicLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <Ticket className="w-12 h-12 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">Événement introuvable</p>
          <Link href="/inbox-template/events" className="text-accent hover:underline">← Retour aux événements</Link>
        </div>
      </PublicLayout>
    );
  }

  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(cart).reduce((sum, [tid, qty]) => {
    const tt = event.ticketTypes.find((t) => t.id === Number(tid));
    return sum + (tt?.price ?? 0) * qty;
  }, 0);

  const update = (tid: number, delta: number) => {
    const tt = event.ticketTypes.find((t) => t.id === tid)!;
    const avail = tt.quantity - tt.soldCount;
    setCart((prev) => {
      const curr = prev[tid] ?? 0;
      const next = Math.max(0, Math.min(avail, curr + delta));
      if (next === 0) { const c = { ...prev }; delete c[tid]; return c; }
      return { ...prev, [tid]: next };
    });
  };

  const goCheckout = () => {
    const cartData = encodeURIComponent(JSON.stringify(cart));
    router.push(`/inbox-template/checkout?eventId=${event.id}&cart=${cartData}`);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: "hsl(145 40% 10%)" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/inbox-template/events"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent text-black">{event.category}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">À venir</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Date début", value: formatDate(event.startDate), icon: Calendar },
                { label: "Date fin", value: formatDate(event.endDate), icon: Calendar },
                { label: "Lieu", value: `${event.location}`, icon: MapPin },
                { label: "Capacité", value: `${event.totalCapacity} places`, icon: Users },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-4 border border-border bg-card text-center">
                  <item.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-accent" />
                <h2 className="font-display font-bold text-lg">À propos</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent" />
                <span>{event.location}, {event.city}</span>
              </div>
            </div>
          </div>

          {/* Right: Ticket selection */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-5 sticky top-28 space-y-4">
              <h2 className="font-display font-bold text-lg border-b border-border pb-3">Choisir vos billets</h2>
              {event.ticketTypes.map((tt) => {
                const avail = tt.quantity - tt.soldCount;
                const qty = cart[tt.id] ?? 0;
                const pct = Math.round((tt.soldCount / tt.quantity) * 100);
                return (
                  <div key={tt.id} className={`rounded-xl border p-4 transition-all ${qty > 0 ? "border-accent/50 bg-accent/5" : "border-border"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-sm">{tt.name}</h3>
                        {tt.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tt.description}</p>}
                      </div>
                      <p className="font-display font-bold text-accent shrink-0">{formatMGA(tt.price)}</p>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full mb-3">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{avail} restants</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => update(tt.id, -1)} disabled={qty === 0}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent/60 disabled:opacity-40 transition-all">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`w-6 text-center font-bold text-sm ${qty > 0 ? "text-accent" : ""}`}>{qty}</span>
                        <button onClick={() => update(tt.id, 1)} disabled={qty >= avail}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent/60 disabled:opacity-40 transition-all">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating cart */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50">
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-accent/20" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6 text-accent" />
                    <span className="absolute -top-2 -right-2 bg-accent text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalQty}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{totalQty} billet{totalQty > 1 ? "s" : ""}</p>
                    <p className="font-display font-bold text-accent">{formatMGA(totalAmount)}</p>
                  </div>
                </div>
                <button onClick={goCheckout}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-black font-bold hover:opacity-90 transition-all hover:scale-105"
                  style={{ background: "hsl(145 55% 40%)" }}>
                  Réserver <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}
