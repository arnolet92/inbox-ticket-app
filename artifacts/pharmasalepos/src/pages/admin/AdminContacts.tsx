import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { STATIC_ORDERS, STATIC_USERS } from "@/data/static";
import {
  Search, Phone, Mail, MapPin, ShoppingBag, TrendingUp,
  UserCheck, UserCircle, Users, Download,
} from "lucide-react";

type FilterType = "all" | "buyer_only";

type Contact = {
  phone: string;
  name: string;
  address: string;
  orderCount: number;
  confirmedOrders: number;
  totalSpent: number;
  totalTickets: number;
  lastOrderDate: string | null;
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = ["bg-primary", "bg-blue-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-cyan-600", "bg-emerald-600"];

export default function AdminContacts() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const contacts = useMemo<Contact[]>(() => {
    const map = new Map<string, Contact>();
    STATIC_USERS.forEach((u) => {
      const key = u.phone.replace(/\s/g, "");
      map.set(key, { phone: u.phone, name: u.name, address: u.address, orderCount: 0, confirmedOrders: 0, totalSpent: 0, totalTickets: 0, lastOrderDate: null });
    });
    STATIC_ORDERS.forEach((order) => {
      const key = order.customerPhone.replace(/\s/g, "");
      if (!key) return;
      if (map.has(key)) {
        const c = map.get(key)!;
        c.orderCount += 1;
        if (order.status === "confirmed") {
          c.confirmedOrders += 1;
          c.totalSpent += order.totalAmount;
          c.totalTickets += order.quantity;
        }
        if (!c.lastOrderDate || new Date(order.createdAt) > new Date(c.lastOrderDate)) c.lastOrderDate = order.createdAt;
      } else {
        map.set(key, {
          phone: order.customerPhone,
          name: order.customerName,
          address: order.customerAddress ?? "",
          orderCount: 1,
          confirmedOrders: order.status === "confirmed" ? 1 : 0,
          totalSpent: order.status === "confirmed" ? order.totalAmount : 0,
          totalTickets: order.status === "confirmed" ? order.quantity : 0,
          lastOrderDate: order.createdAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, []);

  const stats = useMemo(() => ({
    total: contacts.length,
    buyers: contacts.filter((c) => c.orderCount > 0).length,
    totalRevenue: contacts.reduce((s, c) => s + c.totalSpent, 0),
  }), [contacts]);

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter === "buyer_only") list = list.filter((c) => c.orderCount > 0);
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  }, [contacts, search, filter]);

  function exportCSV() {
    const rows = [
      ["Nom", "Téléphone", "Adresse", "Commandes", "Total dépensé (Ar)"],
      ...filtered.map((c) => [c.name, c.phone, c.address, c.orderCount.toString(), c.totalSpent.toString()]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contacts_pharmasalepos.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "buyer_only", label: "Acheteurs" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Contacts</h1>
          <p className="text-muted-foreground">Tous les clients inscrits et acheteurs de billets.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors shrink-0"
        >
          <Download className="h-4 w-4" /> Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total contacts", value: stats.total,       icon: Users,      color: "text-foreground",  bg: "bg-muted/60" },
          { label: "Acheteurs",      value: stats.buyers,      icon: ShoppingBag,color: "text-blue-400",    bg: "bg-blue-500/10" },
          { label: "Revenu total",   value: formatMGA(stats.totalRevenue), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <Card key={s.label} className="p-5 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <div className={`text-xl font-bold font-display truncate ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, adresse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <div className="text-muted-foreground text-sm">Aucun contact trouvé.</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Téléphone / Adresse</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Billets</TableHead>
                <TableHead>Total dépensé</TableHead>
                <TableHead>Dernière commande</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact, idx) => (
                <TableRow key={contact.phone}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold font-display text-xs shrink-0 shadow-md`}>
                        {initials(contact.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{contact.name}</div>
                        {contact.address && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" /> {contact.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {contact.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.orderCount > 0 ? (
                      <Badge variant="success"><ShoppingBag className="h-3 w-3 mr-1" />Acheteur</Badge>
                    ) : (
                      <Badge variant="outline"><UserCheck className="h-3 w-3 mr-1" />Compte</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{contact.orderCount}</span>
                    {contact.confirmedOrders < contact.orderCount && contact.orderCount > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">({contact.confirmedOrders} conf.)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{contact.totalTickets > 0 ? contact.totalTickets : "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-accent">{contact.totalSpent > 0 ? formatMGA(contact.totalSpent) : "—"}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.lastOrderDate ? format(new Date(contact.lastOrderDate), "dd MMM yy", { locale: fr }) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </AdminLayout>
  );
}
