"use client";
import { ORGANIZERS } from "@/lib/mock-data";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  organisateur: { label: "Organisateur", color: "hsl(145 55% 40%)" },
  agent_vente: { label: "Agent de vente", color: "hsl(210 80% 50%)" },
  agent_scan: { label: "Agent de scan", color: "hsl(280 70% 55%)" },
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm">{ORGANIZERS.length} membres de l&apos;équipe</p>
        </div>
        <button className="px-4 py-2 rounded-xl text-black font-bold text-sm hover:opacity-90 transition-all"
          style={{ background: "hsl(145 55% 40%)" }}>
          + Ajouter un membre
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                {["Membre", "Email", "Téléphone", "Rôle", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ORGANIZERS.map((o) => {
                const role = ROLE_LABELS[o.role] ?? { label: o.role, color: "hsl(145 55% 40%)" };
                return (
                  <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0"
                          style={{ background: role.color }}>
                          {o.name[0]}
                        </div>
                        <p className="font-semibold text-sm">{o.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{o.email}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{o.phone}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        style={{ background: `${role.color}18`, color: role.color, borderColor: `${role.color}44` }}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-xs text-muted-foreground hover:text-white transition-colors">Modifier</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
