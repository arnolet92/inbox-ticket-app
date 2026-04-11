import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LayoutDashboard, Calendar, ShoppingCart, CreditCard, ChevronRight, Ticket, User, Users, Building2, BookUser, LogOut, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOrganizer } from "@/context/OrganizerContext";
import { cn } from "@/lib/utils";
import { logoInboxTransparent } from "@/assets/images";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1 group transition-opacity hover:opacity-90">
      <img
        src={logoInboxTransparent}
        alt="inbox"
        className="h-10 w-auto transition-transform group-hover:scale-105 group-active:scale-95"
        style={{ filter: "drop-shadow(0 0 6px hsl(145 60% 35% / 0.35))" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <span className="font-display text-xl font-extrabold tracking-widest text-accent uppercase">
        ticket
      </span>
    </Link>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
    }, 900);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-40 w-full glass-panel border-b-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-foreground/80 hover:text-accent transition-colors">Accueil</Link>
            <Link href="/events" className="text-sm font-semibold text-foreground/80 hover:text-accent transition-colors">Événements</Link>
            {user && (
              <Link href="/mes-billets" className="text-sm font-semibold text-foreground/80 hover:text-accent transition-colors flex items-center gap-1.5">
                <Ticket className="w-4 h-4" /> Mes Billets
              </Link>
            )}
            {!user && (
              <div className="flex items-center gap-2">
                <Link href="/organizer/login" className="text-sm font-semibold px-4 py-2 rounded-lg bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground transition-all flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Organisateur
                </Link>
                <Link href="/admin" className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary/20 text-primary-foreground border border-primary/30 hover:bg-primary/40 transition-all">
                  Admin
                </Link>
              </div>
            )}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground/80">{user.name.split(" ")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-60"
                  title="Déconnexion"
                >
                  {isLoggingOut
                    ? <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin inline-block" />
                    : <LogOut className="w-4 h-4" />
                  }
                </button>
              </div>
            ) : (
              <Link href="/auth" className="text-sm font-semibold px-4 py-2 rounded-lg bg-accent text-black hover:bg-accent/90 transition-all flex items-center gap-1.5">
                <User className="w-4 h-4" /> Connexion
              </Link>
            )}
          </nav>

          <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full glass-panel border-t border-border/50 py-4 px-4 flex flex-col gap-4">
            <Link href="/" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
            <Link href="/events" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Événements</Link>
            {user && (
              <Link href="/mes-billets" className="text-lg font-semibold flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Ticket className="w-5 h-5 text-accent" /> Mes Billets
              </Link>
            )}
            {user ? (
              <>
                <div className="flex items-center gap-2 text-lg font-semibold text-accent">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">{user.name.charAt(0).toUpperCase()}</div>
                  {user.name}
                </div>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  disabled={isLoggingOut}
                  className="text-left text-destructive font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {isLoggingOut
                    ? <span className="w-5 h-5 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin inline-block" />
                    : <LogOut className="w-5 h-5" />
                  }
                  {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
                </button>
              </>
            ) : (
              <Link href="/auth" className="text-lg font-semibold text-accent flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <User className="w-5 h-5" /> Connexion / S'inscrire
              </Link>
            )}
            {!user && (
              <>
                <Link href="/organizer/login" className="text-lg font-semibold text-muted-foreground flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Building2 className="w-5 h-5" /> Espace Organisateur
                </Link>
                <Link href="/admin" className="text-lg font-semibold text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>Espace Admin</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-card border-t border-border py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Inbox Ticket. Vivez l'événementiel autrement.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/events", label: "Événements", icon: Calendar },
    // { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
    // { href: "/admin/payments", label: "Paiements", icon: CreditCard },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/organizers", label: "Organisateurs", icon: Building2 },
    { href: "/admin/contacts", label: "Contacts", icon: BookUser },
    { href: "/admin/entreprise", label: "Informations Entreprise", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:block flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 h-20 flex items-center border-b border-border/50">
          <Logo />
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-4 mt-4">Gestion Admin</div>
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className="h-5 w-5" />
                {link.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display text-sm shrink-0 shadow-md shadow-primary/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-foreground">{user?.name ?? "Administrateur"}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.phone ?? "Admin"}</div>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <Ticket className="h-4 w-4 shrink-0" />
            Retour au site
          </Link>
          {user && (
            <button
              onClick={() => { logout(); window.location.href = "/"; }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Se déconnecter
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-card border-b border-border flex items-center px-4 sm:px-6 lg:px-8 justify-between shrink-0">
          <button className="lg:hidden text-foreground" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display text-sm shadow-md shadow-primary/20">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">{children}</main>
      </div>
    </div>
  );
}

export function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { organizer, logout } = useOrganizer();

  const displayName = organizer?.name ?? "Organisateur";
  const displayCompany = organizer?.company ?? "Inbox Ticket";
  const initials = displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const links = [
    { href: "/organizer/events", label: "Mes Événements", icon: Calendar },
    { href: "/organizer/referral", label: "Parrainage", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:block flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 h-20 flex items-center border-b border-border/50"><Logo /></div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-4 mt-4">Espace Organisateur</div>
          {links.map((link) => {
            const isActive = location.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className="h-5 w-5" />
                {link.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{displayCompany}</div>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Ticket className="h-4 w-4 shrink-0" /> Retour au site
          </Link>
          <button onClick={() => { logout(); navigate("/organizer/login"); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
            <LogOut className="h-4 w-4 shrink-0" /> Se déconnecter
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-card border-b border-border flex items-center px-4 sm:px-6 lg:px-8 justify-between shrink-0">
          <button className="lg:hidden text-foreground" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-auto">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">{children}</main>
      </div>
    </div>
  );
}
