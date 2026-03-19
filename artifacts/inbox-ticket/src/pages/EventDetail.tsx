import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Users, Info, ChevronRight, Ticket as TicketIcon } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button, Card, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getCategoryEmoji } from "@/components/EventCard";
import { useGetEvent } from "@workspace/api-client-react";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: event, isLoading } = useGetEvent(Number(id));

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="text-center py-32">Événement introuvable</div>
      </PublicLayout>
    );
  }

  const selectedTicket = event.ticketTypes?.find(t => t.id === selectedTicketId);
  const total = (selectedTicket?.price || 0) * quantity;

  const handleCheckout = () => {
    if (!selectedTicketId) return;
    setLocation(`/checkout?eventId=${event.id}&ticketTypeId=${selectedTicketId}&qty=${quantity}`);
  };

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
             <span className="text-8xl opacity-30">{getCategoryEmoji(event.category)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className="bg-accent/20 text-accent border border-accent/30 text-sm px-3 py-1">
                {getCategoryEmoji(event.category)} {event.category}
              </Badge>
              <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-white/20">
                {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-6">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-accent flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Date début</div>
                <div className="font-semibold text-sm">{format(new Date(event.startDate), "dd MMM yyyy", { locale: fr })}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(event.startDate), "HH:mm")}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-accent flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Date fin</div>
                <div className="font-semibold text-sm">{format(new Date(event.endDate), "dd MMM yyyy", { locale: fr })}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(event.endDate), "HH:mm")}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-accent flex items-center justify-center mb-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Lieu</div>
                <div className="font-semibold text-sm line-clamp-1">{event.location}</div>
                <div className="text-xs text-muted-foreground">{event.city}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-accent flex items-center justify-center mb-3">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Capacité</div>
                <div className="font-semibold text-sm">{event.totalCapacity} places</div>
                <div className="text-xs text-accent">{event.totalCapacity - event.soldTickets} restantes</div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold font-display flex items-center gap-2 mb-4">
                <Info className="text-accent" /> À propos de l'événement
              </h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                {event.description}
              </div>
            </div>
          </div>

          {/* Sidebar / Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <h3 className="text-2xl font-bold font-display flex items-center gap-2">
                <TicketIcon className="text-accent" /> Billets disponibles
              </h3>
              
              {!event.ticketTypes?.length ? (
                <Card className="p-6 text-center text-muted-foreground border-dashed">
                  Aucun billet configuré pour le moment.
                </Card>
              ) : (
                <div className="space-y-4">
                  {event.ticketTypes.map(ticket => {
                    const isSelected = selectedTicketId === ticket.id;
                    const isSoldOut = ticket.soldCount >= ticket.quantity;
                    
                    return (
                      <Card 
                        key={ticket.id} 
                        className={`p-5 transition-all duration-200 ${
                          isSoldOut ? 'opacity-50 grayscale' : 'cursor-pointer hover:border-accent/50 hover:shadow-lg'
                        } ${isSelected ? 'ring-2 ring-accent border-accent bg-accent/5' : ''}`}
                        onClick={() => !isSoldOut && setSelectedTicketId(ticket.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{ticket.name}</h4>
                          <span className="font-display font-bold text-accent whitespace-nowrap">
                            {formatMGA(ticket.price)}
                          </span>
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-muted-foreground mb-4">{ticket.description}</p>
                        )}
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className={isSoldOut ? "text-destructive" : "text-emerald-500"}>
                            {isSoldOut ? "Épuisé" : `${ticket.quantity - ticket.soldCount} disponibles`}
                          </span>
                          {isSelected && (
                            <Badge className="bg-accent text-white">Sélectionné</Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {selectedTicketId && (
                <Card className="p-6 bg-card border-accent/30 mt-6 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-semibold text-muted-foreground">Quantité</span>
                    <div className="flex items-center gap-4 bg-input rounded-xl p-1">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-card text-foreground flex items-center justify-center hover:bg-muted font-bold"
                      >-</button>
                      <span className="w-4 text-center font-bold">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-card text-foreground flex items-center justify-center hover:bg-muted font-bold"
                      >+</button>
                    </div>
                  </div>
                  
                  <div className="h-px bg-border/50 w-full my-4" />
                  
                  <div className="flex justify-between items-end mb-6">
                    <span className="font-semibold text-lg">Total à payer</span>
                    <span className="font-display text-3xl font-bold text-white">{formatMGA(total)}</span>
                  </div>
                  
                  <Button 
                    variant="accent" 
                    size="lg" 
                    className="w-full text-lg group"
                    onClick={handleCheckout}
                  >
                    Réserver maintenant
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
