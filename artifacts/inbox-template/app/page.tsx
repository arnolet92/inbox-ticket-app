"use client";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Ticket, Star, Users, Shield } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { EVENTS } from "@/lib/mock-data";
import { formatMGA, formatDate, isFuture } from "@/lib/utils";

const CATEGORIES = ["Tous", "Concert", "Festival", "Soirée", "Conférence", "Mode", "Club"];

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    Concert: "hsl(210 80% 50%)", Festival: "hsl(280 70% 55%)",
    Soirée: "hsl(340 70% 50%)", Conférence: "hsl(180 60% 40%)",
    Mode: "hsl(320 60% 50%)", Club: "hsl(260 70% 55%)",
  };
  const c = colors[cat] ?? "hsl(145 55% 40%)";
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
      {cat}
    </span>
  );
}

function EventCard({ event }: { event: typeof EVENTS[0] }) {
  const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
  const pct = Math.round((event.soldTickets / event.totalCapacity) * 100);
  return (
    <Link href={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-accent/40 transition-all hover:shadow-xl hover:shadow-accent/5 card-glow">
      <div className="aspect-[16/9] overflow-hidden bg-muted relative">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "hsl(145 40% 10%)" }}>
            <Ticket className="w-12 h-12 text-accent/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <CategoryBadge cat={event.category} />
          {isFuture(event.startDate) && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent text-black">À venir</span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-display font-bold text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2">
          {event.title}
        </h3>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">{event.location}, {event.city}</span>
          </div>
        </div>
        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">À partir de</p>
            <p className="font-display font-bold text-accent text-base">{formatMGA(minPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">{event.soldTickets}/{event.totalCapacity}</p>
            <div className="w-20 h-1.5 bg-muted rounded-full mt-1">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "hsl(145 55% 40%)" }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const upcoming = EVENTS.filter((e) => isFuture(e.startDate));

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(145 55% 15% / 0.4) 0%, transparent 70%)"
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: "hsl(145 55% 40% / 0.15)", border: "1px solid hsl(145 55% 40% / 0.3)", color: "hsl(145 55% 50%)" }}>
            <Star className="w-4 h-4" /> La billetterie de référence à Madagascar
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight mb-6">
            Vivez l&apos;événementiel<br />
            <span className="gradient-text">autrement</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Découvrez et réservez les meilleurs événements à Madagascar. Concerts, galas, festivals, conférences — votre billet en quelques clics.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/events"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-black font-bold text-lg hover:opacity-90 transition-all hover:scale-105"
              style={{ background: "hsl(145 55% 40%)" }}>
              Explorer les événements <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg border border-border hover:border-accent/40 transition-all hover:scale-105">
              Mes billets <Ticket className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Événements actifs", value: "6+", icon: Calendar },
              { label: "Billets vendus", value: "6 800+", icon: Ticket },
              { label: "Clients satisfaits", value: "5 200+", icon: Users },
              { label: "Paiements sécurisés", value: "100%", icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card">
                <stat.icon className="w-6 h-6 text-accent" />
                <p className="font-display font-extrabold text-3xl text-accent">{stat.value}</p>
                <p className="text-xs text-muted-foreground text-center">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl mb-1">Événements à venir</h2>
              <p className="text-muted-foreground">Ne manquez aucun moment fort</p>
            </div>
            <Link href="/events"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5 transition-all">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.slice(0, 3).map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
          {upcoming.length > 3 && (
            <div className="text-center mt-10">
              <Link href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-accent/40 font-semibold transition-all">
                Voir tous les événements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Payment methods */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-2xl mb-3">Paiements acceptés</h2>
          <p className="text-muted-foreground mb-8">Solutions locales adaptées à Madagascar</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { name: "Orange Money", color: "#FF6600" },
              { name: "MVola", color: "#E30613" },
              { name: "Espèces", color: "hsl(145 55% 40%)" },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card"
                style={{ borderColor: `${m.color}40` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                <span className="font-semibold text-sm">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
