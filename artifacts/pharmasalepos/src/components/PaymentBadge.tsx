import React from "react";
import { omLogo, mvolaLogo, visaMastercardLogo } from "@/assets/images";

const METHOD_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  logoBg: string;
  logo: string;
}> = {
  orange_money: {
    label: "Orange Money",
    color: "#ff6600",
    bg: "#ff660018",
    logoBg: "#1a0d00",
    logo: omLogo,
  },
  mvola: {
    label: "MVola",
    color: "#16a34a",
    bg: "#16a34a18",
    logoBg: "#0a1f0a",
    logo: mvolaLogo,
  },
  mastercard: {
    label: "Visa / Mastercard",
    color: "#2563eb",
    bg: "#2563eb18",
    logoBg: "#ffffff",
    logo: visaMastercardLogo,
  },
  especes: {
    label: "Espèces",
    color: "#16a34a",
    bg: "#16a34a18",
    logoBg: "#0a1f0a",
    logo: "",
  },
};

type Size = "sm" | "md" | "lg";

interface PaymentBadgeProps {
  method: string;
  size?: Size;
  showLabel?: boolean;
}

export function PaymentBadge({ method, size = "md", showLabel = true }: PaymentBadgeProps) {
  const cfg = METHOD_CONFIG[method];

  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        {method ?? "—"}
      </span>
    );
  }

  const logoSize = size === "sm" ? 20 : size === "lg" ? 32 : 24;
  const logoImgSize = size === "sm" ? 14 : size === "lg" ? 22 : 16;
  const fontSize = size === "sm" ? "text-[11px]" : size === "lg" ? "text-sm" : "text-xs";
  const gap = size === "sm" ? "gap-1.5" : "gap-2";
  const px = size === "sm" ? "px-2 py-0.5" : size === "lg" ? "px-3.5 py-2" : "px-2.5 py-1";
  const radius = size === "lg" ? "rounded-xl" : "rounded-lg";

  return (
    <span
      className={`inline-flex items-center ${gap} ${px} ${radius} font-semibold ${fontSize}`}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.color}44`,
        color: cfg.color,
      }}
    >
      {cfg.logo ? (
        <span
          className="rounded-md overflow-hidden flex items-center justify-center shrink-0"
          style={{
            width: logoSize,
            height: logoSize,
            background: cfg.logoBg,
            minWidth: logoSize,
          }}
        >
          <img
            src={cfg.logo}
            alt={cfg.label}
            style={{ width: logoImgSize, height: logoImgSize, objectFit: "contain" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </span>
      ) : (
        <span className="text-base">💵</span>
      )}
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
}

export function getPaymentColor(method: string): string {
  return METHOD_CONFIG[method]?.color ?? "#888888";
}

export function getPaymentLabel(method: string): string {
  return METHOD_CONFIG[method]?.label ?? method;
}
