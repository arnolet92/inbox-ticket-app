import React from "react";
import { Link } from "wouter";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, Badge } from "@/components/ui";
import type { Event } from "@workspace/api-client-react";

export function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    "Concert": "🎵",
    "Festival": "🎪",
    "Sport": "⚽",
    "Conférence": "🎯",
    "Soirée": "🌙"
  };
  return map[category] || "🎟️";
}

export function getCategoryImage(category: string) {
  const map: Record<string, string> = {
    "Concert": "/images/event-concert.png",
    "Festival": "/images/event-festival.png",
    "Sport": "/images/event-sport.png",
    "Conférence": "/images/event-conference.png",
    "Soirée": "/images/event-soiree.png",
  };
  return map[category] || "/images/hero-bg.png";
}

export function EventCard({ event }: { event: Event }) {
  const isUpcoming = event.status === "upcoming";
  const imageSrc = event.imageUrl || getCategoryImage(event.category);

  const lowestPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map(t => parseFloat(String(t.price))))
    : null;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group cursor-pointer h-full flex flex-col border-transparent hover:border-accent/50 hover:shadow-accent/10 hover:-translate-y-1 overflow-hidden">
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={imageSrc}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/hero-bg.png";
            }}
          />
          {/* African pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white shadow-lg text-xs">
              {getCategoryEmoji(event.category)} {event.category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              variant={isUpcoming ? "success" : "default"}
              className="backdrop-blur-md shadow-lg text-xs"
            >
              {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
            </Badge>
          </div>

          {/* Price tag at bottom of image */}
          {lowestPrice !== null && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                À partir de {new Intl.NumberFormat("fr-MG").format(lowestPrice)} Ar
              </div>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold font-display text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-3">
            {event.title}
          </h3>

          {/* Capacity bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{event.soldTickets} vendus</span>
              <span>{event.totalCapacity} places</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${Math.min(100, (event.soldTickets / event.totalCapacity) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-auto space-y-1.5">
            <div className="flex items-center text-muted-foreground text-sm">
              <CalendarIcon className="w-3.5 h-3.5 mr-2 text-accent shrink-0" />
              {format(new Date(event.startDate), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 mr-2 text-accent shrink-0" />
              {event.location}, {event.city}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
