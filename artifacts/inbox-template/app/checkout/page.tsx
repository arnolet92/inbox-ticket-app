"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Smartphone, CreditCard, CheckCircle2, Ticket } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { EVENTS } from "@/lib/mock-data";
import { formatMGA } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "orange_money", label: "Orange Money", color: "#FF6600", desc: "Paiement mobile Orange" },
  { id: "mvola", label: "MVola", color: "#E30613", desc: "Paiement mobile Telma" },
  { id: "especes", label: "Espèces", color: "hsl(145 55% 40%)", desc: "Paiement en caisse" },
];

function CheckoutForm() {
  const params = useSearchParams();
  const router = useRouter();
  const eventId = Number(params.get("eventId"));
  const cartRaw = params.get("cart");
  const cart: Record<string, number> = cartRaw ? JSON.parse(decodeURIComponent(cartRaw)) : {};

  const event = EVENTS.find((e) => e.id === eventId);
  const [step, setStep] = useState<"info" | "payment" | "review">("info");
  const [method, setMethod] = useState("orange_money");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [mobileNum, setMobileNum] = useState("");
  const [loading, setLoading] = useState(false);

  if (!event) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-muted-foreground">Panier introuvable</p>
    </div>
  );

  const items = Object.entries(cart).map(([tid, qty]) => {
    const tt = event.ticketTypes.find((t) => t.id === Number(tid))!;
    return { tt, qty };
  });
  const total = items.reduce((s, { tt, qty }) => s + tt.price * qty, 0);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/confirmation?orderId=${Math.floor(Math.random() * 900) + 100}&eventId=${eventId}`);
    }, 1500);
  };

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href={`/events/${eventId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;événement
        </Link>

        <h1 className="font-display font-extrabold text-3xl mb-8">Finaliser la commande</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { key: "info", label: "Informations", icon: User },
            { key: "payment", label: "Paiement", icon: CreditCard },
            { key: "review", label: "Confirmation", icon: CheckCircle2 },
          ].map((s, i, arr) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === s.key ? "bg-accent text-black" :
                arr.findIndex(a => a.key === step) > i ? "bg-primary/60 text-foreground" :
                "border border-border text-muted-foreground"
              }`}>
                <s.icon className="w-3.5 h-3.5" />{s.label}
              </div>
              {i < arr.length - 1 && <div className="w-6 h-px bg-border hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === "info" && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" /> Vos informations
                </h2>
                {[
                  { key: "name", label: "Nom complet", placeholder: "Rakoto Jean", type: "text" },
                  { key: "email", label: "Adresse e-mail", placeholder: "email@exemple.mg", type: "email" },
                  { key: "phone", label: "Numéro de téléphone", placeholder: "+261 34 00 000 00", type: "tel" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent/60"
                    />
                  </div>
                ))}
                <button onClick={() => setStep("payment")}
                  disabled={!form.name || !form.email || !form.phone}
                  className="w-full py-3 rounded-xl text-black font-bold disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ background: "hsl(145 55% 40%)" }}>
                  Continuer vers le paiement
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" /> Mode de paiement
                </h2>
                <div className="grid gap-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.id} onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        method === m.id ? "border-accent/60 bg-accent/5" : "border-border hover:border-accent/30"
                      }`}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: method === m.id ? m.color : undefined }}>
                        {method === m.id && <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${m.color}20` }}>
                        <Smartphone className="w-4 h-4" style={{ color: m.color }} />
                      </div>
                    </button>
                  ))}
                </div>
                {(method === "orange_money" || method === "mvola") && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Numéro {method === "orange_money" ? "Orange" : "MVola"}
                    </label>
                    <input
                      type="tel"
                      placeholder="+261 34 00 000 00"
                      value={mobileNum}
                      onChange={(e) => setMobileNum(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent/60"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep("info")}
                    className="flex-1 py-3 rounded-xl border border-border font-semibold hover:border-accent/40 transition-all">
                    Retour
                  </button>
                  <button onClick={() => setStep("review")}
                    className="flex-1 py-3 rounded-xl text-black font-bold transition-all hover:opacity-90"
                    style={{ background: "hsl(145 55% 40%)" }}>
                    Vérifier la commande
                  </button>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" /> Récapitulatif
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <div className="p-3 rounded-xl bg-background border border-border text-sm">
                    <p className="font-semibold">{form.name}</p>
                    <p className="text-muted-foreground">{form.email} • {form.phone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Paiement</p>
                  <p className="font-semibold text-sm">
                    {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                    {mobileNum && ` — ${mobileNum}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("payment")}
                    className="flex-1 py-3 rounded-xl border border-border font-semibold hover:border-accent/40 transition-all">
                    Retour
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-3 rounded-xl text-black font-bold transition-all hover:opacity-90 disabled:opacity-70"
                    style={{ background: "hsl(145 55% 40%)" }}>
                    {loading ? "Traitement..." : "Confirmer la commande"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-border bg-card p-5 h-fit sticky top-28 space-y-4">
            <h3 className="font-display font-bold text-base border-b border-border pb-3">{event.title}</h3>
            <div className="space-y-3">
              {items.map(({ tt, qty }) => (
                <div key={tt.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{tt.name}</p>
                    <p className="text-xs text-muted-foreground">×{qty}</p>
                  </div>
                  <p className="font-semibold">{formatMGA(tt.price * qty)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-bold text-accent text-lg">{formatMGA(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Ticket className="w-8 h-8 text-accent animate-pulse" /></div>}>
      <CheckoutForm />
    </Suspense>
  );
}
