"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Search, ArrowUpRight, TrendingUp } from "lucide-react";
import { EVENTS } from "@/lib/mock-data";
import { formatMGA, formatDate, isFuture } from "@/lib/utils";

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const filtered = EVENTS.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Événements</h1>
          <p className="text-muted-foreground text-sm">{EVENTS.length} événements au total</p>
        </div>
        <button className="px-4 py-2 rounded-xl text-black font-bold text-sm hover:opacity-90 transition-all"
          style={{ background: "hsl(145 55% 40%)" }}>
          + Nouvel événement
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent/60" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                {["Événement", "Date", "Lieu", "Capacité", "Revenus", "Statut", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ev) => {
                const revenue = ev.ticketTypes.reduce((s, t) => s + t.price * t.soldCount, 0);
                const pct = Math.round((ev.soldTickets / ev.totalCapacity) * 100);
                const coming = isFuture(ev.startDate);
                return (
                  <tr key={ev.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-sm">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">{ev.category}</p>
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                        {formatDate(ev.startDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                        {ev.city}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{ev.soldTickets}/{ev.totalCapacity}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-display font-bold text-accent text-sm">{formatMGA(revenue)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        coming ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {coming ? "À venir" : "Passé"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/inbox-template/admin/events/${ev.id}`}
                        className="flex items-center gap-1 text-xs text-accent hover:underline whitespace-nowrap">
                        Voir <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
