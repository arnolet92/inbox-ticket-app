import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import {
  Building2, Plus, Trash2, Pencil, Phone, Mail, Globe, Search,
  X, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Users2,
} from "lucide-react";

type OrgStatus = "active" | "suspended" | "pending";

type Organizer = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  status: OrgStatus;
  createdAt: string;
};

const ORGS_KEY = "inbox_ticket_organizers";

const STATUS_CONFIG: Record<OrgStatus, { label: string; variant: "success" | "destructive" | "warning"; icon: React.ElementType }> = {
  active:    { label: "Actif",     variant: "success",     icon: CheckCircle },
  suspended: { label: "Suspendu",  variant: "destructive", icon: XCircle },
  pending:   { label: "En attente",variant: "warning",     icon: AlertTriangle },
};

const DEMO_ORGS: Organizer[] = [
  { id: "1", name: "Hery Rakoto", company: "HeryEvent Pro", phone: "034 11 111 11", email: "hery@heryevent.mg", website: "heryevent.mg", status: "active", createdAt: "2025-11-01T00:00:00Z" },
  { id: "2", name: "Soa Ramiandrisoa", company: "SoaConcept Madagascar", phone: "033 22 222 22", email: "soa@soaconcept.mg", website: "soaconcept.mg", status: "active", createdAt: "2025-12-15T00:00:00Z" },
  { id: "3", name: "Tiana Productions", company: "Tiana Prod", phone: "032 33 333 33", email: "contact@tianaprod.mg", website: "", status: "pending", createdAt: "2026-01-20T00:00:00Z" },
];

function getOrganizers(): Organizer[] {
  try {
    const raw = localStorage.getItem(ORGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(ORGS_KEY, JSON.stringify(DEMO_ORGS));
  return DEMO_ORGS;
}

function saveOrganizers(orgs: Organizer[]) {
  localStorage.setItem(ORGS_KEY, JSON.stringify(orgs));
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-primary", "bg-blue-600", "bg-violet-600", "bg-amber-600", "bg-rose-600",
];

const emptyForm = { name: "", company: "", phone: "", email: "", website: "", status: "pending" as OrgStatus };

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>(getOrganizers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [editTarget, setEditTarget] = useState<Organizer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organizer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const stats = useMemo(() => ({
    total: organizers.length,
    active: organizers.filter((o) => o.status === "active").length,
    pending: organizers.filter((o) => o.status === "pending").length,
    suspended: organizers.filter((o) => o.status === "suspended").length,
  }), [organizers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return organizers;
    return organizers.filter((o) =>
      o.name.toLowerCase().includes(q) ||
      o.company.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.email.toLowerCase().includes(q)
    );
  }, [organizers, search]);

  function openAdd() {
    setForm(emptyForm);
    setFormError("");
    setModal("add");
  }

  function openEdit(org: Organizer) {
    setEditTarget(org);
    setForm({ name: org.name, company: org.company, phone: org.phone, email: org.email, website: org.website, status: org.status });
    setFormError("");
    setModal("edit");
  }

  function validate(): boolean {
    if (!form.name.trim()) { setFormError("Le nom est requis."); return false; }
    if (!form.company.trim()) { setFormError("La société est requise."); return false; }
    if (!form.phone.trim()) { setFormError("Le numéro est requis."); return false; }
    return true;
  }

  function handleSave() {
    if (!validate()) return;
    if (modal === "add") {
      const org: Organizer = { id: Date.now().toString(), ...form, name: form.name.trim(), company: form.company.trim(), phone: form.phone.trim(), email: form.email.trim(), website: form.website.trim(), createdAt: new Date().toISOString() };
      const updated = [...organizers, org];
      saveOrganizers(updated);
      setOrganizers(updated);
    } else if (modal === "edit" && editTarget) {
      const updated = organizers.map((o) => o.id === editTarget.id ? { ...o, ...form, name: form.name.trim(), company: form.company.trim() } : o);
      saveOrganizers(updated);
      setOrganizers(updated);
    }
    setModal(null);
  }

  function handleDelete(org: Organizer) {
    const updated = organizers.filter((o) => o.id !== org.id);
    saveOrganizers(updated);
    setOrganizers(updated);
    setDeleteTarget(null);
  }

  function toggleStatus(org: Organizer) {
    const nextStatus: OrgStatus = org.status === "active" ? "suspended" : "active";
    const updated = organizers.map((o) => o.id === org.id ? { ...o, status: nextStatus } : o);
    saveOrganizers(updated);
    setOrganizers(updated);
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">Organisateurs</h1>
          <p className="text-muted-foreground">Gérez les organisateurs d'événements sur la plateforme.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",      value: stats.total,     icon: Users2,      color: "text-foreground",        bg: "bg-muted/60" },
          { label: "Actifs",     value: stats.active,    icon: CheckCircle, color: "text-emerald-400",       bg: "bg-emerald-500/10" },
          { label: "En attente", value: stats.pending,   icon: AlertTriangle, color: "text-amber-400",       bg: "bg-amber-500/10" },
          { label: "Suspendus",  value: stats.suspended, icon: XCircle,     color: "text-red-400",           bg: "bg-red-500/10" },
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

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un organisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <div className="text-muted-foreground text-sm">Aucun organisateur trouvé.</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisateur</TableHead>
                <TableHead>Société</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Depuis</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((org, idx) => {
                const StatusIcon = STATUS_CONFIG[org.status].icon;
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold font-display text-xs shrink-0 shadow-md`}>
                          {initials(org.name)}
                        </div>
                        <div className="font-semibold text-foreground">{org.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{org.company}</span>
                      </div>
                      {org.website && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Globe className="h-3 w-3 shrink-0" />
                          {org.website}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {org.phone}
                      </div>
                      {org.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          {org.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleStatus(org)}
                        title="Cliquer pour changer le statut"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                      >
                        <Badge variant={STATUS_CONFIG[org.status].variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[org.status].label}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(org.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(org)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteTarget(org)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold font-display">
                {modal === "add" ? "Nouvel organisateur" : "Modifier l'organisateur"}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {[
                { label: "Nom complet *", key: "name", placeholder: "Jean Rakoto", type: "text" },
                { label: "Société / Organisation *", key: "company", placeholder: "Event Pro Madagascar", type: "text" },
                { label: "Téléphone *", key: "phone", placeholder: "034 XX XXX XX", type: "tel" },
                { label: "Email", key: "email", placeholder: "contact@societe.mg", type: "email" },
                { label: "Site web", key: "website", placeholder: "www.societe.mg", type: "text" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as OrgStatus })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="pending">En attente</option>
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
              {formError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                {modal === "add" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-lg font-bold font-display text-center mb-2">Supprimer cet organisateur ?</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              <strong>{deleteTarget.name}</strong> ({deleteTarget.company}) sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteTarget)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
