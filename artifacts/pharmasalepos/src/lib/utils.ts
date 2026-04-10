import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMGA(amount?: number | null): string {
  if (amount == null) return "0 Ar";
  return new Intl.NumberFormat("fr-MG").format(amount) + " Ar";
}

export function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    orange_money: "Orange Money",
    mvola: "MVola",
    mastercard: "Mastercard",
    especes: "Espèces",
  };
  return map[method] ?? method;
}
