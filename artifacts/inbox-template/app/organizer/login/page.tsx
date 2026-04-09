"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrganizerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+261320000001");
  const [password, setPassword] = useState("password");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      router.push("/organizer/events");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "hsl(145 55% 5%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "hsl(145 55% 40% / 0.15)", border: "1px solid hsl(145 55% 40% / 0.3)" }}>
            <Building2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display font-extrabold text-3xl mb-1">Espace Organisateur</h1>
          <p className="text-muted-foreground text-sm">Gestion de vos événements</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent/60" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent/60" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-all"
              style={{ background: "hsl(145 55% 40%)" }}>
              {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> :
                <>Accéder à mon espace <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link href="/inbox-template" className="text-xs text-muted-foreground hover:text-white transition-colors">
              ← Retour au site public
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
