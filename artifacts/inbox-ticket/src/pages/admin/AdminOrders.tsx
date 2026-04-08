import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useListOrders } from "@workspace/api-client-react";
import { getBilletCodes } from "@/lib/billetCodes";
import { Search, X, ShieldCheck, Key, Hash, ScanLine } from "lucide-react";

type StatusFilter = "all" | "confirmed" | "pending" | "cancelled" | "refunded";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "Toutes" },
  { key: "confirmed", label: "Confirmées" },
  { key: "pending",   label: "En attente" },
  { key: "cancelled", label: "Annulées" },
  { key: "refunded",  label: "Remboursées" },
];

const STATUS_BADGE: Record<string, React.ReactNode> = {
  confirmed: <Badge variant="success">Confirmé</Badge>,
  pending:   <Badge variant="warning">En attente</Badge>,
  cancelled: <Badge variant="destructive">Annulé</Badge>,
  refunded:  <Badge variant="outline">Remboursé</Badge>,
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useListOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Pre-compute codes for all orders so we can search them
  const ordersWithCodes = useMemo(() => {
    return (orders ?? []).map((order) => ({
      ...order,
      codes: getBilletCodes(order.id),
    }));
  }, [orders]);

  const filtered = useMemo(() => {
    let list = ordersWithCodes;

    // Status filter
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);

    // Search
    const q = search.trim().toLowerCase().replace(/^#/, "");
    if (!q) return list;

    return list.filter((o) => {
      const orderNum = o.id.toString().padStart(6, "0");
      return (
        orderNum.includes(q) ||
        (o.customerName ?? "").toLowerCase().includes(q) ||
        (o.customerPhone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        (o.customerEmail ?? "").toLowerCase().includes(q) ||
        (o.event?.title ?? "").toLowerCase().includes(q) ||
        o.codes.ticketKey.toLowerCase().includes(q) ||
        o.codes.confirmCode.toLowerCase().includes(q) ||
        o.codes.ticketNumber.toLowerCase().includes(q)
      );
    });
  }, [ordersWithCodes, search, statusFilter]);

  // Highlight match: wrap matching text in green
  const highlight = (text: string) => {
    if (!search.trim() || !text) return text;
    const q = search.trim().replace(/^#/, "");
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/30 text-primary rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const isSearching = search.trim().length > 0;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-display text-white mb-2">Commandes</h1>
        <p className="text-muted-foreground">Recherchez et vérifiez les billets par tous les critères.</p>
      </div>

      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, téléphone, N° commande, clé de billet, code de confirmation, N° BIL…"
          className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search hint pills */}
      {!isSearching && (
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { icon: Hash,       label: "#000042 — N° commande" },
            { icon: Key,        label: "dhmnqs — Clé de billet" },
            { icon: ShieldCheck,label: "N58FA9 — Code confirmation" },
            { icon: ScanLine,   label: "BIL-000042 — N° billet" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-muted/40 border border-border rounded-xl p-1 mb-4 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 opacity-60">
                {(orders ?? []).filter((o) => o.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count when searching */}
      {isSearching && (
        <p className="text-sm text-muted-foreground mb-3">
          {filtered.length === 0
            ? "Aucun résultat."
            : `${filtered.length} commande${filtered.length > 1 ? "s" : ""} trouvée${filtered.length > 1 ? "s" : ""}`}
        </p>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Événement</TableHead>
              <TableHead>Billet(s)</TableHead>
              <TableHead>Codes de vérification</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Chargement…</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12">
                  <div className="text-center text-muted-foreground text-sm">
                    {isSearching ? "Aucun résultat pour cette recherche." : "Aucune commande."}
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.map((order) => (
              <TableRow key={order.id} className={order.status === "confirmed" ? "hover:bg-primary/5" : ""}>
                <TableCell className="font-mono text-sm font-bold">
                  {highlight(`#${order.id.toString().padStart(6, "0")}`)}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-sm">{highlight(order.customerName ?? "")}</div>
                  {order.customerPhone && (
                    <div className="text-xs text-muted-foreground">{highlight(order.customerPhone)}</div>
                  )}
                  {order.customerEmail && (
                    <div className="text-xs text-muted-foreground">{highlight(order.customerEmail)}</div>
                  )}
                </TableCell>
                <TableCell className="max-w-[160px]">
                  <div className="truncate text-sm">{highlight(order.event?.title ?? "")}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {order.quantity}x{" "}
                  <span className="text-muted-foreground text-xs">{order.ticketType?.name}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 min-w-[180px]">
                    <div className="flex items-center gap-1.5">
                      <Key className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs text-foreground/80">
                        {highlight(order.codes.ticketKey)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs font-semibold text-accent">
                        {highlight(order.codes.confirmCode)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ScanLine className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {highlight(order.codes.ticketNumber)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-accent text-sm">
                  {formatMGA(order.totalAmount)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                </TableCell>
                <TableCell>
                  {STATUS_BADGE[order.status] ?? <Badge>{order.status}</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
