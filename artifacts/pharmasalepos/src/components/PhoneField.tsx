import React, { useState, useEffect, useRef, useMemo } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Search } from "lucide-react";

// ─── Country list ───────────────────────────────────────────────────────────
export type Country = {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
  dial: string;   // e.g. "+261"
  flag: string;   // emoji
  pattern: RegExp; // digits only (after dial code)
  example: string; // human-readable
};

export const COUNTRIES: Country[] = [
  // Africa
  { code: "MG", name: "Madagascar",          dial: "+261", flag: "🇲🇬", pattern: /^\d{9}$/,   example: "34 00 000 00" },
  { code: "DZ", name: "Algérie",             dial: "+213", flag: "🇩🇿", pattern: /^\d{9}$/,   example: "600 000 000" },
  { code: "AO", name: "Angola",              dial: "+244", flag: "🇦🇴", pattern: /^\d{9}$/,   example: "923 000 000" },
  { code: "BJ", name: "Bénin",               dial: "+229", flag: "🇧🇯", pattern: /^\d{8}$/,   example: "90 000 000" },
  { code: "BW", name: "Botswana",            dial: "+267", flag: "🇧🇼", pattern: /^\d{8}$/,   example: "71 000 000" },
  { code: "BF", name: "Burkina Faso",        dial: "+226", flag: "🇧🇫", pattern: /^\d{8}$/,   example: "70 000 000" },
  { code: "CM", name: "Cameroun",            dial: "+237", flag: "🇨🇲", pattern: /^\d{9}$/,   example: "670 000 000" },
  { code: "CV", name: "Cap-Vert",            dial: "+238", flag: "🇨🇻", pattern: /^\d{7}$/,   example: "9910 000" },
  { code: "CF", name: "Centrafrique",        dial: "+236", flag: "🇨🇫", pattern: /^\d{8}$/,   example: "70 000 000" },
  { code: "KM", name: "Comores",             dial: "+269", flag: "🇰🇲", pattern: /^\d{7}$/,   example: "321 0000" },
  { code: "CG", name: "Congo",               dial: "+242", flag: "🇨🇬", pattern: /^\d{9}$/,   example: "060 000 000" },
  { code: "CD", name: "Congo (RDC)",         dial: "+243", flag: "🇨🇩", pattern: /^\d{9}$/,   example: "817 000 000" },
  { code: "CI", name: "Côte d'Ivoire",       dial: "+225", flag: "🇨🇮", pattern: /^\d{10}$/,  example: "0700 000 000" },
  { code: "DJ", name: "Djibouti",            dial: "+253", flag: "🇩🇯", pattern: /^\d{8}$/,   example: "77 000 000" },
  { code: "EG", name: "Égypte",              dial: "+20",  flag: "🇪🇬", pattern: /^\d{10}$/,  example: "1000 000 000" },
  { code: "GQ", name: "Guinée équatoriale",  dial: "+240", flag: "🇬🇶", pattern: /^\d{9}$/,   example: "222 000 000" },
  { code: "ER", name: "Érythrée",            dial: "+291", flag: "🇪🇷", pattern: /^\d{7}$/,   example: "712 3456" },
  { code: "ET", name: "Éthiopie",            dial: "+251", flag: "🇪🇹", pattern: /^\d{9}$/,   example: "911 000 000" },
  { code: "GA", name: "Gabon",               dial: "+241", flag: "🇬🇦", pattern: /^\d{7,8}$/, example: "06 000 000" },
  { code: "GM", name: "Gambie",              dial: "+220", flag: "🇬🇲", pattern: /^\d{7}$/,   example: "301 2345" },
  { code: "GH", name: "Ghana",               dial: "+233", flag: "🇬🇭", pattern: /^\d{9}$/,   example: "200 000 000" },
  { code: "GN", name: "Guinée",              dial: "+224", flag: "🇬🇳", pattern: /^\d{9}$/,   example: "620 000 000" },
  { code: "GW", name: "Guinée-Bissau",       dial: "+245", flag: "🇬🇼", pattern: /^\d{9}$/,   example: "955 000 000" },
  { code: "KE", name: "Kenya",               dial: "+254", flag: "🇰🇪", pattern: /^\d{9}$/,   example: "712 000 000" },
  { code: "LS", name: "Lesotho",             dial: "+266", flag: "🇱🇸", pattern: /^\d{8}$/,   example: "50 000 000" },
  { code: "LR", name: "Libéria",             dial: "+231", flag: "🇱🇷", pattern: /^\d{7,8}$/, example: "770 000 00" },
  { code: "LY", name: "Libye",               dial: "+218", flag: "🇱🇾", pattern: /^\d{9}$/,   example: "910 000 000" },
  { code: "ML", name: "Mali",                dial: "+223", flag: "🇲🇱", pattern: /^\d{8}$/,   example: "70 000 000" },
  { code: "MR", name: "Mauritanie",          dial: "+222", flag: "🇲🇷", pattern: /^\d{8}$/,   example: "20 00 00 00" },
  { code: "MU", name: "Maurice",             dial: "+230", flag: "🇲🇺", pattern: /^\d{8}$/,   example: "5250 0000" },
  { code: "MA", name: "Maroc",               dial: "+212", flag: "🇲🇦", pattern: /^\d{9}$/,   example: "612 000 000" },
  { code: "MZ", name: "Mozambique",          dial: "+258", flag: "🇲🇿", pattern: /^\d{9}$/,   example: "821 000 000" },
  { code: "NA", name: "Namibie",             dial: "+264", flag: "🇳🇦", pattern: /^\d{9}$/,   example: "811 000 000" },
  { code: "NE", name: "Niger",               dial: "+227", flag: "🇳🇪", pattern: /^\d{8}$/,   example: "90 000 000" },
  { code: "NG", name: "Nigéria",             dial: "+234", flag: "🇳🇬", pattern: /^\d{10}$/,  example: "8000 000 000" },
  { code: "RW", name: "Rwanda",              dial: "+250", flag: "🇷🇼", pattern: /^\d{9}$/,   example: "780 000 000" },
  { code: "ST", name: "São Tomé",            dial: "+239", flag: "🇸🇹", pattern: /^\d{7}$/,   example: "990 0000" },
  { code: "SN", name: "Sénégal",             dial: "+221", flag: "🇸🇳", pattern: /^\d{9}$/,   example: "770 000 000" },
  { code: "SC", name: "Seychelles",          dial: "+248", flag: "🇸🇨", pattern: /^\d{7}$/,   example: "250 0000" },
  { code: "SL", name: "Sierra Leone",        dial: "+232", flag: "🇸🇱", pattern: /^\d{8}$/,   example: "76 000 000" },
  { code: "SO", name: "Somalie",             dial: "+252", flag: "🇸🇴", pattern: /^\d{8,9}$/, example: "900 000 000" },
  { code: "ZA", name: "Afrique du Sud",      dial: "+27",  flag: "🇿🇦", pattern: /^\d{9}$/,   example: "710 000 000" },
  { code: "SS", name: "Soudan du Sud",       dial: "+211", flag: "🇸🇸", pattern: /^\d{9}$/,   example: "977 000 000" },
  { code: "SD", name: "Soudan",              dial: "+249", flag: "🇸🇩", pattern: /^\d{9}$/,   example: "912 000 000" },
  { code: "TZ", name: "Tanzanie",            dial: "+255", flag: "🇹🇿", pattern: /^\d{9}$/,   example: "621 000 000" },
  { code: "TD", name: "Tchad",               dial: "+235", flag: "🇹🇩", pattern: /^\d{8}$/,   example: "60 000 000" },
  { code: "TG", name: "Togo",                dial: "+228", flag: "🇹🇬", pattern: /^\d{8}$/,   example: "90 000 000" },
  { code: "TN", name: "Tunisie",             dial: "+216", flag: "🇹🇳", pattern: /^\d{8}$/,   example: "20 000 000" },
  { code: "UG", name: "Ouganda",             dial: "+256", flag: "🇺🇬", pattern: /^\d{9}$/,   example: "700 000 000" },
  { code: "ZM", name: "Zambie",              dial: "+260", flag: "🇿🇲", pattern: /^\d{9}$/,   example: "955 000 000" },
  { code: "ZW", name: "Zimbabwe",            dial: "+263", flag: "🇿🇼", pattern: /^\d{9}$/,   example: "712 000 000" },
  // Europe
  { code: "FR", name: "France",              dial: "+33",  flag: "🇫🇷", pattern: /^\d{9}$/,   example: "6 12 34 56 78" },
  { code: "BE", name: "Belgique",            dial: "+32",  flag: "🇧🇪", pattern: /^\d{8,9}$/, example: "470 000 000" },
  { code: "CH", name: "Suisse",              dial: "+41",  flag: "🇨🇭", pattern: /^\d{9}$/,   example: "78 000 00 00" },
  { code: "DE", name: "Allemagne",           dial: "+49",  flag: "🇩🇪", pattern: /^\d{10,11}$/,example: "1512 3456789" },
  { code: "GB", name: "Royaume-Uni",         dial: "+44",  flag: "🇬🇧", pattern: /^\d{10}$/,  example: "7911 123456" },
  { code: "ES", name: "Espagne",             dial: "+34",  flag: "🇪🇸", pattern: /^\d{9}$/,   example: "612 000 000" },
  { code: "IT", name: "Italie",              dial: "+39",  flag: "🇮🇹", pattern: /^\d{9,10}$/, example: "312 000 0000" },
  { code: "PT", name: "Portugal",            dial: "+351", flag: "🇵🇹", pattern: /^\d{9}$/,   example: "912 000 000" },
  { code: "LU", name: "Luxembourg",          dial: "+352", flag: "🇱🇺", pattern: /^\d{8,9}$/, example: "621 000 000" },
  { code: "NL", name: "Pays-Bas",            dial: "+31",  flag: "🇳🇱", pattern: /^\d{9}$/,   example: "612 000 000" },
  // Americas
  { code: "US", name: "États-Unis",          dial: "+1",   flag: "🇺🇸", pattern: /^\d{10}$/,  example: "201 000 0000" },
  { code: "CA", name: "Canada",              dial: "+1",   flag: "🇨🇦", pattern: /^\d{10}$/,  example: "416 000 0000" },
  { code: "MX", name: "Mexique",             dial: "+52",  flag: "🇲🇽", pattern: /^\d{10}$/,  example: "55 1234 5678" },
  { code: "BR", name: "Brésil",              dial: "+55",  flag: "🇧🇷", pattern: /^\d{10,11}$/, example: "11 91234 5678" },
  // Asia & Oceania
  { code: "CN", name: "Chine",               dial: "+86",  flag: "🇨🇳", pattern: /^\d{11}$/,  example: "131 0000 0000" },
  { code: "IN", name: "Inde",                dial: "+91",  flag: "🇮🇳", pattern: /^\d{10}$/,  example: "9800 000 000" },
  { code: "JP", name: "Japon",               dial: "+81",  flag: "🇯🇵", pattern: /^\d{10}$/,  example: "90 0000 0000" },
  { code: "AU", name: "Australie",           dial: "+61",  flag: "🇦🇺", pattern: /^\d{9}$/,   example: "412 000 000" },
  { code: "AE", name: "Émirats arabes",      dial: "+971", flag: "🇦🇪", pattern: /^\d{9}$/,   example: "501 000 000" },
  { code: "RE", name: "La Réunion",          dial: "+262", flag: "🇷🇪", pattern: /^\d{9}$/,   example: "692 000 000" },
  { code: "YT", name: "Mayotte",             dial: "+262", flag: "🇾🇹", pattern: /^\d{9}$/,   example: "639 000 000" },
];

