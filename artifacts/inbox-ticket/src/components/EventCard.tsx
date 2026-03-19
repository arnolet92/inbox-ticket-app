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

export function EventCard({ event }: { event: Event }) {
  const isUpcoming = event.status === "upcoming";

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group cursor-pointer h-full flex flex-col border-transparent hover:border-accent/50 hover:shadow-accent/10 hover:-translate-y-1">
        <div className="relative h-56 w-full overflow-hidden">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-4xl opacity-50">{getCategoryEmoji(event.category)}</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/60 backdrop-blur-md border-border/50 text-white shadow-lg">
              {getCategoryEmoji(event.category)} {event.category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
             <Badge variant={isUpcoming ? "success" : "default"} className="backdrop-blur-md shadow-lg">
                {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
             </Badge>
          </div>
          {/* Subtle gradient overlay at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold font-display text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-3">
            {event.title}
          </h3>
          
          <div className="mt-auto space-y-2">
            <div className="flex items-center text-muted-foreground text-sm font-medium">
              <CalendarIcon className="w-4 h-4 mr-2 text-accent" />
              {format(new Date(event.startDate), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </div>
            <div className="flex items-center text-muted-foreground text-sm font-medium">
              <MapPin className="w-4 h-4 mr-2 text-accent" />
              {event.location}, {event.city}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
