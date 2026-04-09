"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Search, Ticket } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { EVENTS } from "@/lib/mock-data";
import { formatMGA, formatDate, isFuture } from "@/lib/utils";

const CATEGORIES = ["Tous", "Concert", "Festival", "Soirée", "Conférence", "Mode", "Club"];

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const filtered = EVENTS.filter((ev) => {
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.city.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "Tous" || ev.category === cat;
    const matchFilter = filter === "all" ||
      (filter === "upcoming" && isFuture(ev.startDate)) ||
      (filter === "past" && !isFuture(ev.startDate));
    return matchSearch && matchCat && matchFilter;
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="py-16 border-b border-border" style={{
        background: "linear-gradient(180deg, hsl(145 55% 8%) 0%, transparent 100%)"
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-3">Tous les Événements</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Découvrez la sélection complète des événements à Madagascar
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un événement ou une ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent/60"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2">
            {["all", "upcoming", "past"].map((f) => (
              <button key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f
                    ? "bg-accent text-black"
                    : "border border-border text-muted-foreground hover:border-accent/40"
                }`}>
                {f === "all" ? "Tous" : f === "upcoming" ? "À venir" : "Passés"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 ml-2">
            {CATEGORIES.map((c) => (
              <button key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  cat === c
                    ? "bg-primary text-foreground border border-accent/40"
                    : "border border-border text-muted-foreground hover:border-accent/30"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Aucun événement trouvé</p>
            <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ev) => {
              const minPrice = Math.min(...ev.ticketTypes.map((t) => t.price));
              const pct = Math.round((ev.soldTickets / ev.totalCapacity) * 100);
              return (
                <Link key={ev.id} href={`/inbox-template/events/${ev.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-accent/40 transition-all hover:shadow-xl card-glow">
                  <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20">
                        <Ticket className="w-12 h-12 text-accent/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: "hsl(145 55% 40% / 0.2)", color: "hsl(145 55% 60%)", border: "1px solid hsl(145 55% 40% / 0.4)" }}>
                        {ev.category}
                      </span>
                      {isFuture(ev.startDate) && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent text-black">À venir</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="font-display font-bold text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2">
                      {ev.title}
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>{formatDate(ev.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate">{ev.location}, {ev.city}</span>
                      </div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground">À partir de</p>
                        <p className="font-display font-bold text-accent">{formatMGA(minPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">{pct}% complet</p>
                        <div className="w-16 h-1.5 bg-muted rounded-full mt-1">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
