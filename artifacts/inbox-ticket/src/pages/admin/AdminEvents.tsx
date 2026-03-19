import React, { useState } from "react";
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Ticket } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout";
import { Card, Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Dialog, Select, Textarea, Label } from "@/components/ui";
import { useListEvents, useCreateEvent, useDeleteEvent, getListEventsQueryKey } from "@workspace/api-client-react";

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useListEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
        }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Événements</h1>
          <p className="text-muted-foreground">Gérez vos événements et billetteries.</p>
        </div>
        <Button variant="accent" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Nouvel événement
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Détails</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Ventes</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : events?.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-accent"><CalendarIcon className="w-5 h-5"/></div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-base line-clamp-1">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.category}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{event.city}</div>
                  <div className="text-xs text-muted-foreground">{event.location}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{format(new Date(event.startDate), "dd MMM yyyy", { locale: fr })}</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-accent">{event.soldTickets} / {event.totalCapacity}</div>
                  <div className="w-full bg-input rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-accent h-full" style={{ width: `${(event.soldTickets / event.totalCapacity) * 100}%` }} />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={event.status === "upcoming" ? "success" : "outline"}>
                    {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2" title="Gérer les tickets">
                      <Ticket className="w-4 h-4 text-emerald-500" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
            <Textarea name="description" required placeholder="Description détaillée..." />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
            <Button type="submit" variant="accent" isLoading={createEvent.isPending}>Créer l'événement</Button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
