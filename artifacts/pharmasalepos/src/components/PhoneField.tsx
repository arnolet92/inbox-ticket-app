import React, { useState, useEffect, useRef, useMemo } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Search } from "lucide-react";

// ─── Country list ────────────────────────────────────────────────────────────
export type Country = {
  code: string;
  name: string;
  dial: string;
  flag: string;
  pattern: RegExp;
  example: string;
};

export const COUNTRIES: Country[] = [
  // Africa (priority)
  { code: "MG", name: "Madagascar",          dial: "+261", flag: "🇲🇬", pattern: /^\d{9}$/,    example: "34 000 0000" },
  { code: "RE", name: "La Réunion",          dial: "+262", flag: "🇷🇪", pattern: /^\d{9}$/,    example: "692 000 000" },
  { code: "YT", name: "Mayotte",             dial: "+262", flag: "🇾🇹", pattern: /^\d{9}$/,    example: "639 000 000" },
  { code: "KM", name: "Comores",             dial: "+269", flag: "🇰🇲", pattern: /^\d{7}$/,    example: "321 0000" },
  { code: "MU", name: "Maurice",             dial: "+230", flag: "🇲🇺", pattern: /^\d{8}$/,    example: "5250 0000" },
  { code: "SC", name: "Seychelles",          dial: "+248", flag: "🇸🇨", pattern: /^\d{7}$/,    example: "250 0000" },
  { code: "DZ", name: "Algérie",             dial: "+213", flag: "🇩🇿", pattern: /^\d{9}$/,    example: "600 000 000" },
  { code: "AO", name: "Angola",              dial: "+244", flag: "🇦🇴", pattern: /^\d{9}$/,    example: "923 000 000" },
  { code: "BJ", name: "Bénin",               dial: "+229", flag: "🇧🇯", pattern: /^\d{8}$/,    example: "90 000 000" },
  { code: "BW", name: "Botswana",            dial: "+267", flag: "🇧🇼", pattern: /^\d{8}$/,    example: "71 000 000" },
  { code: "BF", name: "Burkina Faso",        dial: "+226", flag: "🇧🇫", pattern: /^\d{8}$/,    example: "70 000 000" },
  { code: "CM", name: "Cameroun",            dial: "+237", flag: "🇨🇲", pattern: /^\d{9}$/,    example: "670 000 000" },
  { code: "CV", name: "Cap-Vert",            dial: "+238", flag: "🇨🇻", pattern: /^\d{7}$/,    example: "991 0000" },
  { code: "CF", name: "Centrafrique",        dial: "+236", flag: "🇨🇫", pattern: /^\d{8}$/,    example: "70 000 000" },
  { code: "CG", name: "Congo",               dial: "+242", flag: "🇨🇬", pattern: /^\d{9}$/,    example: "060 000 000" },
  { code: "CD", name: "Congo (RDC)",         dial: "+243", flag: "🇨🇩", pattern: /^\d{9}$/,    example: "817 000 000" },
  { code: "CI", name: "Côte d'Ivoire",       dial: "+225", flag: "🇨🇮", pattern: /^\d{10}$/,   example: "0700 000 000" },
  { code: "DJ", name: "Djibouti",            dial: "+253", flag: "🇩🇯", pattern: /^\d{8}$/,    example: "77 000 000" },
  { code: "EG", name: "Égypte",              dial: "+20",  flag: "🇪🇬", pattern: /^\d{10}$/,   example: "1000 000 000" },
  { code: "GQ", name: "Guinée équatoriale",  dial: "+240", flag: "🇬🇶", pattern: /^\d{9}$/,    example: "222 000 000" },
  { code: "ER", name: "Érythrée",            dial: "+291", flag: "🇪🇷", pattern: /^\d{7}$/,    example: "712 3456" },
  { code: "ET", name: "Éthiopie",            dial: "+251", flag: "🇪🇹", pattern: /^\d{9}$/,    example: "911 000 000" },
  { code: "GA", name: "Gabon",               dial: "+241", flag: "🇬🇦", pattern: /^\d{7,8}$/,  example: "06 000 000" },
  { code: "GM", name: "Gambie",              dial: "+220", flag: "🇬🇲", pattern: /^\d{7}$/,    example: "301 2345" },
  { code: "GH", name: "Ghana",               dial: "+233", flag: "🇬🇭", pattern: /^\d{9}$/,    example: "200 000 000" },
  { code: "GN", name: "Guinée",              dial: "+224", flag: "🇬🇳", pattern: /^\d{9}$/,    example: "620 000 000" },
  { code: "GW", name: "Guinée-Bissau",       dial: "+245", flag: "🇬🇼", pattern: /^\d{9}$/,    example: "955 000 000" },
  { code: "KE", name: "Kenya",               dial: "+254", flag: "🇰🇪", pattern: /^\d{9}$/,    example: "712 000 000" },
  { code: "LS", name: "Lesotho",             dial: "+266", flag: "🇱🇸", pattern: /^\d{8}$/,    example: "50 000 000" },
  { code: "LR", name: "Libéria",             dial: "+231", flag: "🇱🇷", pattern: /^\d{7,8}$/,  example: "770 000 00" },
  { code: "LY", name: "Libye",               dial: "+218", flag: "🇱🇾", pattern: /^\d{9}$/,    example: "910 000 000" },
  { code: "ML", name: "Mali",                dial: "+223", flag: "🇲🇱", pattern: /^\d{8}$/,    example: "70 000 000" },
  { code: "MR", name: "Mauritanie",          dial: "+222", flag: "🇲🇷", pattern: /^\d{8}$/,    example: "20 00 00 00" },
  { code: "MA", name: "Maroc",               dial: "+212", flag: "🇲🇦", pattern: /^\d{9}$/,    example: "612 000 000" },
  { code: "MZ", name: "Mozambique",          dial: "+258", flag: "🇲🇿", pattern: /^\d{9}$/,    example: "821 000 000" },
  { code: "NA", name: "Namibie",             dial: "+264", flag: "🇳🇦", pattern: /^\d{9}$/,    example: "811 000 000" },
  { code: "NE", name: "Niger",               dial: "+227", flag: "🇳🇪", pattern: /^\d{8}$/,    example: "90 000 000" },
  { code: "NG", name: "Nigéria",             dial: "+234", flag: "🇳🇬", pattern: /^\d{10}$/,   example: "8000 000 000" },
  { code: "RW", name: "Rwanda",              dial: "+250", flag: "🇷🇼", pattern: /^\d{9}$/,    example: "780 000 000" },
  { code: "ST", name: "São Tomé",            dial: "+239", flag: "🇸🇹", pattern: /^\d{7}$/,    example: "990 0000" },
  { code: "SN", name: "Sénégal",             dial: "+221", flag: "🇸🇳", pattern: /^\d{9}$/,    example: "770 000 000" },
  { code: "SL", name: "Sierra Leone",        dial: "+232", flag: "🇸🇱", pattern: /^\d{8}$/,    example: "76 000 000" },
  { code: "SO", name: "Somalie",             dial: "+252", flag: "🇸🇴", pattern: /^\d{8,9}$/,  example: "900 000 000" },
  { code: "ZA", name: "Afrique du Sud",      dial: "+27",  flag: "🇿🇦", pattern: /^\d{9}$/,    example: "710 000 000" },
  { code: "SS", name: "Soudan du Sud",       dial: "+211", flag: "🇸🇸", pattern: /^\d{9}$/,    example: "977 000 000" },
  { code: "SD", name: "Soudan",              dial: "+249", flag: "🇸🇩", pattern: /^\d{9}$/,    example: "912 000 000" },
  { code: "TZ", name: "Tanzanie",            dial: "+255", flag: "🇹🇿", pattern: /^\d{9}$/,    example: "621 000 000" },
  { code: "TD", name: "Tchad",               dial: "+235", flag: "🇹🇩", pattern: /^\d{8}$/,    example: "60 000 000" },
  { code: "TG", name: "Togo",                dial: "+228", flag: "🇹🇬", pattern: /^\d{8}$/,    example: "90 000 000" },
  { code: "TN", name: "Tunisie",             dial: "+216", flag: "🇹🇳", pattern: /^\d{8}$/,    example: "20 000 000" },
  { code: "UG", name: "Ouganda",             dial: "+256", flag: "🇺🇬", pattern: /^\d{9}$/,    example: "700 000 000" },
  { code: "ZM", name: "Zambie",              dial: "+260", flag: "🇿🇲", pattern: /^\d{9}$/,    example: "955 000 000" },
  { code: "ZW", name: "Zimbabwe",            dial: "+263", flag: "🇿🇼", pattern: /^\d{9}$/,    example: "712 000 000" },
  // Europe
  { code: "FR", name: "France",              dial: "+33",  flag: "🇫🇷", pattern: /^\d{9}$/,    example: "6 12 34 56 78" },
  { code: "BE", name: "Belgique",            dial: "+32",  flag: "🇧🇪", pattern: /^\d{8,9}$/,  example: "470 000 000" },
  { code: "CH", name: "Suisse",              dial: "+41",  flag: "🇨🇭", pattern: /^\d{9}$/,    example: "78 000 00 00" },
  { code: "DE", name: "Allemagne",           dial: "+49",  flag: "🇩🇪", pattern: /^\d{10,11}$/, example: "1512 3456789" },
  { code: "GB", name: "Royaume-Uni",         dial: "+44",  flag: "🇬🇧", pattern: /^\d{10}$/,   example: "7911 123456" },
  { code: "ES", name: "Espagne",             dial: "+34",  flag: "🇪🇸", pattern: /^\d{9}$/,    example: "612 000 000" },
  { code: "IT", name: "Italie",              dial: "+39",  flag: "🇮🇹", pattern: /^\d{9,10}$/, example: "312 000 0000" },
  { code: "PT", name: "Portugal",            dial: "+351", flag: "🇵🇹", pattern: /^\d{9}$/,    example: "912 000 000" },
  { code: "LU", name: "Luxembourg",          dial: "+352", flag: "🇱🇺", pattern: /^\d{8,9}$/,  example: "621 000 000" },
  { code: "NL", name: "Pays-Bas",            dial: "+31",  flag: "🇳🇱", pattern: /^\d{9}$/,    example: "612 000 000" },
  // Americas
  { code: "US", name: "États-Unis",          dial: "+1",   flag: "🇺🇸", pattern: /^\d{10}$/,   example: "201 000 0000" },
  { code: "CA", name: "Canada",              dial: "+1",   flag: "🇨🇦", pattern: /^\d{10}$/,   example: "416 000 0000" },
  { code: "MX", name: "Mexique",             dial: "+52",  flag: "🇲🇽", pattern: /^\d{10}$/,   example: "55 1234 5678" },
  { code: "BR", name: "Brésil",              dial: "+55",  flag: "🇧🇷", pattern: /^\d{10,11}$/, example: "11 91234 5678" },
  // Asia & Oceania
  { code: "CN", name: "Chine",               dial: "+86",  flag: "🇨🇳", pattern: /^\d{11}$/,   example: "131 0000 0000" },
  { code: "IN", name: "Inde",                dial: "+91",  flag: "🇮🇳", pattern: /^\d{10}$/,   example: "9800 000 000" },
  { code: "JP", name: "Japon",               dial: "+81",  flag: "🇯🇵", pattern: /^\d{10}$/,   example: "90 0000 0000" },
  { code: "AU", name: "Australie",           dial: "+61",  flag: "🇦🇺", pattern: /^\d{9}$/,    example: "412 000 000" },
  { code: "AE", name: "Émirats arabes",      dial: "+971", flag: "🇦🇪", pattern: /^\d{9}$/,    example: "501 000 000" },
];

