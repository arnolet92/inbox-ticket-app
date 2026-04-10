import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "wouter";
import { Ticket, Calendar, MapPin, ShieldCheck } from "lucide-react";
import { getBilletCodes } from "@/lib/billetCodes";

export default function BilletPublic() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") ?? "";

  /* Parse info from code: INBOXTICKET-ORD-{id}-{phone} */
  const parts = code.split("-");
  const rawId = parseInt(parts[2] ?? "0") || 0;
  const orderId = rawId ? String(rawId).padStart(6, "0") : "—";
  const { ticketKey, confirmCode, ticketNumber } = getBilletCodes(rawId);

  if (!code) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 p-8">
        <Ticket className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">Lien de billet invalide ou expiré.</p>
        <Link href="/" className="text-accent underline text-sm">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "radial-gradient(ellipse at 50% 20%, hsl(145 48% 8% / 1) 0%, hsl(150 10% 3% / 1) 70%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <img
          src={`${import.meta.env.BASE_URL}images/logo-inbox-transparent.png`}
          alt="Inbox Ticket"
          className="h-7 w-auto"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span
          className="font-display font-black tracking-widest text-sm uppercase"
          style={{ color: "hsl(145 60% 40%)" }}
        >
          TICKET
        </span>
      </div>

      {/* Ticket card */}
      <div
        className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "hsl(150 15% 7%)",
          border: "1.5px solid hsl(145 60% 25% / 0.5)",
        }}
      >
        {/* Green top strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 to-emerald-400" />

        <div className="p-6 flex flex-col items-center">
          {/* Label */}
          <p
            className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "hsl(145 60% 45%)" }}
          >
            Billet électronique
          </p>
          <p className="text-xs text-muted-foreground mb-5 font-mono">
            Commande #{orderId}
          </p>

          {/* QR Code */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
            <div className="relative p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG value={code} size={200} level="H" fgColor="#14532d" />
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
            Présentez ce QR code à l'entrée de l'événement pour être admis.
          </p>

          {/* Three security codes */}
          <div className="flex gap-2 w-full mb-5">
            {[
              { label: "Clé de sécurité", value: ticketKey },
              { label: "Confirmation", value: confirmCode },
              { label: "N° billet", value: ticketNumber },
            ].map((c) => (
              <div
                key={c.label}
                className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2.5 px-1"
                style={{ background: "hsl(145 20% 10%)", border: "1px solid hsl(145 40% 18% / 0.6)" }}
              >
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">{c.label}</span>
                <span className="font-mono font-bold text-sm tracking-widest text-white">{c.value}</span>
              </div>
            ))}
          </div>

          {/* Dashed separator */}
          <div className="w-full border-t border-dashed border-accent/20 mb-4" />

          {/* Security badge */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Billet sécurisé — Inbox Ticket</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        Vous souhaitez réserver un billet ?{" "}
        <Link href="/" className="text-accent underline">Découvrir les événements</Link>
      </p>
    </div>
  );
}
