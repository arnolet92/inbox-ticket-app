import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, ScanLine, ShoppingCart } from "lucide-react";
import { useOrganizer } from "@/context/OrganizerContext";
import { Logo } from "@/components/layout";
import { STATIC_ORGANIZERS } from "@/data/static";

export default function OrganizerLogin() {
  const { loginAs } = useOrganizer();
  const [, navigate] = useLocation();

  const handleAccess = (role: "organisateur" | "agent-vente" | "agent-scan") => {
    const org = STATIC_ORGANIZERS.find(o => o.status !== "suspended") ?? STATIC_ORGANIZERS[0];
    const roleLabel = role === "organisateur" ? "Organisateur" : role === "agent-vente" ? "Agent Vente" : "Agent Scan";
    if (org) {
      loginAs({ id: org.id, name: org.name, company: org.company, email: org.email, role });
    } else {
      loginAs({ id: "admin", name: roleLabel, company: "Inbox Ticket", email: "admin@inbox.mg", role });
    }
    navigate("/organizer/events");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#22c55e 0,#22c55e 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#f59e0b 0,#f59e0b 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Logo /></div>
          <h1 className="text-3xl font-bold font-display">Espace Organisateur</h1>
          <p className="text-muted-foreground mt-2">Choisissez votre rôle pour accéder à votre espace.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              role: "organisateur" as const,
              icon: <Building2 className="w-7 h-7" />,
              title: "Organisateur",
              desc: "Gérez vos événements et consultez vos statistiques",
              color: "hsl(var(--accent))",
            },
            {
              role: "agent-vente" as const,
              icon: <ShoppingCart className="w-7 h-7" />,
              title: "Agent de vente",
              desc: "Vendez des billets sur place",
              color: "#f59e0b",
            },
            {
              role: "agent-scan" as const,
              icon: <ScanLine className="w-7 h-7" />,
              title: "Agent de scan",
              desc: "Validez les billets à l'entrée",
              color: "#3b82f6",
            },
          ].map(item => (
            <button
              key={item.role}
              onClick={() => handleAccess(item.role)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border hover:border-accent/50 bg-card hover:bg-card/80 transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.color + "20", border: `1.5px solid ${item.color}40`, color: item.color }}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
              <div className="text-muted-foreground group-hover:text-accent transition-colors">→</div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Ceci est une démo. Cliquez sur un rôle pour accéder directement.
        </p>
      </div>
    </div>
  );
}
