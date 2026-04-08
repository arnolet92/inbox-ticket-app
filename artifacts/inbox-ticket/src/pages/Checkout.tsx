import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CreditCard, CheckCircle2, ChevronLeft, User, Smartphone, Info } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button, Input, Label, Card } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { PaymentProcessing } from "@/components/PaymentProcessing";
import { useGetEvent, useCreateOrder, useCreatePayment, type CreateOrderInputPaymentMethod } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

const BASE = import.meta.env.BASE_URL;

const PAYMENT_OPTIONS = [
  {
    id: "orange_money" as CreateOrderInputPaymentMethod,
    label: "Orange Money",
    sublabel: "Paiement mobile",
    logo: `${BASE}images/om_logo.png`,
    logoFallback: "OM",
    accent: "#ff6600",
    needsPhone: false,
  },
  {
    id: "mvola" as CreateOrderInputPaymentMethod,
    label: "MVola",
    sublabel: "Telma Mobile",
    logo: `${BASE}images/mvola_logo.jpg`,
    logoFallback: "M",
    accent: "#16a34a",
    needsPhone: true,
  },
  {
    id: "mastercard" as CreateOrderInputPaymentMethod,
    label: "Carte Bancaire",
    sublabel: "Visa / Mastercard",
    logo: `${BASE}images/visa_mastercard_logo.jpg`,
    logoFallback: "CB",
    accent: "#2563eb",
    needsPhone: false,
  },
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { user } = useAuth();

  const eventId = Number(searchParams.get("eventId"));
  const ticketTypeId = Number(searchParams.get("ticketTypeId"));
  const quantity = Number(searchParams.get("qty")) || 1;

  const { data: event, isLoading } = useGetEvent(eventId);

  const [paymentMethod, setPaymentMethod] = useState<CreateOrderInputPaymentMethod>("orange_money");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();

  const selectedOption = PAYMENT_OPTIONS.find(o => o.id === paymentMethod)!;

  if (isLoading) return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    </PublicLayout>
  );
  if (!event) return <PublicLayout><div className="text-center py-32">Événement invalide</div></PublicLayout>;

  const ticketType = event.ticketTypes?.find(t => t.id === ticketTypeId);
  if (!ticketType) return <PublicLayout><div className="text-center py-32">Billet invalide</div></PublicLayout>;

  const total = ticketType.price * quantity;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const fd = new FormData(e.currentTarget);
      const customerPhone = fd.get("phone") as string;

      const order = await createOrder.mutateAsync({
        data: {
          customerName: fd.get("name") as string,
          customerEmail: `${customerPhone.replace(/\s/g, "")}@inbox-ticket.mg`,
          customerPhone,
          ticketTypeId,
          quantity,
          paymentMethod,
        }
      });

      const paymentData: any = {
        orderId: order.id,
        method: paymentMethod,
      };

      if (paymentMethod === "mvola") {
        paymentData.phoneNumber = fd.get("paymentPhone") as string;
      } else if (paymentMethod === "orange_money") {
        paymentData.phoneNumber = customerPhone;
      } else {
        paymentData.cardNumber = fd.get("cardNumber") as string;
        paymentData.cardExpiry = fd.get("cardExpiry") as string;
        paymentData.cardCvv = fd.get("cardCvv") as string;
      }

      await createPayment.mutateAsync({ data: paymentData });
      await new Promise((res) => setTimeout(res, 3200));
      setLocation(`/orders/${order.id}`);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert("Une erreur est survenue lors du paiement.");
    }
  };

  return (
    <>
      {isProcessing && <PaymentProcessing paymentMethod={paymentMethod} />}
      <PublicLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-muted-foreground hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Retour à l'événement
          </button>

          <h1 className="text-3xl md:text-4xl font-bold font-display mb-10">Paiement sécurisé</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">

            <div className="lg:col-span-2 space-y-8">

              {/* ── 1. Coordonnées ── */}
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold font-display mb-2 flex items-center gap-2">
                  <span className="bg-primary/20 text-accent w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Vos coordonnées
                </h2>

                {user && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-5">
                    <User className="w-4 h-4 shrink-0" />
                    Connecté en tant que <span className="font-semibold">{user.name}</span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" name="name" required placeholder="Jean Dupont" defaultValue={user?.name || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input id="phone" name="phone" required placeholder="034 00 000 00" defaultValue={user?.phone || ""} />
                  </div>
                </div>
              </Card>

              {/* ── 2. Moyen de paiement ── */}
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <span className="bg-primary/20 text-accent w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Moyen de paiement
                </h2>

                {/* Payment selector cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const isSelected = paymentMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`border-2 rounded-xl p-4 text-left transition-all focus:outline-none ${
                          isSelected
                            ? "shadow-lg scale-[1.02]"
                            : "border-border/50 hover:border-opacity-60 hover:scale-[1.01]"
                        }`}
                        style={isSelected ? { borderColor: opt.accent, backgroundColor: `${opt.accent}15` } : {}}
                      >
                        {/* Logo */}
                        <div
                          className="w-14 h-14 rounded-xl mb-3 overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: logoErrors[opt.id] ? opt.accent : "transparent" }}
                        >
                          {logoErrors[opt.id] ? (
                            <span className="text-white font-bold text-lg">{opt.logoFallback}</span>
                          ) : (
                            <img
                              src={opt.logo}
                              alt={opt.label}
                              className="w-full h-full object-contain"
                              onError={() => setLogoErrors(prev => ({ ...prev, [opt.id]: true }))}
                            />
                          )}
                        </div>
                        <div className="font-semibold text-sm">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{opt.sublabel}</div>
                        {isSelected && (
                          <div className="mt-2 w-2 h-2 rounded-full" style={{ backgroundColor: opt.accent }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Payment detail zone */}
                <div className="bg-background/60 rounded-xl p-6 border border-border/40">

                  {/* Orange Money — confirmation automatique, pas de saisie */}
                  {paymentMethod === "orange_money" && (
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-10 h-10 rounded-full bg-[#ff6600]/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-5 h-5 text-[#ff6600]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Confirmation par push Orange</p>
                        <p className="text-muted-foreground leading-relaxed">
                          Après validation, vous recevrez une notification push sur votre téléphone Orange pour confirmer le paiement.
                          Aucun numéro supplémentaire n'est requis.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MVola — saisie du numéro Telma */}
                  {paymentMethod === "mvola" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <Smartphone className="w-5 h-5 text-[#e02020]" />
                        <span className="text-sm">Entrez votre numéro Telma MVola pour valider.</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Numéro MVola (Telma)</Label>
                        <Input
                          name="paymentPhone"
                          required
                          placeholder="034 XX XXX XX"
                          defaultValue={user?.phone || ""}
                        />
                      </div>
                    </div>
                  )}

                  {/* Carte bancaire */}
                  {paymentMethod === "mastercard" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                        <span className="text-sm">Saisissez les informations de votre carte Visa ou Mastercard.</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Numéro de carte</Label>
                        <Input name="cardNumber" required placeholder="0000 0000 0000 0000" maxLength={19} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date d'expiration</Label>
                          <Input name="cardExpiry" required placeholder="MM/AA" maxLength={5} />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input name="cardCvv" type="password" required placeholder="123" maxLength={3} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* ── Sidebar résumé ── */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-28 border-accent/20">
                <h3 className="text-xl font-bold font-display mb-6 border-b border-border/50 pb-4">Résumé de la commande</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Événement</div>
                    <div className="font-semibold text-foreground line-clamp-2">{event.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Type de billet</div>
                    <div className="font-semibold text-foreground">{ticketType.name}</div>
                  </div>
                  <div className="flex justify-between items-center bg-input/30 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">Prix unitaire</span>
                    <span className="font-semibold">{formatMGA(ticketType.price)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-input/30 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">Quantité</span>
                    <span className="font-semibold">× {quantity}</span>
                  </div>
                </div>

                {/* Selected payment badge */}
                <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground border border-border/40 rounded-lg px-3 py-2">
                  <div className="w-6 h-6 rounded overflow-hidden shrink-0 bg-border/30">
                    {!logoErrors[selectedOption.id] && (
                      <img
                        src={selectedOption.logo}
                        alt={selectedOption.label}
                        className="w-full h-full object-contain"
                        onError={() => setLogoErrors(prev => ({ ...prev, [selectedOption.id]: true }))}
                      />
                    )}
                  </div>
                  <span>{selectedOption.label}</span>
                </div>

                <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-end">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-3xl font-display font-bold text-accent">{formatMGA(total)}</span>
                </div>

                <Button type="submit" variant="accent" size="lg" className="w-full" isLoading={isProcessing}>
                  {!isProcessing && <CheckCircle2 className="w-5 h-5 mr-2" />}
                  Payer {formatMGA(total)}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Paiement 100% sécurisé
                </p>
              </Card>
            </div>
          </form>
        </div>
      </PublicLayout>
    </>
  );
}
