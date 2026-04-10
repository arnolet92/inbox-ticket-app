import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Building2, ScanLine, ShoppingCart, Eye, EyeOff } from "lucide-react";
import { useOrganizer } from "@/context/OrganizerContext";
import { Logo } from "@/components/layout";
import { STATIC_ORGANIZERS } from "@/data/static";

export default function OrganizerLogin() {
  const { loginAs } = useOrganizer();
  const [, navigate] = useLocation();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAccess = (role: "organisateur" | "agent-vente" | "agent-scan") => {
    const org = STATIC_ORGANIZERS.find(o => o.status !== "suspended") ?? STATIC_ORGANIZERS[0];
    const roleLabel =
      role === "organisateur" ? "Organisateur" :
      role === "agent-vente" ? "Agent Vente" : "Agent Scan";

    if (org) {
      loginAs({ id: org.id, name: org.name, company: org.company, email: org.email, role });
    } else {
      loginAs({ id: "admin", name: roleLabel, company: "Inbox Ticket", email: "admin@inbox.mg", role });
    }
    navigate("/organizer/events");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pharmasalepos/images/hero-bg.png')] bg-cover bg-center opacity-5 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="glass-panel rounded-3xl p-10 border border-border/60 shadow-2xl flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30">
            <Building2 className="w-8 h-8 text-accent" />
          </div>

          <div>
            <h1 className="text-2xl font-bold font-display text-white mb-2">Espace Organisateur</h1>
            <p className="text-muted-foreground text-sm">Gérez vos événements, billets et commandes</p>
          </div>

          {/* Champs de connexion */}
          <div className="w-full space-y-3 text-left">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">
                Pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Votre identifiant"
                autoComplete="username"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Boutons de rôle */}
          <div className="w-full space-y-3">
            <button
              onClick={() => handleAccess("organisateur")}
              className="w-full py-3.5 px-6 rounded-xl bg-accent text-black font-bold text-base hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5" />
              Organisateur
            </button>

            <button
              onClick={() => handleAccess("agent-vente")}
              className="w-full py-3.5 px-6 rounded-xl bg-primary/20 border border-primary/40 text-white font-semibold text-base hover:bg-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5 text-accent" />
              Agent vente
            </button>

            <button
              onClick={() => handleAccess("agent-scan")}
              className="w-full py-3.5 px-6 rounded-xl bg-primary/20 border border-primary/40 text-white font-semibold text-base hover:bg-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ScanLine className="w-5 h-5 text-accent" />
              Agent scan
            </button>
          </div>

          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Retour au site public
          </Link>
        </div>
      </div>
    </div>
  );
}
