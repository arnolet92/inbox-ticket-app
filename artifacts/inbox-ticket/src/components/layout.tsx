import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Ticket, Menu, X, LayoutDashboard, Calendar, ShoppingCart, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20 transition-transform group-hover:scale-105 group-active:scale-95">
        <Ticket className="h-6 w-6" />
      </div>
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        INBOX<span className="text-accent">TICKET</span>
      </span>
    </Link>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-40 w-full glass-panel border-b-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-foreground/80 hover:text-accent transition-colors">Accueil</Link>
            <Link href="/events" className="text-sm font-semibold text-foreground/80 hover:text-accent transition-colors">Événements</Link>
            <Link href="/admin" className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary/20 text-primary-foreground border border-primary/30 hover:bg-primary/40 transition-all">
              Admin
            </Link>
          </nav>

          <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full glass-panel border-t border-border/50 py-4 px-4 flex flex-col gap-4">
            <Link href="/" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
            <Link href="/events" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Événements</Link>
            <Link href="/admin" className="text-lg font-semibold text-accent" onClick={() => setIsMobileMenuOpen(false)}>Espace Admin</Link>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10">
        {children}
      </main>

      <footer className="bg-card border-t border-border py-12 relative z-10 mt-auto">
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

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/events", label: "Événements", icon: Calendar },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
    { href: "/admin/payments", label: "Paiements", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:block flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 h-20 flex items-center border-b border-border/50">
          <Logo />
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-4 mt-4">
            Gestion Admin
          </div>
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className="h-5 w-5" />
                {link.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <Link href="/" className="flex items-center justify-center w-full py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-card border-b border-border flex items-center px-4 sm:px-6 lg:px-8 justify-between shrink-0">
          <button className="lg:hidden text-foreground" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-foreground font-bold font-display">
              AD
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
