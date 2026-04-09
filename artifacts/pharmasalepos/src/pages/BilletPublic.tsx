import React from "react";
import { useSearch } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { Ticket, Shield } from "lucide-react";

export default function BilletPublic() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const code = params.get("code");

  return (
    <PublicLayout>
      <div className="max-w-sm mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Ticket className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">Billet électronique</h1>
        <p className="text-muted-foreground text-sm mb-8">Scannez ce QR code à l'entrée de l'événement</p>

        {code ? (
          <div className="flex flex-col items-center gap-6">
            <div className="p-5 bg-white rounded-2xl shadow-xl border border-accent/20">
              <QRCodeSVG value={decodeURIComponent(code)} size={220} level="H" fgColor="#14532d" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
              <Shield className="w-3.5 h-3.5 text-accent" /> Billet sécurisé — Inbox Ticket
            </div>
            <p className="text-xs text-muted-foreground font-mono break-all opacity-60">{decodeURIComponent(code)}</p>
          </div>
        ) : (
          <div className="py-12 text-muted-foreground">
            <p className="mb-4">Aucun code de billet fourni.</p>
            <Link href="/mes-billets"><Button variant="outline">Mes billets</Button></Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
