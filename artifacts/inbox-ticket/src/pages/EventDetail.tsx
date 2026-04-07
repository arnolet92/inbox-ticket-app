import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Users, Info, ChevronRight, Ticket as TicketIcon, Plus, Minus, ShoppingCart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PublicLayout } from "@/components/layout";
import { Button, Card, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getCategoryEmoji, getCategoryImage } from "@/components/EventCard";
import { useGetEvent } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: event, isLoading } = useGetEvent(Number(id));
  const { user } = useAuth();

  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const updateQty = (ticketId: number, delta: number, max: number) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.min(max, Math.max(0, current + delta));
      if (next === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: next };
    });
  };

  const cartItems = useMemo(() => {
    if (!event?.ticketTypes) return [];
    return event.ticketTypes
      .filter(t => (quantities[t.id] || 0) > 0)
      .map(t => ({ ticket: t, qty: quantities[t.id] }));
  }, [quantities, event]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + parseFloat(String(item.ticket.price)) * item.qty,
    0
  );
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const firstItem = cartItems[0];
    const checkoutUrl = `/checkout?eventId=${event!.id}&ticketTypeId=${firstItem.ticket.id}&qty=${firstItem.qty}`;
    if (!user) {
      setLocation(`/auth?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }
    setLocation(checkoutUrl);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="text-center py-32">Événement introuvable</div>
      </PublicLayout>
    );
  }

  const heroBg = event.imageUrl || getCategoryImage(event.category);

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={heroBg}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className="bg-accent/20 text-accent border border-accent/30 text-sm px-3 py-1">
                {getCategoryEmoji(event.category)} {event.category}
              </Badge>
              <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/20">
                {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-2 drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-40">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Info Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Calendar className="h-5 w-5" />, label: "Date début", value: format(new Date(event.startDate), "dd MMM yyyy", { locale: fr }), sub: format(new Date(event.startDate), "HH:mm") },
                { icon: <Calendar className="h-5 w-5" />, label: "Date fin", value: format(new Date(event.endDate), "dd MMM yyyy", { locale: fr }), sub: format(new Date(event.endDate), "HH:mm") },
                { icon: <MapPin className="h-5 w-5" />, label: "Lieu", value: event.location, sub: event.city },
                { icon: <Users className="h-5 w-5" />, label: "Capacité", value: `${event.totalCapacity} places`, sub: `${event.totalCapacity - event.soldTickets} restantes` },
              ].map((item, i) => (
                <div key={i} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-accent flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                  <div className="font-semibold text-sm line-clamp-1">{item.value}</div>
                  <div className="text-xs text-accent">{item.sub}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-bold font-display flex items-center gap-2 mb-4">
                <Info className="text-accent" /> À propos de l'événement
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{event.description}</p>
            </div>
          </div>

          {/* Ticket Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <h3 className="text-2xl font-bold font-display flex items-center gap-2 mb-6">
                <TicketIcon className="text-accent" /> Billets disponibles
              </h3>

              {!event.ticketTypes?.length ? (
                <Card className="p-6 text-center text-muted-foreground border-dashed">
                  Aucun billet configuré.
                </Card>
              ) : (
                <div className="space-y-4">
                  {event.ticketTypes.map(ticket => {
                    const isSoldOut = ticket.soldCount >= ticket.quantity;
                    const available = ticket.quantity - ticket.soldCount;
                    const qty = quantities[ticket.id] || 0;
                    const hasQty = qty > 0;

                    return (
                      <motion.div
                        key={ticket.id}
                        layout
                        animate={{ scale: hasQty ? 1.01 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className={`p-5 transition-all duration-200 ${
                          isSoldOut ? "opacity-50 grayscale" : ""
                        } ${hasQty ? "ring-2 ring-accent border-accent bg-accent/5 shadow-lg shadow-accent/10" : "hover:border-accent/30"}`}>
                          {/* Header */}
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="font-bold text-lg leading-tight">{ticket.name}</h4>
                              {ticket.name === "VIP" && (
                                <span className="text-xs text-yellow-400 font-semibold">★ Premium</span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-display font-bold text-accent text-lg whitespace-nowrap">
                                {formatMGA(ticket.price)}
                              </div>
                              <div className="text-xs text-muted-foreground">/ personne</div>
                            </div>
                          </div>

                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mt-1 mb-3">{ticket.description}</p>
                          )}

                          {/* Availability bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span className={isSoldOut ? "text-destructive font-semibold" : "text-emerald-400 font-semibold"}>
                                {isSoldOut ? "Épuisé" : `${available} place${available > 1 ? "s" : ""} disponible${available > 1 ? "s" : ""}`}
                              </span>
                              <span className="text-muted-foreground">{ticket.soldCount}/{ticket.quantity}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isSoldOut ? "bg-destructive" : "bg-accent"}`}
                                style={{ width: `${Math.min(100, (ticket.soldCount / ticket.quantity) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Quantity Controls — always visible if not sold out */}
                          {!isSoldOut && (
                            <div className="flex items-center justify-between bg-background/60 rounded-xl p-1 border border-border/50">
                              <button
                                onClick={() => updateQty(ticket.id, -1, available)}
                                disabled={qty === 0}
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <div className="flex-1 text-center">
                                {qty === 0 ? (
                                  <span className="text-sm text-muted-foreground">Ajouter</span>
                                ) : (
                                  <motion.span
                                    key={qty}
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="font-bold text-lg text-accent block"
                                  >
                                    {qty}
                                  </motion.span>
                                )}
                              </div>

                              <button
                                onClick={() => updateQty(ticket.id, +1, available)}
                                disabled={qty >= available}
                                className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent text-white hover:bg-accent/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Sub-total for this ticket */}
                          <AnimatePresence>
                            {hasQty && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-accent/20">
                                  <span className="text-sm text-muted-foreground">Sous-total</span>
                                  <span className="font-bold text-accent">
                                    {formatMGA(parseFloat(String(ticket.price)) * qty)}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Checkout Bar */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-accent/20" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                {/* Cart summary */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6 text-accent" />
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalQty}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {totalQty} billet{totalQty > 1 ? "s" : ""} sélectionné{totalQty > 1 ? "s" : ""}
                    </div>
                    <div className="font-display font-bold text-xl text-white">
                      {formatMGA(totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Breakdown (desktop only) */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {cartItems.map(item => (
                    <div key={item.ticket.id} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 text-sm">
                      <span className="font-semibold text-accent">{item.qty}×</span>
                      <span className="text-foreground">{item.ticket.name}</span>
                      <button
                        onClick={() => setQuantities(prev => { const { [item.ticket.id]: _, ...rest } = prev; return rest; })}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  variant="accent"
                  size="lg"
                  className="shrink-0 text-base font-bold px-8 shadow-lg shadow-accent/30 group"
                  onClick={handleCheckout}
                >
                  Réserver
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}