// ─── Timezone → country ───────────────────────────────────────────────────────
const TZ_MAP: Record<string, string> = {
  "Indian/Antananarivo": "MG", "Indian/Mauritius": "MU", "Indian/Reunion": "RE",
  "Indian/Mayotte": "YT", "Indian/Comoro": "KM",
  "Africa/Nairobi": "KE", "Africa/Lagos": "NG", "Africa/Abidjan": "CI",
  "Africa/Dakar": "SN", "Africa/Douala": "CM", "Africa/Accra": "GH",
  "Africa/Bamako": "ML", "Africa/Conakry": "GN", "Africa/Ouagadougou": "BF",
  "Africa/Libreville": "GA", "Africa/Malabo": "GQ", "Africa/Casablanca": "MA",
  "Africa/Tunis": "TN", "Africa/Tripoli": "LY", "Africa/Cairo": "EG",
  "Africa/Johannesburg": "ZA", "Africa/Maputo": "MZ", "Africa/Harare": "ZW",
  "Africa/Lusaka": "ZM", "Africa/Dar_es_Salaam": "TZ", "Africa/Kampala": "UG",
  "Africa/Addis_Ababa": "ET", "Africa/Asmara": "ER", "Africa/Khartoum": "SD",
  "Africa/Mogadishu": "SO", "Africa/Djibouti": "DJ", "Africa/Kigali": "RW",
  "Africa/Brazzaville": "CG", "Africa/Bangui": "CF", "Africa/Ndjamena": "TD",
  "Africa/Niamey": "NE", "Africa/Porto-Novo": "BJ", "Africa/Lome": "TG",
  "Africa/Windhoek": "NA", "Africa/Maseru": "LS", "Africa/Gaborone": "BW",
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
    const entry = Object.entries(TZ_MAP).find(([k]) => k.split("/")[0] === tz.split("/")[0]);
    return entry ? entry[1] : "MG";
  } catch { return "MG"; }
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export function buildFullPhone(dial: string, digits: string) {
  const clean = digits.replace(/\D/g, "");
  return clean ? `${dial}${clean}` : "";
}

