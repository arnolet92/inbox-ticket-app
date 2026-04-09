"use client";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowUpRight, LogOut, Ticket, TrendingUp } from "lucide-react";
import { EVENTS } from "@/lib/mock-data";
import { formatMGA, formatDate, isFuture } from "@/lib/utils";
import { useRouter } from "next/navigation";

const MY_EVENTS = EVENTS.filter((e) => e.organizerId === 1);

export default function OrganizerEventsPage() {
  const router = useRouter();
  const totalRevenue = MY_EVENTS.reduce(
    (s, ev) => s + ev.ticketTypes.reduce((r, t) => r + t.price * t.soldCount, 0),
    0
  );
  const totalSold = MY_EVENTS.reduce((s, ev) => s + ev.soldTickets, 0);

  return (
    <div className="min-h-screen" style={{ background: "hsl(145 55% 5%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(145 55% 40%)" }}>
              <Ticket className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-accent">Inbox Ticket</p>
              <p className="text-[9px] text-muted-foreground">Espace Organisateur</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">Ratsimba Events</span>
            <button onClick={() => router.push("/organizer/login")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Mes Événements</h1>
          <p className="text-muted-foreground text-sm">{MY_EVENTS.length} événements gérés</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Événements", value: MY_EVENTS.length, icon: Calendar },
            { label: "Billets vendus", value: totalSold, icon: Ticket },
            { label: "Revenus", value: formatMGA(totalRevenue), icon: TrendingUp },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <s.icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="font-display font-extrabold text-2xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MY_EVENTS.map((ev) => {
            const pct = Math.round((ev.soldTickets / ev.totalCapacity) * 100);
            const revenue = ev.ticketTypes.reduce((s, t) => s + t.price * t.soldCount, 0);
            const coming = isFuture(ev.startDate);
            return (
              <div key={ev.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/30 transition-all">
                <div className="aspect-video overflow-hidden bg-muted relative">
                  {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${coming ? "bg-accent text-black" : "bg-muted text-muted-foreground"}`}>
                      {coming ? "À venir" : "Passé"}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-lg leading-tight line-clamp-2">{ev.title}</h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent" />{formatDate(ev.startDate)}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" />{ev.location}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Remplissage</span>
                      <span className="font-semibold">{ev.soldTickets}/{ev.totalCapacity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Revenus</p>
                      <p className="font-display font-bold text-accent text-sm">{formatMGA(revenue)}</p>
                    </div>
                    <Link href={`/organizer/events/${ev.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-accent/40 transition-all">
                      Gérer <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
