import React, { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import {
  ChevronLeft, Ticket, Users, ShoppingCart, Plus, Trash2,
  Calendar, MapPin, TrendingUp, Search,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { OrganizerLayout } from "@/components/layout";
import {
  Card, Button, Badge, Dialog, Input, Label, Select, Textarea,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getCategoryImage } from "@/components/EventCard";
import { PaymentBadge } from "@/components/PaymentBadge";
import {
  useGetEvent, useListOrders, useListTicketTypes,
  useCreateTicketType, useDeleteEvent,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

type Tab = "overview" | "tickets" | "orders";

export default function OrganizerEventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id ?? "0", 10);
  const [tab, setTab] = useState<Tab>("overview");
  const [orderSearch, setOrderSearch] = useState("");
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: event, isLoading } = useGetEvent(eventId, { query: { enabled: eventId > 0 } });
  const { data: orders } = useListOrders({ eventId }, { query: { enabled: eventId > 0 } });
  const { data: ticketTypes } = useListTicketTypes({ eventId }, { query: { enabled: eventId > 0 } });
  const createTicketType = useCreateTicketType();
  const deleteEvent = useDeleteEvent();

  const stats = useMemo(() => {
    const totalRevenue = orders
      ?.filter((o) => o.paymentStatus === "completed")
      .reduce((s, o) => s + parseFloat(String(o.totalAmount)), 0) ?? 0;
    const confirmedOrders = orders?.filter((o) => o.paymentStatus === "completed").length ?? 0;
    const pendingOrders = orders?.filter((o) => o.paymentStatus === "pending").length ?? 0;
    return { totalRevenue, confirmedOrders, pendingOrders };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const q = orderSearch.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.toLowerCase().includes(q) ||
        String(o.id).includes(q)
    );
  }, [orders, orderSearch]);

  const handleAddTicketType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createTicketType.mutateAsync({
        data: {
          eventId,
          name: fd.get("name") as string,
          description: (fd.get("description") as string) || null,
          price: parseFloat(fd.get("price") as string),
          currency: "MGA",
          quantity: parseInt(fd.get("quantity") as string, 10),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["ticket-types", eventId] });
      setIsAddTicketOpen(false);
    } catch {
      alert("Erreur lors de la création du type de billet");
    }
  };

  const handleDelete = async () => {
    if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
      await deleteEvent.mutateAsync({ id: eventId });
      navigate("/organizer/events");
    }
  };

  if (isLoading) {
    return (
      <OrganizerLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-card rounded-2xl" />
          <div className="h-12 bg-card rounded-xl w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-card rounded-2xl" />)}
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  if (!event) {
    return (
      <OrganizerLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground">Événement introuvable.</p>
          <Link href="/organizer/events">
            <Button variant="outline" className="mt-4">← Retour à mes événements</Button>
          </Link>
        </div>
      </OrganizerLayout>
    );
  }

  const imageSrc = event.imageUrl || getCategoryImage(event.category);
  const fillPct = event.totalCapacity > 0
    ? Math.round((event.soldTickets / event.totalCapacity) * 100)
    : 0;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Vue d'ensemble", icon: TrendingUp },
    { key: "tickets", label: "Types de billets", icon: Ticket },
    { key: "orders", label: "Commandes", icon: ShoppingCart },
  ];

  return (
    <OrganizerLayout>
      {/* Back link */}
      <Link href="/organizer/events">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium">
          <ChevronLeft className="h-4 w-4" /> Mes événements
        </button>
      </Link>

      {/* Hero banner */}
      <div className="relative h-52 rounded-2xl overflow-hidden mb-8">
        <img src={imageSrc} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge className="bg-black/60 backdrop-blur border-white/10 text-white text-xs">
                {event.category}
              </Badge>
              <Badge
                className={
                  event.status === "upcoming"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : event.status === "ongoing"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-muted text-muted-foreground"
                }
              >
                {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold font-display text-white">{event.title}</h1>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {event.location}, {event.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(event.startDate), "d MMMM yyyy", { locale: fr })}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-xl p-1 mb-8 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === key
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── VUE D'ENSEMBLE ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenus", value: formatMGA(stats.totalRevenue), icon: TrendingUp, color: "text-accent" },
              { label: "Commandes confirmées", value: stats.confirmedOrders, icon: ShoppingCart, color: "text-emerald-400" },
              { label: "En attente", value: stats.pendingOrders, icon: ShoppingCart, color: "text-amber-400" },
              { label: "Billets vendus", value: event.soldTickets, icon: Ticket, color: "text-blue-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </div>
                <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
              </Card>
            ))}
          </div>

          {/* Capacity */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-accent" />
              <h3 className="font-bold font-display">Capacité</h3>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{event.soldTickets} billets vendus</span>
              <span className="font-bold text-accent">{fillPct}%</span>
            </div>
            <div className="w-full bg-input rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${fillPct}%`,
                  background: fillPct >= 90 ? "hsl(0 70% 50%)" : fillPct >= 60 ? "hsl(38 95% 50%)" : "hsl(145 60% 35%)",
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {event.totalCapacity - event.soldTickets} places restantes sur {event.totalCapacity.toLocaleString("fr-FR")}
            </p>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h3 className="font-bold font-display mb-3">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
          </Card>
        </div>
      )}

      {/* ── TYPES DE BILLETS ── */}
      {tab === "tickets" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-display">Types de billets</h2>
            <Button variant="accent" onClick={() => setIsAddTicketOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter un type
            </Button>
          </div>

          {!ticketTypes?.length ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun type de billet défini.</p>
              <Button variant="accent" className="mt-4" onClick={() => setIsAddTicketOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Créer un type de billet
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticketTypes.map((tt) => {
                const sold = tt.soldCount;
                const avail = tt.quantity - sold;
                const pct = tt.quantity > 0 ? Math.round((sold / tt.quantity) * 100) : 0;
                return (
                  <Card key={tt.id} className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold font-display">{tt.name}</p>
                        {tt.description && <p className="text-xs text-muted-foreground mt-0.5">{tt.description}</p>}
                      </div>
                      <Badge className="bg-accent/10 text-accent border-accent/20">
                        {parseFloat(String(tt.price)).toLocaleString("fr-FR")} Ar
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{sold} vendus</span>
                        <span>{avail} disponibles</span>
                      </div>
                      <div className="w-full bg-input rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 90 ? "hsl(0 70% 50%)" : pct >= 60 ? "hsl(38 95% 50%)" : "hsl(145 60% 35%)",
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <Dialog isOpen={isAddTicketOpen} onClose={() => setIsAddTicketOpen(false)} title="Nouveau type de billet">
            <form onSubmit={handleAddTicketType} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du billet</Label>
                <Input name="name" required placeholder="Ex: VIP, Standard, Early Bird..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix (Ar)</Label>
                  <Input name="price" type="number" min="0" step="100" required placeholder="Ex: 50000" />
                </div>
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input name="quantity" type="number" min="1" required placeholder="Ex: 200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea name="description" placeholder="Avantages inclus..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddTicketOpen(false)}>Annuler</Button>
                <Button type="submit" variant="accent" isLoading={createTicketType.isPending}>Créer</Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}

      {/* ── COMMANDES ── */}
      {tab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-11"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">{filteredOrders.length} commande(s)</p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune commande pour le moment.</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Billets</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-muted-foreground text-xs">#{order.id}</TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{order.customerPhone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.quantity} billet(s)</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-accent font-display text-sm">
                        {parseFloat(String(order.totalAmount)).toLocaleString("fr-FR")} Ar
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={order.paymentStatus} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </OrganizerLayout>
  );
}
