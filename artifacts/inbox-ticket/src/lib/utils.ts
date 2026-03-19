import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMGA(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "0 Ar";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-MG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + " Ar";
}

export function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    orange_money: "Orange Money",
    mvola: "MVola",
    mastercard: "Mastercard",
  };
  return map[method] || method;
}

export function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    refunded: "Remboursé",
  };
  return map[status] || status;
}

export function formatPaymentStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "En attente",
    success: "Réussi",
    failed: "Échoué",
    refunded: "Remboursé",
  };
  return map[status] || status;
}
