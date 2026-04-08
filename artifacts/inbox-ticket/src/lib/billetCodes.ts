/**
 * Generates deterministic ticket codes from an order ID.
 * Always produces the same result for the same orderId.
 */

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
}

/** 6 lowercase letter security key  e.g. "ejddje" */
export function generateTicketKey(orderId: number): string {
  const chars = "abcdefghjkmnpqrstuvwxyz";
  const next = lcg(orderId * 2654435761);
  return Array.from({ length: 6 }, () => chars[next() % chars.length]).join("");
}

/** 6 uppercase alphanumeric confirmation code e.g. "K7MNP2" */
export function generateConfirmCode(orderId: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const next = lcg(orderId * 1664525 + 1013904223);
  return Array.from({ length: 6 }, () => chars[next() % chars.length]).join("");
}

/** Formatted ticket number e.g. "BIL-000042" */
export function generateTicketNumber(orderId: number): string {
  return `BIL-${String(orderId).padStart(6, "0")}`;
}

export function getBilletCodes(orderId: number) {
  return {
    ticketKey: generateTicketKey(orderId),
    confirmCode: generateConfirmCode(orderId),
    ticketNumber: generateTicketNumber(orderId),
  };
}
