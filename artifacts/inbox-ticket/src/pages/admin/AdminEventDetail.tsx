import React, { useState } from "react";
import { useParams, Link } from "wouter";
import {
  ChevronLeft, TrendingUp, Ticket, Users, CreditCard, ShoppingCart,
  Plus, Edit, Trash2, Phone, Mail, UserCircle, Calendar, MapPin,
  CheckCircle, XCircle, Clock, UserCheck, Settings,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Button, Badge, Dialog, Input, Label, Select, Textarea,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import { formatMGA, formatPaymentMethod } from "@/lib/utils";
import { getCategoryImage } from "@/components/EventCard";
import {
  useGetEvent, useListOrders, useListTicketTypes,
  useCreateTicketType, useDeleteEvent,
} from "@workspace/api-client-react";

type Tab = "overview" | "tickets" | "orders" | "staff";

const STAFF_ROLES = [
  { id: 1, name: "Rakoto Jean", role: "Responsable billetterie", phone: "032 12 345 67", status: "confirmed" },
  { id: 2, name: "Rasoa Marie", role: "Agent de sécurité", phone: "034 98 765 43", status: "confirmed" },
  { id: 3, name: "Andry Paul", role: "Hôte / Hôtesse", phone: "033 11 223 34", status: "pending" },
  { id: 4, name: "Fanja Claire", role: "Technicien son & lumière", phone: "032 55 667 78", status: "confirmed" },
  { id: 5, name: "Hery Luc", role: "Coordinateur général", phone: "034 44 556 66", status: "pending" },
];

export default function AdminEventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);
  const { data: orders, isLoading: ordersLoading } = useListOrders({ eventId });
  const { data: ticketTypes, isLoading: ticketsLoading } = useListTicketTypes({ eventId });

  const createTicketType = useCreateTicketType();

  if (eventLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="text-center py-32">
          <h2 className="text-2xl font-bold mb-4">Événement introuvable</h2>
          <Link href="/admin/events"><Button variant="outline">Retour aux événements</Button></Link>
        </div>
      </AdminLayout>
    );
  }

  const confirmedOrders = orders?.filter((o) => o.status === "confirmed") ?? [];

  const totalRevenue = confirmedOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
  const totalTickets = confirmedOrders.reduce((s, o) => s + o.quantity, 0);
  const fillPct = event.totalCapacity > 0 ? Math.round((event.soldTickets / event.totalCapacity) * 100) : 0;

  const revenueByMethod = ["orange_money", "mvola", "mastercard"].map((method) => {
    const methodOrders = confirmedOrders.filter((o) => o.payment?.method === method);
    const amount = methodOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
    return { method, amount, count: methodOrders.length };
  });

  const methodColors: Record<string, string> = {
    orange_money: "#ff6600",
    mvola: "#e02020",
    mastercard: "#3b82f6",
  };
  const methodLabels: Record<string, string> = {
    orange_money: "Orange Money",
    mvola: "MVola",
    mastercard: "Mastercard",
  };
  const methodIcons: Record<string, string> = {
    orange_money: "OM",
    mvola: "M",
    mastercard: "💳",
  };

  const handleAddTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createTicketType.mutateAsync({
        data: {
          eventId,
          name: fd.get("name") as string,
          description: fd.get("description") as string,
          price: fd.get("price") as string,
          quantity: Number(fd.get("quantity")),
          currency: "MGA",
        },
      });
      setIsAddTicketOpen(false);
    } catch (err) {
      alert("Erreur lors de la création du billet");
    }
  };

  const imageSrc = event.imageUrl || getCategoryImage(event.category);

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Vue d'ensemble", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "tickets", label: "Billets", icon: <Ticket className="w-4 h-4" /> },
    { key: "orders", label: "Commandes & Paiements", icon: <ShoppingCart className="w-4 h-4" /> },
    { key: "staff", label: "Staff", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout>
      {/* Back link */}
      <Link href="/admin/events">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Retour aux événements
        </button>
      </Link>

      {/* Event banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-52">
        <img src={imageSrc} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-black/50 backdrop-blur border-white/10 text-white">{event.category}</Badge>
              <Badge
                className={
                  event.status === "upcoming"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-muted text-muted-foreground"
                }
              >
                {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold font-display text-white mb-1">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(event.startDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}, {event.city}
              </span>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
            <Button variant="outline" size="sm" className="bg-black/40 border-white/20 text-white hover:bg-white/10">
              <Edit className="w-4 h-4 mr-2" /> Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card rounded-xl border border-border mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: OVERVIEW ─── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Chiffre d'affaires", value: formatMGA(totalRevenue), icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Billets vendus", value: `${event.soldTickets} / ${event.totalCapacity}`, icon: <Ticket className="w-5 h-5" />, color: "text-blue-400" },
              { label: "Commandes", value: String(orders?.length ?? 0), icon: <ShoppingCart className="w-5 h-5" />, color: "text-violet-400" },
              { label: "Taux de remplissage", value: `${fillPct}%`, icon: <UserCheck className="w-5 h-5" />, color: fillPct >= 80 ? "text-orange-400" : "text-emerald-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <div className="text-2xl font-bold font-display mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </Card>
            ))}
          </div>

          {/* Filling progress */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-4">Remplissage de la salle</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="w-full bg-input rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: fillPct >= 90 ? "hsl(0 70% 50%)" : fillPct >= 60 ? "hsl(38 95% 50%)" : "hsl(145 60% 35%)",
                    }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold font-display text-accent w-16 text-right">{fillPct}%</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{event.soldTickets.toLocaleString("fr-FR")} billets vendus</span>
              <span>Capacité : {event.totalCapacity.toLocaleString("fr-FR")}</span>
            </div>
          </Card>

          {/* Revenue by payment method */}
          <div>
            <h3 className="font-bold font-display text-lg mb-4">Chiffre d'affaires par mode de paiement</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {revenueByMethod.map(({ method, amount, count }) => (
                <Card key={method} className="p-6 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: methodColors[method] }}
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm text-white"
                      style={{ background: methodColors[method] }}
                    >
                      {methodIcons[method]}
                    </div>
                    <div>
                      <div className="font-bold">{methodLabels[method]}</div>
                      <div className="text-xs text-muted-foreground">{count} paiement{count > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="text-3xl font-display font-bold" style={{ color: methodColors[method] }}>
                    {formatMGA(amount)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0}% du total
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Revenue total recap */}
          <Card className="p-6 border-accent/20 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Chiffre d'affaires total</div>
                <div className="text-4xl font-display font-bold text-accent">{formatMGA(totalRevenue)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Commandes confirmées</div>
                <div className="text-2xl font-bold">{confirmedOrders.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Total billets vendus</div>
                <div className="text-2xl font-bold">{totalTickets}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB: TICKETS ─── */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-xl">Types de billets</h3>
            <Button variant="accent" size="sm" onClick={() => setIsAddTicketOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Nouveau type
            </Button>
          </div>

          {ticketsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
            </div>
          ) : ticketTypes?.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-bold mb-2">Aucun type de billet</h4>
              <p className="text-muted-foreground text-sm mb-4">Ajoutez des types de billets pour cet événement.</p>
              <Button variant="accent" size="sm" onClick={() => setIsAddTicketOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter un billet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ticketTypes?.map((tt) => {
                const ticketOrders = confirmedOrders.filter((o) => o.ticketTypeId === tt.id);
                const ticketRevenue = ticketOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
                const sold = tt.soldCount ?? 0;
                const fillPctTt = tt.quantity > 0 ? Math.round((sold / tt.quantity) * 100) : 0;

                return (
                  <Card key={tt.id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold font-display">{tt.name}</h4>
                            <p className="text-sm text-muted-foreground">{tt.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-3.5 h-3.5 text-blue-400" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>{sold} / {tt.quantity} vendus</span>
                            <span>{fillPctTt}%</span>
                          </div>
                          <div className="w-full bg-input rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${fillPctTt}%`,
                                background: fillPctTt >= 90 ? "hsl(0 70% 50%)" : "hsl(145 60% 35%)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-6 md:gap-2 md:text-right shrink-0 md:border-l md:border-border/50 md:pl-6">
                        <div>
                          <div className="text-xs text-muted-foreground">Prix unitaire</div>
                          <div className="text-xl font-display font-bold text-accent">{formatMGA(tt.price)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Revenus générés</div>
                          <div className="text-lg font-bold text-emerald-400">{formatMGA(ticketRevenue)}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Add ticket dialog */}
          <Dialog isOpen={isAddTicketOpen} onClose={() => setIsAddTicketOpen(false)} title="Nouveau type de billet">
            <form onSubmit={handleAddTicket} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du billet</Label>
                <Input name="name" required placeholder="Ex: VIP, Standard, Économique" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix (Ar)</Label>
                  <Input name="price" type="number" required min="0" placeholder="Ex: 50000" />
                </div>
                <div className="space-y-2">
                  <Label>Quantité disponible</Label>
                  <Input name="quantity" type="number" required min="1" placeholder="Ex: 200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" placeholder="Description des avantages..." />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddTicketOpen(false)}>Annuler</Button>
                <Button type="submit" variant="accent" isLoading={createTicketType.isPending}>Créer le billet</Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}

      {/* ─── TAB: ORDERS & PAYMENTS ─── */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total commandes", value: orders?.length ?? 0, color: "text-foreground" },
              { label: "Confirmées", value: confirmedOrders.length, color: "text-emerald-400" },
              { label: "En attente", value: orders?.filter((o) => o.status === "pending").length ?? 0, color: "text-orange-400" },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </Card>
            ))}
          </div>

          {ordersLoading ? (
            <div className="h-48 bg-card rounded-xl animate-pulse" />
          ) : orders?.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune commande pour cet événement.</p>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Billet</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          #{String(order.id).padStart(5, "0")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                              {order.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{order.customerName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {order.customerEmail}
                              </div>
                              {order.customerPhone && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {order.customerPhone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{order.ticketType?.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">x{order.quantity}</div>
                        </TableCell>
                        <TableCell>
                          {order.payment ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-white"
                                style={{ background: methodColors[order.payment.method] ?? "#888" }}
                              >
                                {methodIcons[order.payment.method] ?? "?"}
                              </div>
                              <span className="text-sm">{methodLabels[order.payment.method] ?? order.payment.method}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-accent">{formatMGA(order.totalAmount)}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "dd MMM yy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "confirmed" ? "success"
                              : order.status === "cancelled" ? "destructive"
                              : "warning"
                            }
                          >
                            {order.status === "confirmed" ? (
                              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Confirmé</span>
                            ) : order.status === "cancelled" ? (
                              <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Annulé</span>
                            ) : (
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: STAFF ─── */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-xl">Équipe staff ({STAFF_ROLES.length} membres)</h3>
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un membre
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {STAFF_ROLES.map((member) => (
              <Card key={member.id} className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center font-bold text-lg text-white shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.role}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {member.phone}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <Badge variant={member.status === "confirmed" ? "success" : "warning"}>
                    {member.status === "confirmed" ? "Confirmé" : "En attente"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Edit className="w-3 h-3 text-blue-400" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 border-dashed border-accent/20 bg-primary/5">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="font-semibold mb-1">Gestion avancée du staff</div>
                <p className="text-sm text-muted-foreground">
                  Assignez des rôles, gérez les accréditations et les horaires de chaque membre de l'équipe pour cet événement.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
