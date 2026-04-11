import React, { useState, useRef, useEffect } from "react";
import { AdminLayout } from "@/components/layout";
import {
  Building2, Upload, Phone, Mail, Globe, CheckCircle,
  Instagram, Youtube, Facebook, MessageCircle, Hash,
  FileText, Briefcase, Camera, X, Save, AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "inbox_company_info";

type TikTokIcon = React.FC<{ className?: string }>;
const TikTokIcon: TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.07a8.16 8.16 0 004.77 1.52V7.15a4.85 4.85 0 01-1-.46z"/>
  </svg>
);

type CompanyInfo = {
  logoUrl: string;
  name: string;
  whatsapp: string;
  facebook: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  phone: string;
  email: string;
  nif: string;
  stat: string;
  rcs: string;
};

const DEFAULT: CompanyInfo = {
  logoUrl: "", name: "InBox Ticket", whatsapp: "", facebook: "",
  youtube: "", instagram: "", tiktok: "", phone: "", email: "",
  nif: "", stat: "", rcs: "",
};

function loadInfo(): CompanyInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch { return DEFAULT; }
}

const GLASS = {
  background: "hsl(150 15% 6%)",
  border: "1px solid hsl(145 60% 22% / 0.45)",
  boxShadow: "0 0 0 1px hsl(145 40% 18% / 0.15), 0 8px 32px hsl(150 20% 4% / 0.6)",
};

const INPUT_STYLE: React.CSSProperties = {
  background: "hsl(145 20% 9%)",
  border: "1px solid hsl(145 40% 16%)",
  borderRadius: "12px",
  color: "white",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  fontSize: "14px",
  transition: "border-color 0.2s",
};

function Field({
  label, icon: Icon, value, onChange, placeholder, type = "text", color = "hsl(145 60% 55%)",
}: {
  label: string; icon: React.FC<{ className?: string }>;
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; color?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(145 25% 45%)" }}>
        {label}
      </label>
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: focused ? color : "hsl(145 20% 35%)", transition: "color 0.2s" }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...INPUT_STYLE,
            paddingLeft: "38px",
            borderColor: focused ? "hsl(145 60% 28%)" : "hsl(145 40% 16%)",
          }}
        />
      </div>
    </div>
  );
}