export function validatePhone(country: Country, digits: string): string | null {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "Le numéro de téléphone est requis.";
  if (!country.pattern.test(clean))
    return `Numéro invalide pour ${country.name} · ex : ${country.example}`;
  return null;
}

export function useDetectedCountry() {
  return useMemo(() => detectCountry(), []);
}

// ─── PhoneField ───────────────────────────────────────────────────────────────
type Props = {
  value: string;
  countryCode: string;
  onChange: (digits: string, countryCode: string, fullPhone: string) => void;
  error?: string;
  required?: boolean;
};

export function PhoneField({ value, countryCode, onChange, error, required }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  const isValid = !!value && !error && country.pattern.test(value.replace(/\D/g, ""));

  const filtered = useMemo(
    () =>
      COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 60);
      // scroll selected into view
      setTimeout(() => {
        const el = listRef.current?.querySelector("[data-selected='true']");
        el?.scrollIntoView({ block: "nearest" });
      }, 80);
    } else {
      setSearch("");
    }
  }, [open]);

  function selectCountry(c: Country) {
    setOpen(false);
    onChange(value, c.code, buildFullPhone(c.dial, value));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d\s\-]/g, "");
    onChange(raw, countryCode, buildFullPhone(country.dial, raw));
  }

  const borderColor = error
    ? "rgba(239,68,68,0.65)"
    : focused || open
    ? "hsl(145 55% 32%)"
    : "hsl(145 20% 16%)";

  const glowColor = error
    ? "0 0 0 3px rgba(239,68,68,0.12)"
    : focused || open
    ? "0 0 0 3px hsl(145 55% 32% / 0.18), 0 1px 3px hsl(150 20% 4% / 0.5)"
    : "0 1px 3px hsl(150 20% 4% / 0.3)";

  return (
    <div ref={wrapRef}>
      <label className="block text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground) / 0.9)" }}>
        Numéro de téléphone
        {required && (
          <span style={{ color: "hsl(145 65% 48%)", marginLeft: 4 }}>*</span>
        )}
      </label>

      {/* ── Input row ── */}
      <div
        className="flex rounded-2xl transition-all duration-200 overflow-visible"
        style={{
          border: `1px solid ${borderColor}`,
          boxShadow: glowColor,
          background: "hsl(145 18% 8%)",
        }}
      >
        {/* Country trigger */}
        <div className="relative shrink-0" ref={dropRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="group flex items-center gap-1 h-full px-3.5 rounded-l-2xl focus:outline-none transition-colors duration-150"
            style={{
              borderRight: `1px solid hsl(145 20% 15%)`,
              background: open ? "hsl(145 22% 11%)" : "transparent",
            }}
          >
            {/* Flag — big, crisp */}
            <span
              style={{
                fontSize: "1.45rem",
                lineHeight: 1,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                userSelect: "none",
              }}
            >
              {country.flag}
            </span>

            {/* Chevron */}
            <ChevronDown
              style={{
                width: 13,
                height: 13,
                color: "hsl(145 30% 50%)",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms ease",
                marginLeft: 1,
              }}
            />
          </button>

          {/* ── Dropdown ── */}
          {open && (
            <div
              className="absolute top-full left-0 z-50 mt-2"
              style={{
                width: 280,
                borderRadius: 18,
                border: "1px solid hsl(145 35% 16%)",
                background: "hsl(150 18% 7%)",
                boxShadow: "0 24px 64px hsl(150 25% 3% / 0.9), 0 0 0 1px hsl(145 50% 25% / 0.08)",
                overflow: "hidden",
              }}
            >
              {/* Header gradient accent */}
              <div
                style={{
                  height: 2,
                  background: "linear-gradient(90deg, hsl(145 65% 42%), hsl(160 50% 35%), transparent)",
                }}
              />

              {/* Search bar */}
              <div style={{ padding: "10px 10px 8px" }}>
                <div className="relative">
                  <Search
                    style={{
                      position: "absolute", left: 10, top: "50%",
                      transform: "translateY(-50%)", width: 13, height: 13,
                      color: "hsl(145 30% 45%)", pointerEvents: "none",
                    }}
                  />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un pays…"
                    style={{
                      width: "100%", paddingLeft: 30, paddingRight: 12,
                      paddingTop: 8, paddingBottom: 8,
                      borderRadius: 12, outline: "none", fontSize: 13,
                      background: "hsl(145 15% 10%)",
                      border: "1px solid hsl(145 25% 14%)",
                      color: "white",
                      caretColor: "hsl(145 65% 48%)",
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "hsl(145 20% 12%)", margin: "0 10px" }} />

              {/* List */}
              <div ref={listRef} style={{ maxHeight: 220, overflowY: "auto", padding: "4px 0 6px" }}>
                {filtered.length === 0 && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "hsl(145 15% 40%)", padding: "20px 0" }}>
                    Aucun résultat
                  </p>
                )}
                {filtered.map((c) => {
                  const isSelected = c.code === countryCode;
                  return (
                    <CountryRow
                      key={c.code}
                      country={c}
                      selected={isSelected}
                      onSelect={selectCountry}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dial code label (inside input row, before digits) */}
        <div className="flex items-center shrink-0 pl-3 pr-1">
          <span
            style={{
              fontSize: 13,
              fontFamily: "monospace",
              fontWeight: 600,
              color: "hsl(145 45% 52%)",
              letterSpacing: "0.02em",
              userSelect: "none",
            }}
          >
            {country.dial}
          </span>
        </div>

        {/* Slim separator */}
        <div style={{ width: 1, background: "hsl(145 20% 14%)", margin: "10px 0" }} />

        {/* Digits input */}
        <div className="flex-1 relative flex items-center">
          <input
            type="tel"
            value={value}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={country.example}
            style={{
              width: "100%", height: "100%",
              padding: "13px 40px 13px 12px",
              background: "transparent",
              border: "none", outline: "none",
              fontSize: 14, color: "white",
              caretColor: "hsl(145 65% 48%)",
            }}
          />
          {/* Status icon */}
          {value && (
            <span
              style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                transition: "opacity 150ms",
              }}
            >
              {isValid ? (
                <CheckCircle2 style={{ width: 16, height: 16, color: "hsl(145 65% 50%)" }} />
              ) : (
                <AlertCircle style={{ width: 16, height: 16, color: "hsl(0 65% 55%)" }} />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Error / success hint */}
      {error && (
        <p
          className="flex items-center gap-1.5 mt-2"
          style={{ fontSize: 12, color: "hsl(0 70% 58%)" }}
        >
          <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
          {error}
        </p>
      )}
      {!error && isValid && (
        <p
          className="flex items-center gap-1.5 mt-2"
          style={{ fontSize: 12, color: "hsl(145 60% 50%)" }}
        >
          <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0 }} />
          Numéro valide
        </p>
      )}
    </div>
  );
}

