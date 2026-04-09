import React, { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import { AdminLayout } from "@/components/layout";
import { Card, Button, Input, Badge, Dialog, Select, Textarea } from "@/components/ui";
import { getCategoryEmoji, getCategoryImage } from "@/components/EventCard";
import { useListEvents } from "@/data/static";

export default function AdminEvents() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: events, isLoading } = useListEvents({
    category: category || undefined,
    search: search || undefined,
    status: status || undefined,
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreateOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Événements</h1>
          <p className="text-muted-foreground">Gérez vos événements et billetteries.</p>
        </div>
        <Button variant="accent" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Nouvel événement
        </Button>
      </div>

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
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-44">
          <option value="">Tous les statuts</option>
          <option value="upcoming">À venir</option>
          <option value="ongoing">En cours</option>
          <option value="past">Passé</option>
        </Select>
      </div>

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
              ? Math.min(...event.ticketTypes.map((t) => t.price))
              : null;

            return (
              <div key={event.id} className="group relative">
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
                  <div className="relative h-48 w-full overflow-hidden shrink-0">
                    <img
                      src={imageSrc}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/hero-bg.png`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white text-xs">
                        {getCategoryEmoji(event.category)} {event.category}
                      </Badge>
                    </div>
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

                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div>
                      <h3 className="font-bold font-display text-lg leading-tight line-clamp-2 mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">📍 {event.location}, {event.city}</p>
                      <p className="text-sm text-muted-foreground">
                        🗓 {format(new Date(event.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>

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

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Créer un événement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Titre de l'événement</label>
            <Input name="title" required placeholder="Ex: Festival des Couleurs" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Catégorie</label>
              <Select name="category" required>
                <option value="Concert">Concert</option>
                <option value="Festival">Festival</option>
                <option value="Sport">Sport</option>
                <option value="Conférence">Conférence</option>
                <option value="Soirée">Soirée</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Capacité Totale</label>
              <Input name="totalCapacity" type="number" required min="1" placeholder="Ex: 5000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Ville</label>
              <Input name="city" required placeholder="Ex: Antananarivo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Lieu exact</label>
              <Input name="location" required placeholder="Ex: Palais des Sports" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Date de début</label>
              <Input name="startDate" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Date de fin</label>
              <Input name="endDate" type="datetime-local" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">URL de l'image (optionnel)</label>
            <Input name="imageUrl" type="url" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <Textarea name="description" required placeholder="Description détaillée de l'événement..." />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
            <Button type="submit" variant="accent">Créer l'événement</Button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
