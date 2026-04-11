import React from "react";
import { useSearch } from "wouter";
import { Link } from "wouter";
import { InboxQRCode } from "@/components/InboxQRCode";
import { PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Ticket, Shield, Calendar, Key, CheckCircle2, Hash,
  AlertTriangle, Download,
} from "lucide-react";

export default function BilletPublic() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const code      = params.get("code");
  const eventName = params.get("event");
  const dateRaw   = params.get("date");
  const ticketKey = params.get("key");
  const confirmCode = params.get("confirm");
  const ticketNumber = params.get("ticket");
  const orderId   = params.get("order");

  const eventDate = dateRaw ? new Date(dateRaw) : null;
  const hasDetails = !!(eventName || ticketKey || confirmCode || ticketNumber);

  if (!code) {
    return (
      <PublicLayout>
        <div className="max-w-sm mx-auto px-4 py-32 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-display mb-2">Billet introuvable</h1>
          <p className="text-muted-foreground mb-8">Ce lien de billet est invalide ou expiré.</p>
          <Link href="/mes-billets"><Button variant="accent">Mes billets</Button></Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen py-16 px-4 flex flex-col items-center">
        {/* ── Premium ticket card ── */}
        <div
          className="w-full max-w-sm relative"
          style={{
            borderRadius: 28,
            overflow: "hidden",
            border: "1.5px solid hsl(145 45% 22% / 0.6)",
            boxShadow: "0 32px 80px hsl(150 30% 4% / 0.8), 0 0 0 1px hsl(145 50% 30% / 0.06)",
            background: "hsl(150 15% 6%)",
          }}
        >
          {/* Top gradient bar */}
          <div style={{ height: 5, background: "linear-gradient(90deg, hsl(145 65% 40%), hsl(160 55% 34%), hsl(145 60% 28%))" }} />

          {/* Glow blob */}
          <div
            style={{
              position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
              width: 220, height: 220, borderRadius: "50%",
              background: "hsl(145 60% 25% / 0.18)", filter: "blur(48px)", pointerEvents: "none",
            }}
          />

          {/* ── Header ── */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "hsl(145 50% 15%)",
                  border: "1px solid hsl(145 50% 25% / 0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Ticket style={{ width: 18, height: 18, color: "hsl(145 65% 52%)" }} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "hsl(145 60% 48%)", textTransform: "uppercase" }}>
                  Inbox Ticket
                </p>
                <p style={{ fontSize: 9, color: "hsl(145 20% 40%)", letterSpacing: "0.06em" }}>
                  Billet électronique
                </p>
              </div>
            </div>

            {eventName && (
              <h1
                className="font-bold font-display leading-tight"
                style={{ fontSize: 20, color: "white", marginBottom: 6 }}
              >
                {eventName}
              </h1>
            )}

            {eventDate && (
              <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: "hsl(145 50% 55%)" }}>
                <Calendar style={{ width: 13, height: 13 }} />
                <span>{format(eventDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
              </div>
            )}

            {orderId && (
              <p style={{ fontSize: 11, color: "hsl(145 20% 38%)", marginTop: 4, fontFamily: "monospace" }}>
                Commande #{orderId}
              </p>
            )}
          </div>

          {/* ── Dashed separator ── */}
          <div className="relative mx-6 my-1">
            <div style={{ height: 1, borderTop: "1.5px dashed hsl(145 30% 16%)" }} />
            <div style={{ position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: "hsl(150 20% 4%)", border: "1.5px solid hsl(145 30% 16%)" }} />
            <div style={{ position: "absolute", right: -28, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: "hsl(150 20% 4%)", border: "1.5px solid hsl(145 30% 16%)" }} />
          </div>

          {/* ── QR Code ── */}
          <div className="px-6 py-5 flex flex-col items-center gap-4">
            <div className="relative">
              <div
                style={{
                  position: "absolute", inset: -8, borderRadius: 20,
                  background: "hsl(145 60% 25% / 0.22)", filter: "blur(16px)",
                }}
              />
              <div
                style={{
                  position: "relative", padding: 14, background: "white",
                  borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <InboxQRCode value={decodeURIComponent(code)} size={200} fgColor="#14532d" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(145 30% 42%)" }}>
              <Shield style={{ width: 11, height: 11, color: "hsl(145 60% 48%)" }} />
              Scannez ce QR code à l'entrée
            </div>
          </div>

          {/* ── Dashed separator ── */}
          <div className="relative mx-6 mb-1">
            <div style={{ height: 1, borderTop: "1.5px dashed hsl(145 30% 16%)" }} />
            <div style={{ position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: "hsl(150 20% 4%)", border: "1.5px solid hsl(145 30% 16%)" }} />
            <div style={{ position: "absolute", right: -28, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: "hsl(150 20% 4%)", border: "1.5px solid hsl(145 30% 16%)" }} />
          </div>

          {/* ── Code boxes ── */}
          {hasDetails && (
            <div className="px-6 pb-5 pt-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Key style={{ width: 10, height: 10 }} />, label: "Clé", value: ticketKey },
                  { icon: <CheckCircle2 style={{ width: 10, height: 10 }} />, label: "Confirmation", value: confirmCode },
                  { icon: <Hash style={{ width: 10, height: 10 }} />, label: "N° Billet", value: ticketNumber },
                ].filter(c => c.value).map(c => (
                  <div
                    key={c.label}
                    style={{
                      borderRadius: 12, padding: "10px 8px",
                      background: "hsl(145 20% 8%)",
                      border: "1px solid hsl(145 35% 16% / 0.7)",
                      textAlign: "center",
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1" style={{ color: "hsl(145 40% 42%)" }}>
                      {c.icon}
                      <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                        {c.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "monospace", fontWeight: 700, fontSize: 13,
                        color: "white", letterSpacing: "0.1em",
                      }}
                    >
                      {c.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Raw QR value */}
              <div
                className="mt-3 px-3 py-2 rounded-xl text-center"
                style={{ background: "hsl(145 12% 7%)", border: "1px solid hsl(145 20% 12%)" }}
              >
                <p style={{ fontSize: 8, color: "hsl(145 20% 30%)", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.6 }}>
                  {decodeURIComponent(code)}
                </p>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div
            style={{
              borderTop: "1px solid hsl(145 25% 13%)",
              padding: "12px 24px",
              background: "hsl(145 15% 5%)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Shield style={{ width: 12, height: 12, color: "hsl(145 55% 45%)" }} />
            <span style={{ fontSize: 11, color: "hsl(145 20% 38%)", fontWeight: 500 }}>
              Billet sécurisé — Inbox Ticket
            </span>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-8 text-center space-y-3">
          <Link href="/mes-billets">
            <Button variant="outline" size="sm" className="gap-2">
              <Ticket className="w-4 h-4" /> Mes billets
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Besoin d'aide ?{" "}
            <Link href="/" className="text-accent hover:underline">Retour à l'accueil</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
