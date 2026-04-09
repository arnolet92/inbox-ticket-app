import React from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import { OrganizerLayout } from "@/components/layout";
import { Card, Badge, Button } from "@/components/ui";
import { getCategoryEmoji, getCategoryImage } from "@/components/EventCard";
import { STATIC_EVENTS } from "@/data/static";
import { useOrganizer } from "@/context/OrganizerContext";

export default function OrganizerEvents() {
  const { organizer } = useOrganizer();

  const myEvents = STATIC_EVENTS.filter(e => !organizer?.id || e.organizerId === organizer.id || organizer.id === "admin");

  return (
    <OrganizerLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Mes Événements</h1>
        <p className="text-muted-foreground">{myEvents.length} événement(s) associé(s) à votre compte</p>
      </div>

      {myEvents.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucun événement</h3>
          <p className="text-muted-foreground">Vous n'avez pas encore d'événements assignés.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {myEvents.map(event => {
            const pct = Math.min(100, Math.round((event.soldTickets / event.totalCapacity) * 100));
            return (
              <Card key={event.id} className="overflow-hidden flex flex-col">
                <div className="relative h-40">
                  <img src={event.imageUrl || getCategoryImage(event.category)} alt={event.title} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/hero-bg.png`; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant={event.status === "upcoming" ? "success" : "default"} className="text-xs">
                      {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-base line-clamp-2 mb-3">{event.title}</h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-accent" />{format(new Date(event.startDate), "d MMMM yyyy", { locale: fr })}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-accent" />{event.location}, {event.city}</div>
                    <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-accent" />{event.soldTickets}/{event.totalCapacity} billets</div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1 text-muted-foreground"><span>{pct}% vendus</span><span>{event.totalCapacity - event.soldTickets} restants</span></div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Link href={`/organizer/events/${event.id}`} className="mt-auto">
                    <Button variant="outline" size="sm" className="w-full">Voir les détails</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </OrganizerLayout>
  );
}
