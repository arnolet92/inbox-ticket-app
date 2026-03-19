import React from "react";
import { useParams, Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Download, Calendar, MapPin, Ticket } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useGetOrder } from "@workspace/api-client-react";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(Number(id));

  if (isLoading) return <PublicLayout><div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div></PublicLayout>;
  if (!order) return <PublicLayout><div className="text-center py-32">Commande introuvable</div></PublicLayout>;

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Paiement Réussi !</h1>
          <p className="text-xl text-muted-foreground">
            Merci {order.customerName}. Votre réservation a bien été enregistrée.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          
          {/* Main Ticket Info */}
          <Card className="md:col-span-3 p-0 overflow-hidden border-2 border-accent/20">
            <div className="bg-gradient-to-r from-primary to-primary/60 p-6 flex justify-between items-center border-b border-border/50">
              <div>
                <Badge variant="outline" className="text-white border-white/30 mb-2">
                  Commande #{order.id.toString().padStart(6, '0')}
                </Badge>
                <h2 className="text-2xl font-bold font-display text-white">{order.event?.title}</h2>
              </div>
            </div>
            
            <div className="p-8 space-y-6 bg-card">
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-accent mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground font-semibold">Date & Heure</div>
                  <div className="text-lg">
                    {order.event && format(new Date(order.event.startDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-accent mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground font-semibold">Lieu</div>
                  <div className="text-lg">{order.event?.location}, {order.event?.city}</div>
                </div>
              </div>

              <div className="h-px w-full border-t border-dashed border-border/80 my-2" />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground font-semibold mb-1">Titulaire</div>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-semibold mb-1">Détails Billet</div>
                  <div className="font-medium">{order.quantity}x {order.ticketType?.name}</div>
                  <div className="font-display font-bold text-accent">{formatMGA(order.totalAmount)}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* QR Code Section */}
          <Card className="md:col-span-2 p-8 flex flex-col items-center justify-center text-center h-full bg-gradient-to-b from-card to-background">
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG 
                value={`INBOXTICKET-ORD-${order.id}-${order.customerEmail}`}
                size={180}
                level="H"
                fgColor="#1a4a2e"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">Billet Électronique</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Présentez ce QR code à l'entrée de l'événement.
            </p>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" /> Télécharger (PDF)
            </Button>
          </Card>

        </div>

        <div className="mt-12 text-center">
          <Link href="/events">
            <Button variant="ghost">Voir d'autres événements</Button>
          </Link>
        </div>

      </div>
    </PublicLayout>
  );
}
