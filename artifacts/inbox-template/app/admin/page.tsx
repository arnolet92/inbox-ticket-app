"use client";
import { TrendingUp, Ticket, Calendar, Clock, BarChart3, ArrowUpRight, CreditCard } from "lucide-react";
import { ADMIN_STATS, MONTHLY_REVENUE, PAYMENT_STATS, EVENTS, ORDERS } from "@/lib/mock-data";
import { formatMGA, formatDate } from "@/lib/utils";
import Link from "next/link";

const STAT_COLOR = "hsl(145 55% 40%)";

export default function AdminDashboard() {
  const recentOrders = ORDERS.slice(0, 5);
  const maxRev = Math.max(...MONTHLY_REVENUE.map((m) => m.revenue));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl mb-1">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenus totaux", value: formatMGA(ADMIN_STATS.totalRevenue), icon: TrendingUp, growth: `+${ADMIN_STATS.revenueGrowth}%`, color: STAT_COLOR },
          { label: "Commandes", value: ADMIN_STATS.totalOrders, icon: CreditCard, growth: `+${ADMIN_STATS.ordersGrowth}%`, color: "hsl(210 80% 50%)" },
          { label: "Billets vendus", value: ADMIN_STATS.totalTicketsSold, icon: Ticket, growth: null, color: "hsl(280 70% 55%)" },
          { label: "Événements actifs", value: ADMIN_STATS.activeEvents, icon: Calendar, growth: null, color: "hsl(340 70% 55%)" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 group hover:border-accent/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              {s.growth && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(145 55% 40% / 0.15)", color: STAT_COLOR }}>
                  {s.growth}
                </span>
              )}
            </div>
            <p className="font-display font-extrabold text-2xl">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" /> Revenus mensuels
              </h2>
              <p className="text-xs text-muted-foreground">6 derniers mois</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {MONTHLY_REVENUE.map((m) => {
              const h = Math.round((m.revenue / maxRev) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all cursor-default group relative"
                    style={{ height: `${h}%`, background: "hsl(145 55% 40% / 0.3)", minHeight: 4 }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-md" style={{ height: "30%", background: "hsl(145 55% 40%)" }} />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {formatMGA(m.revenue)}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payments */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display font-bold text-lg mb-4">Modes de paiement</h2>
          <div className="space-y-4">
            {PAYMENT_STATS.map((p) => {
              const color = p.method === "Orange Money" ? "#FF6600" : p.method === "MVola" ? "#E30613" : STAT_COLOR;
              return (
                <div key={p.method}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold">{p.method}</span>
                    <span className="text-muted-foreground">{p.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${p.percentage}%`, background: color }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatMGA(p.amount)} • {p.count} commandes</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" /> Commandes récentes
          </h2>
          <Link href="/admin/events" className="text-xs text-accent hover:underline flex items-center gap-1">
            Voir tout <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.map((o) => {
            const event = EVENTS.find((e) => e.id === o.eventId);
            return (
              <div key={o.id} className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-black shrink-0" style={{ background: STAT_COLOR }}>
                  {o.customerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{event?.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{formatMGA(o.totalAmount)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    o.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                    o.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {o.status === "confirmed" ? "Confirmé" : o.status === "pending" ? "En attente" : "Annulé"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
