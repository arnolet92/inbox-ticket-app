import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CreditCard, Smartphone, CheckCircle2, ChevronLeft, User } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button, Input, Label, Card } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { PaymentProcessing } from "@/components/PaymentProcessing";
import { useGetEvent, useCreateOrder, useCreatePayment, type CreateOrderInputPaymentMethod } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

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

  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();

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
      
      const order = await createOrder.mutateAsync({
        data: {
          customerName: fd.get("name") as string,
          customerEmail: fd.get("email") as string,
          customerPhone: fd.get("phone") as string,
          ticketTypeId,
          quantity,
          paymentMethod
        }
      });

      const paymentData: any = {
        orderId: order.id,
        method: paymentMethod,
      };

      if (paymentMethod === "orange_money" || paymentMethod === "mvola") {
        paymentData.phoneNumber = fd.get("paymentPhone") as string;
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
              {/* User Info */}
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold font-display mb-2 flex items-center gap-2">
                  <span className="bg-primary/20 text-accent w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
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
                    <Label htmlFor="email">Adresse email</Label>
                    <Input id="email" name="email" type="email" required placeholder="jean@exemple.com" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input id="phone" name="phone" required placeholder="034 00 000 00" defaultValue={user?.phone || ""} />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <span className="bg-primary/20 text-accent w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Moyen de paiement
                </h2>
                
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {/* Orange Money */}
                  <div 
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'orange_money' ? 'border-[#ff6600] bg-[#ff6600]/10' : 'border-border/50 hover:border-[#ff6600]/50'}`}
                    onClick={() => setPaymentMethod('orange_money')}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#ff6600] mb-3 flex items-center justify-center text-white font-bold text-xl">OM</div>
                    <div className="font-semibold">Orange Money</div>
                    <div className="text-xs text-muted-foreground mt-1">Paiement mobile</div>
                  </div>

                  {/* MVola */}
                  <div 
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'mvola' ? 'border-[#e02020] bg-[#e02020]/10' : 'border-border/50 hover:border-[#e02020]/50'}`}
                    onClick={() => setPaymentMethod('mvola')}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-900 mb-3 flex items-center justify-center text-white font-bold text-lg">M</div>
                    <div className="font-semibold">MVola</div>
                    <div className="text-xs text-muted-foreground mt-1">Telma Mobile</div>
                  </div>

                  {/* Mastercard */}
                  <div 
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'mastercard' ? 'border-blue-500 bg-blue-500/10' : 'border-border/50 hover:border-blue-500/50'}`}
                    onClick={() => setPaymentMethod('mastercard')}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-800 mb-3 flex items-center justify-center text-white">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="font-semibold">Carte Bancaire</div>
                    <div className="text-xs text-muted-foreground mt-1">Visa / Mastercard</div>
                  </div>
                </div>

                {/* Payment Details Form */}
                <div className="bg-background rounded-xl p-6 border border-border/50">
                  {(paymentMethod === 'orange_money' || paymentMethod === 'mvola') && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-muted-foreground mb-4">
                        <Smartphone className="w-5 h-5" />
                        <span>Entrez le numéro {paymentMethod === 'orange_money' ? 'Orange' : 'Telma MVola'} pour valider.</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Numéro de téléphone payeur</Label>
                        <Input name="paymentPhone" required placeholder={paymentMethod === 'orange_money' ? "032 XX XXX XX" : "034 XX XXX XX"} />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'mastercard' && (
                    <div className="space-y-4">
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

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-28 border-accent/20">
                <h3 className="text-xl font-bold font-display mb-6 border-b border-border/50 pb-4">Résumé de la commande</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Événement</div>
                    <div className="font-semibold text-foreground line-clamp-1">{event.title}</div>
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
                    <span className="font-semibold">x {quantity}</span>
                  </div>
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
