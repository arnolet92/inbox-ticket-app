import React, { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import { AdminLayout } from "@/components/layout";
import { Card, Button, Input, Badge, Select, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import { getCategoryEmoji, getCategoryImage } from "@/components/EventCard";
import { useListEvents } from "@/data/static";

export default function AdminEvents() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const { data: events } = useListEvents({
    category: category || undefined,
    search: search || undefined,
    status: status || undefined,
  });

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold font-display">Événements</h1>
          <p className="text-muted-foreground">{events?.length ?? 0} événement(s) au total</p>
        </div>
      </div>

      <Card className="p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onChange={e => setCategory(e.target.value)} className="sm:w-48">
          <option value="">Toutes catégories</option>
          <option value="Concert">Concert</option>
          <option value="Festival">Festival</option>
          <option value="Sport">Sport</option>
          <option value="Conférence">Conférence</option>
          <option value="Soirée">Soirée</option>
        </Select>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="sm:w-40">
          <option value="">Tous statuts</option>
          <option value="upcoming">À venir</option>
          <option value="ongoing">En cours</option>
          <option value="past">Passé</option>
        </Select>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Événement</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Billets</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events?.map(event => {
              const pct = Math.min(100, Math.round((event.soldTickets / event.totalCapacity) * 100));
              return (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={event.imageUrl || getCategoryImage(event.category)} alt="" className="w-10 h-10 rounded-xl object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/hero-bg.png`; }} />
                      <div>
                        <div className="font-semibold text-sm line-clamp-1">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.city}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryEmoji(event.category)} {event.category}</TableCell>
                  <TableCell className="text-sm">{event.location}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{format(new Date(event.startDate), "d MMM yyyy", { locale: fr })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.status === "upcoming" ? "success" : event.status === "ongoing" ? "warning" : "default"}>
                      {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/events/${event.id}`}>
                      <Button variant="ghost" size="sm">Voir</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
