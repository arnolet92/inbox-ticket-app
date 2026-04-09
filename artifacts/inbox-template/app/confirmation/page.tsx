"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Calendar, MapPin, Share2, Ticket, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PublicLayout } from "@/components/public-layout";
import { EVENTS } from "@/lib/mock-data";
import { getBilletCodes } from "@/lib/billet-codes";
import { formatMGA, formatDate } from "@/lib/utils";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = Number(params.get("orderId") ?? 100);
  const eventId = Number(params.get("eventId") ?? 1);
  const event = EVENTS.find((e) => e.id === eventId);
  const qrValue = `INBOXTICKET-ORD-${orderId}-+261340000001`;
  const { ticketKey, confirmCode, ticketNumber } = getBilletCodes(orderId);

  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        {/* Success */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "hsl(145 55% 40% / 0.15)", border: "2px solid hsl(145 55% 40% / 0.3)" }}>
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>
        <h1 className="font-display font-extrabold text-3xl mb-2">Paiement confirmé !</h1>
        <p className="text-muted-foreground mb-1">Commande #{String(orderId).padStart(6, "0")}</p>
        <p className="text-muted-foreground text-sm mb-8">Votre billet a été envoyé par email et SMS</p>

        {/* Ticket card */}
        <div className="rounded-2xl border border-accent/30 bg-card overflow-hidden mb-8"
          style={{ boxShadow: "0 0 40px hsl(145 55% 30% / 0.15)" }}>
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
          {event && (
            <div className="p-6">
              <h2 className="font-display font-bold text-xl mb-1">{event.title}</h2>
              <div className="flex items-center gap-3 justify-center mb-4 flex-wrap text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-accent" />{formatDate(event.startDate)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-accent" />{event.city}</span>
              </div>
            </div>
          )}
          {/* Dashed divider */}
          <div className="relative py-2">
            <div className="absolute inset-x-0 top-1/2 border-dashed border-t border-border" />
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-border" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-border" />
          </div>
          <div className="p-6 pt-4 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
              <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG value={qrValue} size={180} level="H" fgColor="#14532d" />
              </div>
            </div>
            <div className="flex gap-2 w-full">
              {[
                { label: "Clé", value: ticketKey },
                { label: "Conf.", value: confirmCode },
                { label: "N°", value: ticketNumber },
              ].map((c) => (
                <div key={c.label} className="flex-1 flex flex-col items-center rounded-xl py-2 px-1 bg-muted/50">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{c.label}</span>
                  <span className="font-mono font-bold text-xs tracking-widest mt-0.5">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border font-semibold text-sm hover:border-accent/40 transition-all">
            <Download className="w-4 h-4" /> Télécharger mon billet
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border font-semibold text-sm hover:border-accent/40 transition-all">
            <Share2 className="w-4 h-4" /> Partager
          </button>
          <Link href="/mes-billets"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90"
            style={{ background: "hsl(145 55% 40%)" }}>
            <Ticket className="w-4 h-4" /> Voir mes billets
          </Link>
          <Link href="/events"
            className="flex items-center justify-center gap-2 w-full py-3 text-sm text-muted-foreground hover:text-white transition-colors">
            Explorer d&apos;autres événements <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><CheckCircle className="w-8 h-8 text-accent animate-pulse" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
