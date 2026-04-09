import React from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Calendar, MapPin, Users, Ticket } from "lucide-react";
import { OrganizerLayout } from "@/components/layout";
import { Card, Badge, Button } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getCategoryEmoji, getCategoryImage } from "@/components/EventCard";
import { useGetEvent, STATIC_ORDERS } from "@/data/static";

export default function OrganizerEventDetail() {
  const { id } = useParams();
  const { data: event } = useGetEvent(Number(id));

  if (!event) return <OrganizerLayout><div className="text-center py-32 text-muted-foreground">Événement introuvable.</div></OrganizerLayout>;

  const orders = STATIC_ORDERS.filter(o => o.event.id === event.id && o.status === "confirmed");
  const revenue = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <OrganizerLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/organizer/events"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" /> Retour</Button></Link>
        <h1 className="text-2xl font-bold font-display truncate">{event.title}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <img src={event.imageUrl || getCategoryImage(event.category)} alt={event.title} className="w-full h-44 object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/hero-bg.png`; }} />
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{getCategoryEmoji(event.category)} {event.category}</Badge>
                <Badge variant={event.status === "upcoming" ? "success" : "default"}>
                  {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{event.description}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { icon: <Calendar className="w-4 h-4" />, label: "Début", value: format(new Date(event.startDate), "d MMMM yyyy à HH:mm", { locale: fr }) },
                  { icon: <MapPin className="w-4 h-4" />, label: "Lieu", value: `${event.location}, ${event.city}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="text-accent mt-0.5">{item.icon}</div>
                    <div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="text-sm font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Ticket className="text-accent w-5 h-5" /> Types de billets</h2>
            <div className="space-y-3">
              {event.ticketTypes.map(t => {
                const pct = Math.min(100, Math.round((t.soldCount / t.quantity) * 100));
                return (
                  <div key={t.id} className="p-4 rounded-xl border border-border/40 bg-muted/20">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{t.name}</span>
                      <span className="font-bold text-accent">{formatMGA(t.price)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{t.soldCount}/{t.quantity} vendus</span><span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {[
            { label: "Billets vendus", value: event.soldTickets, sub: `sur ${event.totalCapacity}` },
            { label: "Revenus", value: formatMGA(revenue), sub: "confirmés" },
            { label: "Commandes", value: orders.length, sub: "confirmées" },
          ].map((kpi, i) => (
            <Card key={i} className="p-5">
              <div className="text-sm text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-3xl font-bold font-display text-accent">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
            </Card>
          ))}
        </div>
      </div>
    </OrganizerLayout>
  );
}