// ─── Country row (memoized) ───────────────────────────────────────────────────
const CountryRow = React.memo(function CountryRow({
  country, selected, onSelect,
}: {
  country: Country;
  selected: boolean;
  onSelect: (c: Country) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      data-selected={selected}
      onClick={() => onSelect(country)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "8px 14px",
        background: selected
          ? "hsl(145 40% 10%)"
          : hovered
          ? "hsl(145 18% 11%)"
          : "transparent",
        border: "none", cursor: "pointer",
        transition: "background 100ms",
        textAlign: "left",
      }}
    >
      {/* Flag */}
      <span style={{ fontSize: "1.2rem", lineHeight: 1, flexShrink: 0, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}>
        {country.flag}
      </span>

      {/* Name */}
      <span
        style={{
          flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: selected ? "hsl(145 65% 58%)" : "hsl(var(--foreground) / 0.85)",
          fontWeight: selected ? 600 : 400,
        }}
      >
        {country.name}
      </span>

      {/* Dial */}
      <span
        style={{
          fontSize: 12, fontFamily: "monospace", fontWeight: 600, flexShrink: 0,
          color: selected ? "hsl(145 55% 48%)" : "hsl(145 25% 42%)",
        }}
      >
        {country.dial}
      </span>

      {/* Selected dot */}
      {selected && (
        <span
          style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: "hsl(145 65% 50%)",
            boxShadow: "0 0 6px hsl(145 65% 50% / 0.6)",
          }}
        />
      )}
    </button>
  );
});
