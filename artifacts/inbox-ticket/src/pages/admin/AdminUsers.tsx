import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useListOrders } from "@workspace/api-client-react";
import { Search, Users, Phone, MapPin, ShoppingBag, TrendingUp, UserCircle } from "lucide-react";

type StoredAccount = { name: string; address: string; phone: string; password: string };

function getAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem("inbox_ticket_accounts") || "[]"); } catch { return []; }
}

export default function AdminUsers() {
  const { data: orders, isLoading } = useListOrders();
  const [search, setSearch] = useState("");

  const accounts = useMemo(() => getAccounts(), []);

  const usersWithStats = useMemo(() => {
    return accounts.map((acc) => {
      const clean = acc.phone.replace(/\s/g, "");
      const userOrders = (orders ?? []).filter(
        (o) => (o.customerPhone ?? "").replace(/\s/g, "") === clean
      );
      const confirmed = userOrders.filter((o) => o.status === "confirmed");
      const totalSpent = confirmed.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
      const totalTickets = confirmed.reduce((sum, o) => sum + (o.quantity ?? 0), 0);
      return {
        ...acc,
        orderCount: userOrders.length,
        confirmedCount: confirmed.length,
        totalSpent,
        totalTickets,
        lastOrder: userOrders.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0],
      };
    });
  }, [accounts, orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return usersWithStats;
    return usersWithStats.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.address ?? "").toLowerCase().includes(q)
    );
  }, [usersWithStats, search]);

  const stats = useMemo(() => ({
    total: accounts.length,
    withOrders: usersWithStats.filter((u) => u.orderCount > 0).length,
    totalRevenue: usersWithStats.reduce((s, u) => s + u.totalSpent, 0),
  }), [accounts, usersWithStats]);

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white mb-2">Utilisateurs</h1>
        <p className="text-muted-foreground">Liste des comptes inscrits sur la plateforme.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Comptes inscrits</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display">{stats.withOrders}</div>
            <div className="text-sm text-muted-foreground">Ont commandé</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-accent">{formatMGA(stats.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Revenu total utilisateurs</div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <div className="text-muted-foreground text-sm">
              {search ? "Aucun résultat pour cette recherche." : "Aucun utilisateur inscrit pour le moment."}
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Billets achetés</TableHead>
                <TableHead>Total dépensé</TableHead>
                <TableHead>Dernière commande</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.phone}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display text-xs shrink-0 shadow-md shadow-primary/20">
                        {initials(user.name)}
                      </div>
                      <span className="font-semibold text-foreground">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {user.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.address ? (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground max-w-[180px] truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {user.address}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{user.orderCount}</span>
                    {user.confirmedCount < user.orderCount && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({user.confirmedCount} conf.)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{user.totalTickets > 0 ? user.totalTickets : "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-accent">
                      {user.totalSpent > 0 ? formatMGA(user.totalSpent) : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastOrder
                      ? format(new Date(user.lastOrder.createdAt), "dd MMM yy", { locale: fr })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {user.orderCount > 0 ? (
                      <Badge variant="success">Actif</Badge>
                    ) : (
                      <Badge variant="outline">Inscrit</Badge>
                    )}
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
