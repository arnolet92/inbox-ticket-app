"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Scan, Ticket, Check, X, Users, TrendingUp, AlertCircle } from "lucide-react";
import { EVENTS, getOrdersForEvent } from "@/lib/mock-data";
import { formatMGA, formatDate } from "@/lib/utils";

type ScanResult = { status: "valid" | "invalid" | "already_used"; name?: string; ticketType?: string } | null;

function QRScanner({ onScan }: { onScan: (v: ScanResult) => void }) {
  const [value, setValue] = useState("");

  const simulate = () => {
    if (!value.trim()) return;
    if (value.startsWith("INBOXTICKET-")) {
      onScan({ status: "valid", name: "Rakoto Jean", ticketType: "Place assise Premium" });
    } else {
      onScan({ status: "invalid" });
    }
    setValue("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
      <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-accent/40 flex items-center justify-center mx-auto"
        style={{ background: "hsl(145 40% 8%)" }}>
        <div className="text-center">
          <Scan className="w-10 h-10 text-accent/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Scanner le QR code</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Ou saisir le code manuellement</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="INBOXTICKET-ORD-xxx-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && simulate()}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent/60 font-mono"
        />
        <button onClick={simulate}
          className="px-4 py-2.5 rounded-xl text-black font-bold text-sm hover:opacity-90 transition-all"
          style={{ background: "hsl(145 55% 40%)" }}>
          Valider
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">Format: INBOXTICKET-ORD-&#123;id&#125;-&#123;phone&#125;</p>
    </div>
  );
}

function ScanResultCard({ result, onClose }: { result: ScanResult; onClose: () => void }) {
  if (!result) return null;
  const isValid = result.status === "valid";
  return (
    <div className={`rounded-2xl border p-6 text-center space-y-3 ${isValid ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isValid ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
        {isValid ? <Check className="w-8 h-8 text-emerald-400" /> : <X className="w-8 h-8 text-red-400" />}
      </div>
      <div>
        <p className={`font-display font-extrabold text-2xl ${isValid ? "text-emerald-400" : "text-red-400"}`}>
          {isValid ? "Billet Valide ✓" : "Billet Invalide ✗"}
        </p>
        {isValid && (
          <div className="mt-2 space-y-1 text-sm">
            <p className="font-semibold">{result.name}</p>
            <p className="text-muted-foreground">{result.ticketType}</p>
          </div>
        )}
        {!isValid && <p className="text-sm text-red-400/80 mt-1">Ce billet n&apos;est pas reconnu</p>}
      </div>
      <button onClick={onClose}
        className="px-6 py-2.5 rounded-xl border border-border font-semibold text-sm hover:border-accent/40 transition-all">
        Scanner suivant
      </button>
    </div>
  );
}

export default function OrganizerEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const event = EVENTS.find((e) => e.id === Number(id));
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [tab, setTab] = useState<"overview" | "scan" | "sales">("overview");

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(145 55% 5%)" }}>
      <div className="text-center space-y-3">
        <p className="text-muted-foreground">Événement introuvable</p>
        <Link href="/organizer/events" className="text-accent hover:underline text-sm">← Retour</Link>
      </div>
    </div>
  );

  const orders = getOrdersForEvent(event.id);
  const revenue = event.ticketTypes.reduce((s, t) => s + t.price * t.soldCount, 0);
  const pct = Math.round((event.soldTickets / event.totalCapacity) * 100);

  return (
    <div className="min-h-screen" style={{ background: "hsl(145 55% 5%)" }}>
      <header className="sticky top-0 z-40 glass-panel">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => router.push("/organizer/events")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mes événements
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-sm truncate">{event.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Revenus", value: formatMGA(revenue), icon: TrendingUp },
            { label: "Vendus", value: `${event.soldTickets}/${event.totalCapacity}`, icon: Ticket },
            { label: "Remplissage", value: `${pct}%`, icon: Users },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <s.icon className="w-5 h-5 text-accent mx-auto mb-1.5" />
              <p className="font-display font-bold text-xl">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-1">
          {[
            { key: "overview", label: "Vue d'ensemble" },
            { key: "scan", label: "Scanner les billets" },
            { key: "sales", label: "Ventes" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
                tab === t.key ? "text-accent border-accent" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display font-bold text-lg mb-4">Types de billets</h2>
              <div className="space-y-4">
                {event.ticketTypes.map((tt) => {
                  const tPct = Math.round((tt.soldCount / tt.quantity) * 100);
                  return (
                    <div key={tt.id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold">{tt.name}</span>
                        <span className="text-accent font-semibold">{tt.soldCount}/{tt.quantity}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${tPct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatMGA(tt.price)}/billet</span>
                        <span>{formatMGA(tt.price * tt.soldCount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "scan" && (
          <div className="max-w-md mx-auto space-y-5">
            <div className="flex items-center gap-2 p-3 rounded-xl border border-accent/30 bg-accent/5 text-sm">
              <AlertCircle className="w-4 h-4 text-accent shrink-0" />
              <p className="text-muted-foreground">Scannez les QR codes ou saisissez le code manuellement pour valider les entrées.</p>
            </div>
            {scanResult ? (
              <ScanResultCard result={scanResult} onClose={() => setScanResult(null)} />
            ) : (
              <QRScanner onScan={setScanResult} />
            )}
          </div>
        )}

        {tab === "sales" && (
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
                      {["Client", "Billet", "Qté", "Montant", "Statut"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
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
                        <td className="px-5 py-3.5 text-sm font-semibold text-accent">{formatMGA(o.totalAmount)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            o.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                            o.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {o.status === "confirmed" ? "Confirmé" : o.status === "pending" ? "En attente" : "Annulé"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
