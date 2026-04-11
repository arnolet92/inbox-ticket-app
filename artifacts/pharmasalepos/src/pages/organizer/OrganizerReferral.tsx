import React, { useMemo } from "react";
import { Copy, Sparkles, TrendingUp, Users, ShieldCheck, ArrowRight, BadgePercent, Coins, Target, Activity, Star, Zap } from "lucide-react";
import { OrganizerLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";
import { useOrganizer } from "@/context/OrganizerContext";
import { STATIC_EVENTS } from "@/data/static";
import { formatMGA } from "@/lib/utils";

export default function OrganizerReferral() {
  const { organizer } = useOrganizer();
  const code = organizer?.id ? `ORG-${String(organizer.id).toUpperCase()}` : "ORG-INVITE";
  const organizerEvents = useMemo(
    () => STATIC_EVENTS.filter(e => !organizer?.id || e.organizerId === organizer.id || organizer.id === "admin"),
    [organizer?.id]
  );
  const totalRevenue = organizerEvents.reduce((sum, e) => sum + (e.soldTickets * (e.ticketTypes?.[0]?.price ?? 0)), 0);
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/organizer/login?ref=${encodeURIComponent(code)}`;
  const referralEarnings = Math.round(totalRevenue * 0.0025);
  const inviteCount = organizerEvents.length ? Math.max(1, Math.round(organizerEvents.length / 2)) : 0;
  const conversionRate = organizerEvents.length ? Math.min(42, 18 + organizerEvents.length * 2) : 0;
  const topEvent = organizerEvents[0];

  return (
    <OrganizerLayout>
      <div className="space-y-6 animate-[fadeInUp_700ms_ease-out]">
        <Card className="relative overflow-hidden border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,rgba(3,7,18,0.98),rgba(9,12,22,0.92))] shadow-2xl shadow-emerald-950/20 p-6 md:p-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-violet-400/10 blur-3xl animate-pulse [animation-delay:1.2s]" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-xs font-semibold uppercase tracking-[0.18em]">
                <Sparkles className="w-3.5 h-3.5" /> Programme de parrainage
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
                  Recommandez un organisateur. Générez une commission durable.
                </h1>
                <p className="mt-4 text-sm md:text-[15px] text-muted-foreground leading-7 max-w-2xl">
                  Partagez votre lien personnel pour inviter un autre organisateur à rejoindre InBox.
                  Dès qu’il publie des événements et réalise du chiffre d’affaires, vous percevez <span className="text-white font-semibold">0.25%</span> de ses revenus.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="accent" onClick={() => navigator.clipboard?.writeText(referralLink)}>
                  <Copy className="w-4 h-4 mr-2" /> Copier le lien
                </Button>
                <Button variant="outline" className="border-white/10 text-muted-foreground">
                  <ArrowRight className="w-4 h-4 mr-2" /> Partager maintenant
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-500/20">Lien actif</Badge>
                <Badge className="bg-violet-500/15 text-violet-200 border-violet-500/20">Commission 0.25%</Badge>
                <Badge className="bg-blue-500/15 text-blue-200 border-blue-500/20">Organisateur premium</Badge>
              </div>
            </div>

            <div className="w-full lg:w-[360px] rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                <BadgePercent className="w-4 h-4 text-violet-300" /> Votre lien
              </div>
              <div className="font-mono text-xs text-emerald-300 break-all leading-6 bg-black/40 border border-emerald-500/10 rounded-2xl p-4">
                {referralLink}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl p-4 bg-emerald-500/8 border border-emerald-500/15">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Commission</div>
                  <div className="text-2xl font-display font-bold text-emerald-300 mt-1">0.25%</div>
                </div>
                <div className="rounded-2xl p-4 bg-violet-500/8 border border-violet-500/15">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Mode</div>
                  <div className="text-sm font-semibold text-white mt-2">Récurrent</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5 bg-white/3 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-300"><Coins className="w-5 h-5" /></div>
              <Star className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="text-xs text-muted-foreground">CA total estimé</div>
            <div className="text-2xl font-display font-bold text-white mt-1">{formatMGA(totalRevenue)}</div>
          </Card>
          <Card className="p-5 bg-white/3 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-300"><Activity className="w-5 h-5" /></div>
              <Zap className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-xs text-muted-foreground">Gains parrain</div>
            <div className="text-2xl font-display font-bold text-violet-300 mt-1">{formatMGA(referralEarnings)}</div>
          </Card>
          <Card className="p-5 bg-white/3 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-300"><Users className="w-5 h-5" /></div>
              <Badge className="bg-blue-500/15 text-blue-200 border-blue-500/20">Invite</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Événements actifs</div>
            <div className="text-2xl font-display font-bold text-white mt-1">{organizerEvents.length}</div>
          </Card>
          <Card className="p-5 bg-white/3 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-300"><Target className="w-5 h-5" /></div>
              <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-500/20">Perf</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Taux estimé</div>
            <div className="text-2xl font-display font-bold text-white mt-1">{conversionRate}%</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5 bg-white/3 border border-white/8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Invitation simple</div>
                <div className="text-xs text-muted-foreground">Un lien, un nouvel organisateur</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-6">Créez une acquisition organique haut de gamme, sans friction ni codes compliqués.</p>
          </Card>
          <Card className="p-5 bg-white/3 border border-white/8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Revenu additionnel</div>
                <div className="text-xs text-muted-foreground">Commission sur les ventes générées</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-6">Si l’organisateur invité vend des billets, vous touchez automatiquement votre part sur son chiffre d’affaires.</p>
          </Card>
          <Card className="p-5 bg-white/3 border border-white/8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Position premium</div>
                <div className="text-xs text-muted-foreground">Réseau, confiance et croissance</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-6">Un levier stratégique pour faire grandir votre réseau tout en valorisant vos recommandations.</p>
          </Card>
        </div>

        <Card className="p-6 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(8,15,25,0.92))] border border-emerald-500/15">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="text-sm font-semibold text-white">Aperçu de votre activité</div>
              <div className="text-xs text-muted-foreground mt-1">Données dynamiques basées sur vos événements actuels</div>
            </div>
            {topEvent && <Badge className="bg-black/40 text-emerald-200 border border-emerald-500/20">{topEvent.title}</Badge>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-black/25 border border-white/5">
              <div className="text-xs text-muted-foreground">Ligne de performance</div>
              <div className="text-lg font-bold text-white mt-1">{organizerEvents.length ? "Croissance continue" : "En attente de vos premiers événements"}</div>
              <div className="text-sm text-muted-foreground mt-2">Chaque billet vendu augmente votre base de commission.</div>
            </div>
            <div className="rounded-2xl p-4 bg-black/25 border border-white/5">
              <div className="text-xs text-muted-foreground">Recommandation</div>
              <div className="text-lg font-bold text-white mt-1">Partagez votre lien dans vos canaux privés</div>
              <div className="text-sm text-muted-foreground mt-2">WhatsApp, réseaux sociaux, partenaires et ambassadeurs.</div>
            </div>
            <div className="rounded-2xl p-4 bg-black/25 border border-white/5">
              <div className="text-xs text-muted-foreground">Objectif</div>
              <div className="text-lg font-bold text-white mt-1">Créer un réseau d’organisateurs rentables</div>
              <div className="text-sm text-muted-foreground mt-2">Plus ils vendent, plus votre parrainage devient fort.</div>
            </div>
          </div>
        </Card>
      </div>
    </OrganizerLayout>
  );
}