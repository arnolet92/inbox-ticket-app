import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Ticket, DollarSign, CalendarDays, ShoppingBag } from "lucide-react";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA, formatPaymentMethod } from "@/lib/utils";
import {
  STATIC_ADMIN_STATS, STATIC_REVENUE_BY_MONTH, STATIC_SALES_BY_EVENT,
  STATIC_PAYMENT_STATS, STATIC_ORDERS, STATIC_EVENTS,
} from "@/data/static";

const COLORS = ["#4caf50", "#1a4a2e", "#ff6600", "#00b050", "#8884d8"];

export default function AdminDashboard() {
  const stats = STATIC_ADMIN_STATS;
  const recentOrders = STATIC_ORDERS.filter(o => o.status === "confirmed").slice(0, 5);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité de la plateforme.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: <DollarSign className="h-6 w-6" />, color: "accent", label: "Revenus Totaux", value: formatMGA(stats.totalRevenue), growth: `+${stats.revenueGrowth}%` },
          { icon: <ShoppingBag className="h-6 w-6" />, color: "blue-500", label: "Commandes", value: stats.totalOrders, growth: `+${stats.ordersGrowth}%` },
          { icon: <Ticket className="h-6 w-6" />, color: "orange-500", label: "Tickets Vendus", value: stats.totalTicketsSold, growth: null },
          { icon: <CalendarDays className="h-6 w-6" />, color: "purple-500", label: "Événements", value: stats.totalEvents, growth: null },
        ].map((kpi, i) => (
          <Card key={i} className="p-6 bg-gradient-to-br from-card to-background border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center`}>{kpi.icon}</div>
              {kpi.growth && <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">{kpi.growth}</Badge>}
            </div>
            <div className="text-sm font-semibold text-muted-foreground mb-1">{kpi.label}</div>
            <div className="text-3xl font-bold font-display text-white">{kpi.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Revenus par mois</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={STATIC_REVENUE_BY_MONTH}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: any) => [formatMGA(v), "Revenus"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Méthodes de paiement</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={STATIC_PAYMENT_STATS} dataKey="count" nameKey="method" cx="50%" cy="50%" outerRadius={80} label={({ method, percent }) => `${method} ${(percent! * 100).toFixed(0)}%`}>
                {STATIC_PAYMENT_STATS.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-lg font-bold mb-6">Ventes par événement</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={STATIC_SALES_BY_EVENT}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6">Commandes récentes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Événement</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{String(o.id).padStart(6, "0")}</TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell className="max-w-[160px] truncate">{o.event.title}</TableCell>
                <TableCell>{formatPaymentMethod(o.paymentMethod)}</TableCell>
                <TableCell className="font-semibold text-accent">{formatMGA(o.totalAmount)}</TableCell>
                <TableCell><Badge variant="success">Confirmé</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
