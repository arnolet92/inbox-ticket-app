import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Dialog, DeleteModal } from "@/components/ui";
import {
  Users, Plus, Trash2, ShieldCheck, Shield, UserCog,
  Phone, Eye, EyeOff, AlertTriangle, UserPlus, Lock,
} from "lucide-react";

type AdminRole = "super_admin" | "admin" | "staff";

type AdminAccount = {
  id: string;
  name: string;
  phone: string;
  role: AdminRole;
  createdAt: string;
};

const ADMINS_KEY = "inbox_admins";

const ROLE_CONFIG: Record<AdminRole, { label: string; color: string; icon: React.ElementType; variant: "success" | "warning" | "outline" }> = {
  super_admin: { label: "Super Admin",    color: "text-accent",           icon: ShieldCheck, variant: "success" },
  admin:       { label: "Administrateur", color: "text-blue-400",         icon: Shield,      variant: "warning" },
  staff:       { label: "Staff",          color: "text-muted-foreground", icon: UserCog,     variant: "outline" },
};

function getAdmins(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(ADMINS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaults: AdminAccount[] = [
    { id: "1", name: "Administrateur", phone: "034 00 000 00", role: "super_admin", createdAt: new Date().toISOString() },
  ];
  localStorage.setItem(ADMINS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveAdmins(admins: AdminAccount[]) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const roleColors: Record<AdminRole, string> = {
  super_admin: "bg-primary",
  admin: "bg-blue-600",
  staff: "bg-muted-foreground",
};

export default function AdminUsers() {
  const [admins, setAdmins] = useState<AdminAccount[]>(getAdmins);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", role: "admin" as AdminRole, password: "" });
  const [formError, setFormError] = useState("");

  const stats = useMemo(() => ({
    total: admins.length,
    superAdmins: admins.filter((a) => a.role === "super_admin").length,
    admins: admins.filter((a) => a.role === "admin").length,
    staff: admins.filter((a) => a.role === "staff").length,
  }), [admins]);

  function handleAdd() {
    setFormError("");
    if (!form.name.trim()) return setFormError("Le nom est requis.");
    if (!form.phone.trim()) return setFormError("Le numéro est requis.");
    if (!form.password.trim() || form.password.length < 4) return setFormError("Le mot de passe doit avoir au moins 4 caractères.");
    if (admins.some((a) => a.phone.replace(/\s/g, "") === form.phone.replace(/\s/g, ""))) {
      return setFormError("Ce numéro est déjà utilisé.");
    }
    const newAdmin: AdminAccount = { id: Date.now().toString(), name: form.name.trim(), phone: form.phone.trim(), role: form.role, createdAt: new Date().toISOString() };
    const updated = [...admins, newAdmin];
    saveAdmins(updated);
    setAdmins(updated);
    setForm({ name: "", phone: "", role: "admin", password: "" });
    setShowModal(false);
  }

  function handleDelete(admin: AdminAccount) {
    const updated = admins.filter((a) => a.id !== admin.id);
    saveAdmins(updated);
    setAdmins(updated);
    setDeleteTarget(null);
  }

  const isLastSuperAdmin = (admin: AdminAccount) =>
    admin.role === "super_admin" && admins.filter((a) => a.role === "super_admin").length === 1;

  const canDelete = (admin: AdminAccount) => !isLastSuperAdmin(admin);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Administrateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes qui ont accès à l'administration de la plateforme.</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 shrink-0"
        >
          <Plus className="h-4 w-4" /> Ajouter un admin
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",          value: stats.total,       icon: Users,      color: "text-foreground",        bg: "bg-muted/60" },
          { label: "Super Admin",    value: stats.superAdmins, icon: ShieldCheck,color: "text-accent",            bg: "bg-primary/10" },
          { label: "Administrateur", value: stats.admins,      icon: Shield,     color: "text-blue-400",          bg: "bg-blue-500/10" },
          { label: "Staff",          value: stats.staff,       icon: UserCog,    color: "text-muted-foreground",  bg: "bg-muted/40" },
        ].map((s) => (
          <Card key={s.label} className="p-5 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Administrateur</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Depuis</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => {
              const RoleIcon = ROLE_CONFIG[admin.role].icon;
              return (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full ${roleColors[admin.role]} flex items-center justify-center text-white font-bold font-display text-xs shrink-0 shadow-md`}>
                        {initials(admin.name)}
                      </div>
                      <div className="font-semibold text-foreground">{admin.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {admin.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ROLE_CONFIG[admin.role].color}`}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {ROLE_CONFIG[admin.role].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(admin.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    {canDelete(admin) ? (
                      <button
                        onClick={() => setDeleteTarget(admin)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground/40 px-3">Protégé</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouvel administrateur"
        subtitle="Créez un compte avec accès à l'espace admin"
        icon={<UserPlus className="w-5 h-5" />}
      >
        <div className="space-y-4">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Users className="w-3.5 h-3.5 text-accent" /> Nom complet
            </label>
            <input
              type="text" placeholder="Jean Rakoto" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex h-12 w-full rounded-xl px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none transition-colors"
              style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
            />
          </div>
          {/* Téléphone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Phone className="w-3.5 h-3.5 text-accent" /> Numéro de téléphone
            </label>
            <input
              type="tel" placeholder="034 XX XXX XX" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="flex h-12 w-full rounded-xl px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none transition-colors"
              style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
            />
          </div>
          {/* Rôle */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5 text-accent" /> Rôle
            </label>
            <select
              value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
              className="flex h-12 w-full rounded-xl px-4 py-2 text-sm focus-visible:outline-none transition-colors appearance-none"
              style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
            >
              <option value="super_admin">⭐ Super Admin</option>
              <option value="admin">🛡️ Administrateur</option>
              <option value="staff">👤 Staff</option>
            </select>
          </div>
          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Lock className="w-3.5 h-3.5 text-accent" /> Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} placeholder="Mot de passe sécurisé"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="flex h-12 w-full rounded-xl px-4 pr-11 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none transition-colors"
                style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {formError && (
            <div className="flex items-center gap-2 text-red-400 text-sm rounded-xl px-4 py-3" style={{ background: "hsl(0 60% 10%)", border: "1.5px solid hsl(0 60% 25% / 0.5)" }}>
              <AlertTriangle className="h-4 w-4 shrink-0" /> {formError}
            </div>
          )}
          <div className="pt-3 flex gap-3 border-t" style={{ borderColor: "hsl(145 40% 14%)" }}>
            <button onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all hover:bg-white/5" style={{ border: "1.5px solid hsl(145 30% 16%)", color: "hsl(145 20% 70%)" }}>Annuler</button>
            <button onClick={handleAdd} className="flex-1 h-11 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "hsl(145 80% 42%)" }}>
              <UserPlus className="w-4 h-4" /> Créer le compte
            </button>
          </div>
        </div>
      </Dialog>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Supprimer cet admin ?"
        description={<>Le compte de <strong className="text-white">{deleteTarget?.name}</strong> sera définitivement supprimé.</>}
      />
    </AdminLayout>
  );
}
