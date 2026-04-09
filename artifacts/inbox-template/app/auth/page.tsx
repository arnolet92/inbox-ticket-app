"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PublicLayout } from "@/components/public-layout";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/mes-billets");
    }, 1000);
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "hsl(145 55% 40% / 0.15)", border: "1px solid hsl(145 55% 40% / 0.3)" }}>
              <Ticket className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display font-extrabold text-3xl mb-1">
              {mode === "login" ? "Accéder à mes billets" : "Créer un compte"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "login"
                ? "Connectez-vous pour voir vos réservations"
                : "Inscrivez-vous pour acheter des billets"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl border border-border bg-card p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? "bg-accent text-black" : "text-muted-foreground hover:text-foreground"
                }`}>
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Nom complet</label>
                <input
                  type="text"
                  placeholder="Rakoto Jean"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent/60"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Numéro de téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="+261 34 00 000 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent/60"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent/60"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === "login" && (
                <p className="text-xs text-muted-foreground mt-1">Le mot de passe est votre nom utilisé lors de l&apos;achat</p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-70"
              style={{ background: "hsl(145 55% 40%)" }}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>{mode === "login" ? "Accéder à mes billets" : "Créer mon compte"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas encore de billet ?{" "}
            <Link href="/events" className="text-accent hover:underline">
              Découvrir les événements
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
