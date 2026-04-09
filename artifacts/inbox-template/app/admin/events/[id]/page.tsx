"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, Ticket, TrendingUp } from "lucide-react";
import { EVENTS, getOrdersForEvent } from "@/lib/mock-data";
import { formatMGA, formatDate } from "@/lib/utils";

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const event = EVENTS.find((e) => e.id === Number(id));
  if (!event) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <p className="text-muted-foreground">Événement introuvable</p>
      <Link href="/admin/events" className="text-accent hover:underline text-sm">← Retour</Link>
    </div>
  );

  const orders = getOrdersForEvent(event.id);
  const revenue = event.ticketTypes.reduce((s, t) => s + t.price * t.soldCount, 0);
  const pct = Math.round((event.soldTickets / event.totalCapacity) * 100);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux événements
        </Link>
        <h1 className="font-display font-extrabold text-3xl">{event.title}</h1>
        <p className="text-muted-foreground text-sm flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-accent" />{formatDate(event.startDate)}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-accent" />{event.location}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenus", value: formatMGA(revenue), icon: TrendingUp, color: "hsl(145 55% 40%)" },
          { label: "Billets vendus", value: event.soldTickets, icon: Ticket, color: "hsl(210 80% 50%)" },
          { label: "Capacité", value: event.totalCapacity, icon: Users, color: "hsl(280 70% 55%)" },
          { label: "Remplissage", value: `${pct}%`, icon: Users, color: "hsl(340 70% 55%)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-display font-extrabold text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ticket types */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">Types de billets</h2>
        </div>
        <div className="divide-y divide-border">
          {event.ticketTypes.map((tt) => {
            const tPct = Math.round((tt.soldCount / tt.quantity) * 100);
            const tRevenue = tt.price * tt.soldCount;
            return (
              <div key={tt.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{tt.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tt.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-32 h-1.5 bg-muted rounded-full">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${tPct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{tt.soldCount}/{tt.quantity}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-accent">{formatMGA(tRevenue)}</p>
                  <p className="text-xs text-muted-foreground">{formatMGA(tt.price)} × {tt.soldCount}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">Commandes ({orders.length})</h2>
        </div>
        {orders.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">Aucune commande</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  {["Client", "Billet", "Qté", "Montant", "Paiement", "Statut", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{o.ticketType?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-center">{o.quantity}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-sm text-accent">{formatMGA(o.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-secondary border border-border">
                        {o.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        o.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                        o.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {o.status === "confirmed" ? "Confirmé" : o.status === "pending" ? "En attente" : "Annulé"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
