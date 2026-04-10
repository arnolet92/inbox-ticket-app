import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Ticket, DollarSign, CalendarDays, ShoppingBag } from "lucide-react";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA, formatPaymentMethod } from "@/lib/utils";
import { useGetAdminStats, useGetRevenueByMonth, useGetSalesByEvent, useGetPaymentMethodStats, useListOrders } from "@workspace/api-client-react";

export default function AdminDashboard() {
  const { data: stats } = useGetAdminStats();
  const { data: revenueData } = useGetRevenueByMonth();
  const { data: salesData } = useGetSalesByEvent();
  const { data: paymentData } = useGetPaymentMethodStats();
  const { data: recentOrders } = useListOrders({ status: "confirmed" });

  const COLORS = ['#4caf50', '#1a4a2e', '#ff6600', '#00b050', '#8884d8'];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité de la plateforme.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-card to-background border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">+{stats?.revenueGrowth || 0}%</Badge>
          </div>
          <div className="text-sm font-semibold text-muted-foreground mb-1">Revenus Totaux</div>
          <div className="text-3xl font-bold font-display text-white">{formatMGA(stats?.totalRevenue)}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-background border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">+{stats?.ordersGrowth || 0}%</Badge>
          </div>
          <div className="text-sm font-semibold text-muted-foreground mb-1">Commandes</div>
          <div className="text-3xl font-bold font-display text-white">{stats?.totalOrders || 0}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-background border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <Ticket className="h-6 w-6" />
            </div>
          </div>
          <div className="text-sm font-semibold text-muted-foreground mb-1">Tickets Vendus</div>
          <div className="text-3xl font-bold font-display text-white">{stats?.totalTicketsSold || 0}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-background border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
              <CalendarDays className="h-6 w-6" />
            </div>
            <Badge variant="outline">{stats?.activeEvents || 0} actifs</Badge>
          </div>
          <div className="text-sm font-semibold text-muted-foreground mb-1">Total Événements</div>
          <div className="text-3xl font-bold font-display text-white">{stats?.totalEvents || 0}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-lg mb-6">Évolution des Revenus (12 derniers mois)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#222', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => formatMGA(value)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#4caf50" strokeWidth={3} dot={{ r: 4, fill: '#4caf50', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods Chart */}
        <Card className="p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6">Méthodes de Paiement</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="method" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatPaymentMethod} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#111', borderColor: '#222', borderRadius: '8px' }}
                  formatter={(value: number) => formatMGA(value)}
                />
                <Bar dataKey="amount" fill="#1a4a2e" radius={[0, 4, 4, 0]}>
                  {paymentData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Commandes Récentes</h3>
            <Badge variant="outline">Voir tout</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders?.slice(0, 5).map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.event?.title}</TableCell>
                  <TableCell className="font-bold text-accent">{formatMGA(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Confirmé</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!recentOrders?.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">Aucune commande récente</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg mb-6">Ventes par Événement</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                  stroke="none"
                >
                  {salesData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#222', borderRadius: '8px' }}
                  formatter={(value: number) => formatMGA(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {salesData?.slice(0,3).map((item, idx) => (
              <div key={item.eventId} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="truncate max-w-[150px]">{item.eventTitle}</span>
                </div>
                <span className="font-bold">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
