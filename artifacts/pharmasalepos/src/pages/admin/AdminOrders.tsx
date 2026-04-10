import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { STATIC_ORDERS } from "@/data/static";
import { getBilletCodes } from "@/lib/billetCodes";
import { Search, X, ShieldCheck, Key, ScanLine } from "lucide-react";

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

function hl(text: string, q: string) {
  if (!q || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-primary rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function AdminOrders() {
  const [search, setSearch]         = useState("");
  const [keySearch, setKeySearch]   = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [bilSearch, setBilSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const ordersWithCodes = useMemo(() => {
    return STATIC_ORDERS.map((order) => ({
      ...order,
      codes: getBilletCodes(order.id),
    }));
  }, []);

  const filtered = useMemo(() => {
    let list = ordersWithCodes;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);

    const q    = search.trim().toLowerCase().replace(/^#/, "");
    const qKey = keySearch.trim().toLowerCase();
    const qCode= codeSearch.trim().toUpperCase();
    const qBil = bilSearch.trim().toUpperCase();

    return list.filter((o) => {
      const orderNum = o.id.toString().padStart(6, "0");
      const matchGeneral = !q || (
        orderNum.includes(q) ||
        (o.customerName ?? "").toLowerCase().includes(q) ||
        (o.customerPhone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        (o.event?.title ?? "").toLowerCase().includes(q)
      );
      const matchKey  = !qKey  || o.codes.ticketKey.includes(qKey);
      const matchCode = !qCode || o.codes.confirmCode.includes(qCode);
      const matchBil  = !qBil  || o.codes.ticketNumber.includes(qBil);
      return matchGeneral && matchKey && matchCode && matchBil;
    });
  }, [ordersWithCodes, search, keySearch, codeSearch, bilSearch, statusFilter]);

  const isSearching = [search, keySearch, codeSearch, bilSearch].some((v) => v.trim());

  function clearAll() {
    setSearch(""); setKeySearch(""); setCodeSearch(""); setBilSearch("");
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-display text-white mb-2">Commandes</h1>
        <p className="text-muted-foreground">Recherchez et vérifiez les billets par tous les critères.</p>
      </div>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="sm:col-span-2 xl:col-span-1">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Nom / Tél. / N° commande / Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex : Rakoto, 034…, #001001"
                className="w-full px-3 pr-8 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5" /> Clé de billet
            </label>
            <div className="relative">
              <input
                type="text"
                value={keySearch}
                onChange={(e) => setKeySearch(e.target.value.toLowerCase())}
                placeholder="Ex : dhmnqs"
                maxLength={6}
                className="w-full px-3 pr-8 py-2.5 rounded-xl border border-border bg-muted/40 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground placeholder:font-sans"
              />
              {keySearch && <button onClick={() => setKeySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Code de confirmation
            </label>
            <div className="relative">
              <input
                type="text"
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value.toUpperCase())}
                placeholder="Ex : N58FA9"
                maxLength={6}
                className="w-full px-3 pr-8 py-2.5 rounded-xl border border-accent/30 bg-accent/5 text-sm font-mono text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-muted-foreground placeholder:font-sans"
              />
              {codeSearch && <button onClick={() => setCodeSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <ScanLine className="h-3.5 w-3.5" /> N° de billet
            </label>
            <div className="relative">
              <input
                type="text"
                value={bilSearch}
                onChange={(e) => setBilSearch(e.target.value.toUpperCase())}
                placeholder="Ex : BIL-001001"
                className="w-full px-3 pr-8 py-2.5 rounded-xl border border-border bg-muted/40 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground placeholder:font-sans"
              />
              {bilSearch && <button onClick={() => setBilSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
        </div>
        {isSearching && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""}
            </p>
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <X className="h-3.5 w-3.5" /> Tout effacer
            </button>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-1 bg-muted/40 border border-border rounded-xl p-1 mb-4 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === tab.key ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 opacity-60">
                {STATIC_ORDERS.filter((o) => o.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

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
            {filtered.length === 0 ? (
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
                  {hl(`#${order.id.toString().padStart(6, "0")}`, search.replace(/^#/, ""))}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-sm">{hl(order.customerName, search)}</div>
                  {order.customerPhone && (
                    <div className="text-xs text-muted-foreground">{hl(order.customerPhone, search)}</div>
                  )}
                </TableCell>
                <TableCell className="max-w-[160px]">
                  <div className="truncate text-sm">{hl(order.event?.title ?? "", search)}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {order.quantity}x{" "}
                  <span className="text-muted-foreground text-xs">{order.ticketType?.name}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 min-w-[180px]">
                    <div className="flex items-center gap-1.5">
                      <Key className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs text-foreground/80">{hl(order.codes.ticketKey, keySearch)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs font-semibold text-accent">{hl(order.codes.confirmCode, codeSearch)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ScanLine className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs text-muted-foreground">{hl(order.codes.ticketNumber, bilSearch)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-accent text-sm">{formatMGA(order.totalAmount)}</TableCell>
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
