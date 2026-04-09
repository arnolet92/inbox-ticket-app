"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Ticket, User, Building2, LogOut } from "lucide-react";

function Logo() {
  return (
    <Link href="/inbox-template" className="flex items-center gap-1 group hover:opacity-90 transition-opacity">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(145 55% 40%)" }}>
        <Ticket className="w-5 h-5 text-black" />
      </div>
      <span className="font-display text-xl font-extrabold tracking-widest text-accent uppercase ml-1">
        inbox<span className="text-foreground/70">ticket</span>
      </span>
    </Link>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/inbox-template", label: "Accueil" },
    { href: "/inbox-template/events", label: "Événements" },
    { href: "/inbox-template/mes-billets", label: "Mes Billets" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === l.href
                    ? "text-accent"
                    : "text-foreground/70 hover:text-accent"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/inbox-template/organizer/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" /> Organisateur
            </Link>
            <Link
              href="/inbox-template/auth"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-black hover:opacity-90 transition-all flex items-center gap-1.5"
              style={{ background: "hsl(145 55% 40%)" }}
            >
              <User className="w-4 h-4" /> Connexion
            </Link>
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border py-4 px-6 flex flex-col gap-4 glass-panel">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-lg font-semibold" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/inbox-template/auth" className="text-lg font-semibold text-accent" onClick={() => setOpen(false)}>
              Connexion
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-card border-t border-border py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Inbox Ticket — Vivez l&apos;événementiel autrement.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/inbox-template/admin" className="hover:text-accent transition-colors">Admin</Link>
            <Link href="/inbox-template/organizer/login" className="hover:text-accent transition-colors">Organisateur</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