// ─── Timezone → country code ─────────────────────────────────────────────────
const TZ_MAP: Record<string, string> = {
  "Indian/Antananarivo": "MG",
  "Africa/Nairobi": "KE", "Africa/Lagos": "NG", "Africa/Abidjan": "CI",
  "Africa/Dakar": "SN", "Africa/Douala": "CM", "Africa/Accra": "GH",
  "Africa/Bamako": "ML", "Africa/Conakry": "GN", "Africa/Ouagadougou": "BF",
  "Africa/Libreville": "GA", "Africa/Malabo": "GQ", "Africa/Casablanca": "MA",
  "Africa/Tunis": "TN", "Africa/Tripoli": "LY", "Africa/Cairo": "EG",
  "Africa/Johannesburg": "ZA", "Africa/Maputo": "MZ", "Africa/Harare": "ZW",
  "Africa/Lusaka": "ZM", "Africa/Dar_es_Salaam": "TZ", "Africa/Kampala": "UG",
  "Africa/Addis_Ababa": "ET", "Africa/Asmara": "ER", "Africa/Khartoum": "SD",
  "Africa/Mogadishu": "SO", "Africa/Djibouti": "DJ", "Africa/Kigali": "RW",
  "Africa/Bujumbura": "BI", "Africa/Lubumbashi": "CD", "Africa/Brazzaville": "CG",
  "Africa/Bangui": "CF", "Africa/Ndjamena": "TD", "Africa/Niamey": "NE",
  "Africa/Porto-Novo": "BJ", "Africa/Lome": "TG", "Africa/Windhoek": "NA",
  "Africa/Maseru": "LS", "Africa/Mbabane": "SZ", "Africa/Gaborone": "BW",
  "Indian/Mauritius": "MU", "Indian/Reunion": "RE", "Indian/Mayotte": "YT",
  "Indian/Comoro": "KM",
  "Europe/Paris": "FR", "Europe/Brussels": "BE", "Europe/Zurich": "CH",
  "Europe/London": "GB", "Europe/Berlin": "DE", "Europe/Madrid": "ES",
  "Europe/Rome": "IT", "Europe/Lisbon": "PT", "Europe/Luxembourg": "LU",
  "Europe/Amsterdam": "NL",
  "America/New_York": "US", "America/Chicago": "US", "America/Los_Angeles": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/Sao_Paulo": "BR", "America/Mexico_City": "MX",
  "Asia/Dubai": "AE", "Asia/Shanghai": "CN", "Asia/Kolkata": "IN",
  "Asia/Tokyo": "JP", "Australia/Sydney": "AU",
};

