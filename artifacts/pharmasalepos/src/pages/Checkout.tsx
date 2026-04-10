import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CreditCard, ChevronLeft, User, Smartphone, Info } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button, Input, Label, Card } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { PaymentProcessing } from "@/components/PaymentProcessing";
import { useGetEvent, useCreateOrderSimulated } from "@/data/static";
import { useAuth } from "@/context/AuthContext";
import { omLogo, mvolaLogo, visaMastercardLogo } from "@/assets/images";

const PAYMENT_OPTIONS = [
  { id: "orange_money", label: "Orange Money", sublabel: "Paiement mobile", logo: omLogo, logoFallback: "OM", accent: "#ff6600", needsPhone: false },
  { id: "mvola", label: "MVola", sublabel: "Telma Mobile", logo: mvolaLogo, logoFallback: "M", accent: "#16a34a", needsPhone: true },
  { id: "mastercard", label: "Carte Bancaire", sublabel: "Visa / Mastercard", logo: visaMastercardLogo, logoFallback: "CB", accent: "#2563eb", needsPhone: false },
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { user } = useAuth();

  const eventId = Number(searchParams.get("eventId"));
  const ticketTypeId = Number(searchParams.get("ticketTypeId"));
  const quantity = Number(searchParams.get("qty")) || 1;

  const { data: event } = useGetEvent(eventId);
  const createOrder = useCreateOrderSimulated();

  const [paymentMethod, setPaymentMethod] = useState("orange_money");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const selectedOption = PAYMENT_OPTIONS.find(o => o.id === paymentMethod)!;

  if (!event) return <PublicLayout><div className="text-center py-32">Événement invalide</div></PublicLayout>;

  const ticketType = event.ticketTypes?.find(t => t.id === ticketTypeId);
  if (!ticketType) return <PublicLayout><div className="text-center py-32">Billet invalide</div></PublicLayout>;

  const total = ticketType.price * quantity;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const order = await createOrder({
        eventId,
        ticketTypeId,
        quantity,
        paymentMethod,
        customerPhone: user?.phone ?? "",
        customerName: user?.name ?? "",
        customerAddress: user?.address ?? "",
      });
      setLocation(`/orders/${order.id}`);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <PublicLayout>
      {isProcessing && <PaymentProcessing paymentMethod={paymentMethod} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>

        <h1 className="text-3xl font-bold font-display mb-8">Finaliser la réservation</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Info */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="text-accent w-5 h-5" /> Vos informations</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Nom complet</Label>
                    <Input value={user?.name ?? ""} readOnly className="mt-1.5 opacity-70" />
                  </div>
                  <div>
                    <Label>Numéro de téléphone</Label>
                    <Input value={user?.phone ?? ""} readOnly className="mt-1.5 opacity-70" />
                  </div>
                  <div>
                    <Label>Adresse</Label>
                    <Input value={user?.address ?? ""} readOnly className="mt-1.5 opacity-70" />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="text-accent w-5 h-5" /> Mode de paiement</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PAYMENT_OPTIONS.map(opt => {
                    const isSelected = paymentMethod === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: opt.accent + "20", border: `1.5px solid ${opt.accent}44` }}>
                          {!logoErrors[opt.id] ? (
                            <img src={opt.logo} alt={opt.label} className="w-10 h-10 object-contain"
                              onError={() => setLogoErrors(prev => ({ ...prev, [opt.id]: true }))} />
                          ) : (
                            <span className="font-bold text-sm" style={{ color: opt.accent }}>{opt.logoFallback}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.sublabel}</div>
                        </div>
                        {isSelected && (
                          <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedOption.needsPhone && (
                  <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Smartphone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Un SMS de confirmation vous sera envoyé sur votre numéro MVola pour valider le paiement.</span>
                    </div>
                  </div>
                )}
              </Card>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300">Votre billet électronique vous sera envoyé immédiatement après la confirmation du paiement.</p>
              </div>

              <Button type="submit" variant="accent" size="lg" className="w-full text-lg font-bold" disabled={isProcessing}>
                {isProcessing ? "Traitement en cours..." : `Payer ${formatMGA(total)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-28">
              <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.location}, {event.city}</p>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billet</span>
                    <span className="font-semibold">{ticketType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantité</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix unitaire</span>
                    <span className="font-semibold">{formatMGA(ticketType.price)}</span>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-2xl text-accent">{formatMGA(total)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
