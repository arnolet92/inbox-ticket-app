import React, { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout";
import { Card, Button, Input, Badge, Dialog, Select, Textarea, Label } from "@/components/ui";
import { getCategoryEmoji, getCategoryImage } from "@/components/EventCard";
import { useListEvents, useCreateEvent, useDeleteEvent, getListEventsQueryKey, type ListEventsStatus } from "@workspace/api-client-react";

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<ListEventsStatus | "">("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: events, isLoading } = useListEvents({
    category: category || undefined,
    search: search || undefined,
    status: (status as ListEventsStatus) || undefined,
  });

  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createEvent.mutateAsync({
        data: {
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          category: fd.get("category") as string,
          location: fd.get("location") as string,
          city: fd.get("city") as string,
          startDate: new Date(fd.get("startDate") as string).toISOString(),
          endDate: new Date(fd.get("endDate") as string).toISOString(),
          totalCapacity: Number(fd.get("totalCapacity")),
          imageUrl: (fd.get("imageUrl") as string) || null,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
      await deleteEvent.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Événements</h1>
          <p className="text-muted-foreground">Gérez vos événements et billetteries.</p>
        </div>
        <Button variant="accent" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Nouvel événement
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un événement..."
            className="pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="md:w-56">
          <option value="">Toutes catégories</option>
          <option value="Concert">🎵 Concert</option>
          <option value="Festival">🎪 Festival</option>
          <option value="Sport">⚽ Sport</option>
          <option value="Conférence">🎯 Conférence</option>
          <option value="Soirée">🌙 Soirée</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="md:w-44">
          <option value="">Tous les statuts</option>
          <option value="upcoming">À venir</option>
          <option value="ongoing">En cours</option>
          <option value="past">Passé</option>
        </Select>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border">
          <div className="text-6xl mb-4">🏜️</div>
          <h3 className="text-2xl font-bold font-display mb-2">Aucun événement</h3>
          <p className="text-muted-foreground mb-6">Créez votre premier événement pour commencer.</p>
          <Button variant="accent" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Créer un événement
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => {
            const imageSrc = event.imageUrl || getCategoryImage(event.category);
            const fillPct = event.totalCapacity > 0 ? Math.round((event.soldTickets / event.totalCapacity) * 100) : 0;
            const lowestPrice = event.ticketTypes?.length
              ? Math.min(...event.ticketTypes.map((t) => parseFloat(String(t.price))))
              : null;

            return (
              <div key={event.id} className="group relative">
                {/* Admin action buttons — appear on hover */}
                <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur border border-white/10 hover:bg-blue-500/80 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur border border-white/10 hover:bg-red-500/80 transition-colors"
                    title="Supprimer"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>

                <Card className="h-full flex flex-col border-transparent hover:border-accent/40 hover:shadow-accent/10 hover:-translate-y-1 overflow-hidden transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden shrink-0">
                    <img
                      src={imageSrc}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/hero-bg.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white text-xs">
                        {getCategoryEmoji(event.category)} {event.category}
                      </Badge>
                    </div>

                    {/* Status badge */}
                    <div className="absolute bottom-3 left-3">
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
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div>
                      <h3 className="font-bold font-display text-lg leading-tight line-clamp-2 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        📍 {event.location}, {event.city}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🗓 {format(new Date(event.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>

                    {/* Sales progress */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{event.soldTickets} billets vendus</span>
                        <span className="font-bold text-accent">{fillPct}%</span>
                      </div>
                      <div className="w-full bg-input rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${fillPct}%`,
                            background:
                              fillPct >= 90
                                ? "hsl(0 70% 50%)"
                                : fillPct >= 60
                                ? "hsl(38 95% 50%)"
                                : "hsl(145 60% 35%)",
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Capacité : {event.totalCapacity.toLocaleString("fr-FR")}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                      {lowestPrice !== null ? (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Dès </span>
                          <span className="font-bold text-accent font-display">
                            {lowestPrice.toLocaleString("fr-FR")} Ar
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Pas de billets</span>
                      )}
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Gérer →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Créer un événement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Titre de l'événement</Label>
            <Input name="title" required placeholder="Ex: Festival des Couleurs" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select name="category" required>
                <option value="Concert">Concert</option>
                <option value="Festival">Festival</option>
                <option value="Sport">Sport</option>
                <option value="Conférence">Conférence</option>
                <option value="Soirée">Soirée</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Capacité Totale</Label>
              <Input name="totalCapacity" type="number" required min="1" placeholder="Ex: 5000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input name="city" required placeholder="Ex: Antananarivo" />
            </div>
            <div className="space-y-2">
              <Label>Lieu exact</Label>
              <Input name="location" required placeholder="Ex: Palais des Sports" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input name="startDate" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input name="endDate" type="datetime-local" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL de l'image (optionnel)</Label>
            <Input name="imageUrl" type="url" placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" required placeholder="Description détaillée de l'événement..." />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="accent" isLoading={createEvent.isPending}>
              Créer l'événement
            </Button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
