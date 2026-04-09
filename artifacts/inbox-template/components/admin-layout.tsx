"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Calendar, Ticket, Users, Menu, X, LogOut, ChevronRight
} from "lucide-react";

function Logo() {
  return (
    <Link href="/inbox-template/admin" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(145 55% 40%)" }}>
        <Ticket className="w-4 h-4 text-black" />
      </div>
      <div className="leading-none">
        <p className="font-display font-extrabold text-sm tracking-widest uppercase text-accent">Inbox</p>
        <p className="text-[9px] font-semibold text-muted-foreground tracking-widest uppercase">Admin</p>
      </div>
    </Link>
  );
}

const NAV = [
  { href: "/inbox-template/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/inbox-template/admin/events", label: "Événements", icon: Calendar },
  { href: "/inbox-template/admin/users", label: "Utilisateurs", icon: Users },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/inbox-template/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobile(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active ? "bg-accent text-black" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link href="/inbox-template" onClick={() => setMobile(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <LogOut className="w-4 h-4" /> Retour au site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-card flex-col fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobile(false)} />
          <aside className="absolute left-0 inset-y-0 w-60 bg-card border-r border-border">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="h-16 sticky top-0 z-20 glass-panel flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobile(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display font-bold text-sm text-muted-foreground">Administration</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-black" style={{ background: "hsl(145 55% 40%)" }}>
              A
            </div>
            Admin
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