export default function AdminCompanyInfo() {
  const [info, setInfo] = useState<CompanyInfo>(loadInfo);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(loadInfo().logoUrl);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof CompanyInfo) => (val: string) =>
    setInfo((prev) => ({ ...prev, [key]: val }));

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setLogoPreview(url);
      setInfo((prev) => ({ ...prev, logoUrl: url }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  }

  const section = (title: string, icon: React.ReactNode, children: React.ReactNode, accent = "hsl(145 60% 55%)") => (
    <div
      className="rounded-2xl p-6"
      style={GLASS}
    >
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid hsl(145 40% 14%)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <h2 className="font-bold text-white text-base tracking-wide">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      {/* Saved toast */}
      <div
        className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-500"
        style={{
          background: "hsl(145 50% 10%)",
          border: "1px solid hsl(145 60% 28% / 0.6)",
          color: "hsl(145 70% 60%)",
          boxShadow: "0 0 24px hsl(145 60% 30% / 0.3)",
          opacity: saved ? 1 : 0,
          transform: saved ? "translateY(0)" : "translateY(-16px)",
          pointerEvents: "none",
        }}
      >
        <CheckCircle className="w-4 h-4" />
        Informations sauvegardées avec succès
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "hsl(145 60% 18%)", border: "1px solid hsl(145 60% 28% / 0.5)" }}
          >
            <Building2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Informations Entreprise</h1>
            <p className="text-muted-foreground text-sm">Identité, contacts et présence en ligne</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">

        {/* ── Logo + Nom ── */}
        <div className="rounded-2xl p-6" style={GLASS}>
          <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid hsl(145 40% 14%)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(145 60% 18%)", border: "1px solid hsl(145 60% 28% / 0.4)" }}>
              <Camera className="w-4 h-4 text-accent" />
            </div>
            <h2 className="font-bold text-white text-base tracking-wide">Identité visuelle</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div
                className="relative w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group transition-all duration-200"
                style={{
                  background: dragOver ? "hsl(145 40% 12%)" : "hsl(145 20% 8%)",
                  border: dragOver
                    ? "2px dashed hsl(145 60% 45%)"
                    : "2px dashed hsl(145 40% 20%)",
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-3">
                    <Upload className="w-7 h-7" style={{ color: "hsl(145 40% 35%)" }} />
                    <span className="text-[10px]" style={{ color: "hsl(145 25% 40%)" }}>Cliquez ou glissez</span>
                  </div>
                )}
              </div>
              {logoPreview && (
                <button
                  onClick={() => { setLogoPreview(""); setInfo((p) => ({ ...p, logoUrl: "" })); }}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-3 h-3" /> Supprimer
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            {/* Nom entreprise */}
            <div className="flex-1 w-full">
              <Field
                label="Nom de l'entreprise"
                icon={Briefcase}
                value={info.name}
                onChange={set("name")}
                placeholder="InBox Ticket"
              />
              <p className="text-xs mt-3 leading-relaxed" style={{ color: "hsl(145 20% 35%)" }}>
                Le logo accepte les formats PNG, JPG et SVG. Taille recommandée : 512×512 px.<br />
                Le nom apparaîtra sur les billets et reçus.
              </p>
            </div>
          </div>
        </div>

        {/* ── Réseaux sociaux ── */}
        {section(
          "Réseaux sociaux",
          <Globe className="w-4 h-4" />,
          <>
            <Field label="WhatsApp" icon={MessageCircle} value={info.whatsapp} onChange={set("whatsapp")} placeholder="+261 34 XX XXX XX" color="hsl(142 70% 50%)" />
            <Field label="Facebook" icon={Facebook} value={info.facebook} onChange={set("facebook")} placeholder="facebook.com/inbox-ticket" color="hsl(221 83% 60%)" />
            <Field label="Instagram" icon={Instagram} value={info.instagram} onChange={set("instagram")} placeholder="@inbox_ticket" color="hsl(330 80% 60%)" />
            <Field label="YouTube" icon={Youtube} value={info.youtube} onChange={set("youtube")} placeholder="youtube.com/@inbox" color="hsl(0 90% 55%)" />
            <div className="sm:col-span-1">
              <Field label="TikTok" icon={TikTokIcon} value={info.tiktok} onChange={set("tiktok")} placeholder="@inbox_ticket" color="hsl(180 80% 55%)" />
            </div>
          </>,
          "hsl(221 83% 60%)"
        )}

        {/* ── Contacts ── */}
        {section(
          "Coordonnées",
          <Phone className="w-4 h-4" />,
          <>
            <Field label="Téléphone" icon={Phone} value={info.phone} onChange={set("phone")} placeholder="+261 34 XX XXX XX" type="tel" />
            <Field label="Email" icon={Mail} value={info.email} onChange={set("email")} placeholder="contact@inbox-ticket.mg" type="email" color="hsl(39 90% 60%)" />
          </>,
          "hsl(39 90% 60%)"
        )}

        {/* ── Informations légales ── */}
        {section(
          "Informations légales",
          <FileText className="w-4 h-4" />,
          <>
            <Field label="NIF" icon={Hash} value={info.nif} onChange={set("nif")} placeholder="000 000 000" color="hsl(270 60% 60%)" />
            <Field label="STAT" icon={Hash} value={info.stat} onChange={set("stat")} placeholder="00 00 000 000 0000" color="hsl(270 60% 60%)" />
            <Field label="RCS" icon={Hash} value={info.rcs} onChange={set("rcs")} placeholder="RCS Antananarivo 00000" color="hsl(270 60% 60%)" />
          </>,
          "hsl(270 60% 60%)"
        )}

        {/* ── Save button ── */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, hsl(145 70% 28%), hsl(145 60% 22%))",
              border: "1px solid hsl(145 60% 32% / 0.7)",
              color: "hsl(145 80% 70%)",
              boxShadow: "0 0 20px hsl(145 60% 20% / 0.4), 0 4px 12px hsl(150 20% 4% / 0.6)",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 32px hsl(145 60% 30% / 0.6), 0 4px 16px hsl(150 20% 4% / 0.6)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px hsl(145 60% 20% / 0.4), 0 4px 12px hsl(150 20% 4% / 0.6)";
            }}
          >
            <Save className="w-4 h-4" />
            Sauvegarder les informations
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