function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_MAP[tz]) return TZ_MAP[tz];
    // partial match
    const entry = Object.entries(TZ_MAP).find(([key]) => tz.startsWith(key.split("/")[0]));
    return entry ? entry[1] : "MG";
  } catch { return "MG"; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function buildFullPhone(dial: string, digits: string) {
  const clean = digits.replace(/\D/g, "");
  return clean ? `${dial}${clean}` : "";
}

export function validatePhone(country: Country, digits: string): string | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "Le numéro de téléphone est requis.";
  if (!country.pattern.test(clean))
    return `Numéro invalide pour ${country.name} (ex : ${country.example}).`;
  return null;
}

// ─── PhoneField component ─────────────────────────────────────────────────────
type Props = {
  value: string;            // raw digits typed by user
  countryCode: string;      // ISO code e.g. "MG"
  onChange: (digits: string, countryCode: string, fullPhone: string) => void;
  error?: string;
  required?: boolean;
};

export function PhoneField({ value, countryCode, onChange, error, required }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];

  const filtered = useMemo(() =>
    COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  function selectCountry(c: Country) {
    setOpen(false);
    onChange(value, c.code, buildFullPhone(c.dial, value));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    // allow digits, spaces, dashes only
    const raw = e.target.value.replace(/[^\d\s\-]/g, "");
    onChange(raw, countryCode, buildFullPhone(country.dial, raw));
  }

  const isValid = value && !error && country.pattern.test(value.replace(/\D/g, ""));

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        Numéro de téléphone{required && <span className="text-accent ml-1">*</span>}
      </label>

      <div
        className="flex rounded-xl overflow-visible border transition-all duration-200"
        style={{
          borderColor: error
            ? "rgba(239,68,68,0.7)"
            : focused
            ? "hsl(145 60% 35%)"
            : "hsl(var(--border))",
          boxShadow: focused && !error ? "0 0 0 2px hsl(145 60% 35% / 0.2)" : "none",
        }}
      >
        {/* ── Country picker ── */}
        <div className="relative" ref={dropRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-3 rounded-l-xl h-full border-r bg-background/60 hover:bg-muted/30 transition-colors focus:outline-none"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <span className="text-lg leading-none">{country.flag}</span>
            <span className="text-sm font-mono font-semibold text-foreground/80">{country.dial}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div
              className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                background: "hsl(150 15% 6%)",
                borderColor: "hsl(145 40% 18%)",
                boxShadow: "0 20px 60px hsl(150 20% 4% / 0.8)",
              }}
            >
              {/* Search */}
              <div className="p-3 border-b" style={{ borderColor: "hsl(145 30% 12%)" }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un pays..."
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl outline-none"
                    style={{
                      background: "hsl(145 20% 9%)",
                      border: "1px solid hsl(145 30% 14%)",
                      color: "white",
                    }}
                  />
                </div>
              </div>

              {/* List */}
              <div className="max-h-56 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-6">Aucun résultat</p>
                )}
                {filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => selectCountry(c)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors"
                    style={{
                      background: c.code === countryCode ? "hsl(145 40% 10%)" : "transparent",
                      color: c.code === countryCode ? "hsl(145 70% 60%)" : "hsl(var(--foreground))",
                    }}
                    onMouseOver={(e) => {
                      if (c.code !== countryCode)
                        (e.currentTarget as HTMLButtonElement).style.background = "hsl(145 20% 9%)";
                    }}
                    onMouseOut={(e) => {
                      if (c.code !== countryCode)
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-xs text-muted-foreground shrink-0">{c.dial}</span>
                    {c.code === countryCode && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Number input ── */}
        <div className="flex-1 relative">
          <input
            type="tel"
            value={value}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={country.example}
            className="w-full h-full px-4 py-3 bg-background/60 rounded-r-xl outline-none text-sm"
            style={{ color: "hsl(var(--foreground))" }}
          />
          {isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
      {!error && value && isValid && (
        <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 shrink-0" /> Numéro valide
        </p>
      )}
    </div>
  );
}

// ─── Hook: initial country from timezone ─────────────────────────────────────
export function useDetectedCountry() {
  const code = useMemo(() => detectCountry(), []);
  return code;
}
