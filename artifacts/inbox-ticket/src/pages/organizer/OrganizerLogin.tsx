import { useLocation } from "wouter";
import { Building2 } from "lucide-react";
import { useOrganizer } from "@/context/OrganizerContext";
import { Logo } from "@/components/layout";

const ORGS_KEY = "inbox_ticket_organizers";

function getFirstActiveOrganizer() {
  try {
    const orgs = JSON.parse(localStorage.getItem(ORGS_KEY) || "[]");
    return orgs.find((o: any) => o.status !== "suspended") ?? orgs[0] ?? null;
  } catch {
    return null;
  }
}

export default function OrganizerLogin() {
  const { loginAs } = useOrganizer();
  const [, navigate] = useLocation();

  const handleAccess = () => {
    const org = getFirstActiveOrganizer();
    if (org) {
      loginAs({ id: org.id, name: org.name, company: org.company, email: org.email });
    } else {
      loginAs({ id: "admin", name: "Organisateur", company: "Inbox Ticket", email: "admin@inbox.mg" });
    }
    navigate("/organizer/events");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-5 pointer-events-none" />
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

          <button
            onClick={handleAccess}
            className="w-full py-3.5 px-6 rounded-xl bg-accent text-black font-bold text-base hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            Se connecter
          </button>

          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Retour au site public
          </a>
        </div>
      </div>
    </div>
  );
}
