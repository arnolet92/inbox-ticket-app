import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone, Lock, Eye, EyeOff, User, MapPin, ArrowRight,
  CheckCircle2, AlertCircle, Ticket, Shield, Sparkles, ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/layout";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

/* ── Password strength ── */
function passwordStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  return score;
}
const STRENGTH_LABELS = ["", "Faible", "Moyen", "Bon", "Fort"];
const STRENGTH_COLORS = ["", "#ef4444", "#f59e0b", "#22c55e", "#16a34a"];

/* ── Input field ── */
function Field({
  label, icon, type = "text", value, onChange, placeholder, hint, error, required,
  rightEl,
}: {
  label: string; icon: React.ReactNode; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; hint?: string;
  error?: string; required?: boolean; rightEl?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 ${rightEl ? "pr-10" : "pr-4"} py-3 rounded-xl bg-background/60 border transition-all outline-none text-sm
            ${error ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20"}`}
        />
        {rightEl && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</span>}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

/* ── Left decorative panel ── */
function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(145,48%,14%)] to-[hsl(145,60%,8%)]">
      {/* Kente pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#22c55e 0,#22c55e 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#f59e0b 0,#f59e0b 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <Logo />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Big visual */}
        <div className="w-24 h-24 rounded-3xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-2">
          <Ticket className="w-12 h-12 text-accent" />
        </div>

        <div>
          <h2 className="text-4xl font-bold font-display text-white leading-tight mb-4">
            Votre accès<br />
            <span className="text-accent">aux meilleurs</span><br />
            événements
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Créez votre compte et réservez vos billets en quelques secondes via Orange Money, MVola ou Mastercard.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: <Shield className="w-4 h-4" />, text: "Paiement 100% sécurisé" },
            { icon: <Ticket className="w-4 h-4" />, text: "Billets électroniques instantanés" },
            { icon: <Sparkles className="w-4 h-4" />, text: "Accès à tous vos billets à tout moment" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                {f.icon}
              </div>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Kente stripe bottom */}
      <div className="relative z-10 h-2 rounded-full overflow-hidden flex mt-8">
        {["#22c55e","#f59e0b","#fff","#f97316","#22c55e","#f59e0b","#fff","#f97316","#22c55e","#f59e0b"].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

/* ── LOGIN FORM ── */
function LoginForm({ onSwitchToRegister, redirectTo }: { onSwitchToRegister: () => void; redirectTo: string }) {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!phone.trim()) newErrors.phone = "Le numéro de téléphone est requis.";
    if (!password) newErrors.password = "Le mot de passe est requis.";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    setGlobalError("");
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);
    if (!result.ok) { setGlobalError(result.error || "Erreur de connexion."); return; }
    setLocation(redirectTo || "/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display mb-1">Bon retour ! 👋</h1>
        <p className="text-muted-foreground text-sm">Connectez-vous pour accéder à vos billets</p>
      </div>

      {globalError && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Numéro de téléphone" icon={<Phone className="w-4 h-4" />} type="tel"
          value={phone} onChange={setPhone} placeholder="+261 34 00 000 00"
          error={errors.phone} required
        />
        <Field label="Mot de passe" icon={<Lock className="w-4 h-4" />}
          type={showPwd ? "text" : "password"}
          value={password} onChange={setPassword} placeholder="Votre mot de passe"
          error={errors.password} required
          rightEl={
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="text-muted-foreground hover:text-foreground transition-colors">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Button type="submit" variant="accent" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Connexion...</>
            : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </form>

      <div className="relative flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">Pas encore de compte ?</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button onClick={onSwitchToRegister}
        className="w-full py-3 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 font-semibold text-sm transition-all hover:border-accent/60">
        Créer un compte gratuitement
      </button>
    </div>
  );
}

/* ── REGISTER FORM ── */
function RegisterForm({ onSwitchToLogin, redirectTo }: { onSwitchToLogin: () => void; redirectTo: string }) {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Le nom complet est requis.";
    if (!address.trim()) newErrors.address = "L'adresse est requise.";
    if (!phone.trim()) newErrors.phone = "Le numéro de téléphone est requis.";
    if (password.length < 6) newErrors.password = "Minimum 6 caractères.";
    if (password !== confirm) newErrors.confirm = "Les mots de passe ne correspondent pas.";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    setGlobalError("");
    setLoading(true);
    const result = await register({ name, address, phone, password });
    setLoading(false);
    if (!result.ok) { setGlobalError(result.error || "Erreur lors de la création."); return; }
    setLocation(redirectTo || "/");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onSwitchToLogin}
          className="w-9 h-9 rounded-xl border border-border hover:border-accent/50 flex items-center justify-center transition-all hover:bg-accent/10">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-display mb-0.5">Créer un compte</h1>
          <p className="text-muted-foreground text-sm">Rejoignez la communauté Inbox Ticket</p>
        </div>
      </div>

      {globalError && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nom complet" icon={<User className="w-4 h-4" />}
          value={name} onChange={setName} placeholder="Jean Rakoto"
          error={errors.name} required
        />
        <Field label="Adresse" icon={<MapPin className="w-4 h-4" />}
          value={address} onChange={setAddress} placeholder="Antananarivo, Analamanga"
          error={errors.address} required
        />
        <Field label="Numéro de téléphone" icon={<Phone className="w-4 h-4" />} type="tel"
          value={phone} onChange={setPhone} placeholder="+261 34 00 000 00"
          error={errors.phone} required
        />

        {/* Password with strength indicator */}
        <div>
          <Field label="Mot de passe" icon={<Lock className="w-4 h-4" />}
            type={showPwd ? "text" : "password"}
            value={password} onChange={setPassword} placeholder="Minimum 6 caractères"
            error={errors.password} required
            rightEl={
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="text-muted-foreground hover:text-foreground transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? STRENGTH_COLORS[strength] : "hsl(var(--muted))" }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: STRENGTH_COLORS[strength] }}>
                {STRENGTH_LABELS[strength]}
              </p>
            </div>
          )}
        </div>

        <Field label="Confirmer le mot de passe" icon={<Lock className="w-4 h-4" />}
          type={showConfirm ? "text" : "password"}
          value={confirm} onChange={setConfirm} placeholder="Retapez votre mot de passe"
          error={errors.confirm} required
          rightEl={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="text-muted-foreground hover:text-foreground transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Password match check */}
        {confirm && !errors.confirm && password === confirm && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Les mots de passe correspondent
          </div>
        )}

        <Button type="submit" variant="accent" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Création...</>
            : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Déjà un compte ?{" "}
        <button onClick={onSwitchToLogin} className="text-accent hover:underline font-semibold">
          Se connecter
        </button>
      </p>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function Auth() {
  const [, params] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <BrandPanel />

      {/* Right panel */}
      <div className="flex flex-col min-h-screen bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6 lg:hidden">
          <Logo />
        </div>
        <div className="hidden lg:flex items-center justify-end px-8 py-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Retour au site
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-8">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div key="login"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <LoginForm
                    onSwitchToRegister={() => setMode("register")}
                    redirectTo={redirectTo}
                  />
                </motion.div>
              ) : (
                <motion.div key="register"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <RegisterForm
                    onSwitchToLogin={() => setMode("login")}
                    redirectTo={redirectTo}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border/30 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Inbox Ticket
          </p>
          <div className="flex gap-4">
            {["Confidentialité", "Conditions", "Aide"].map(l => (
              <a key={l} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
