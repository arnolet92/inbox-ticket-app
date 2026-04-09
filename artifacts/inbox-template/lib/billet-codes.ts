export function getBilletCodes(orderId: number) {
  const seed = orderId * 997 + 3847;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const ticketKey = Array.from({ length: 8 }, (_, i) =>
    chars[(seed * (i + 7) * 13) % chars.length]
  ).join("");
  const confirmCode = Array.from({ length: 6 }, (_, i) =>
    chars[(seed * (i + 3) * 17) % chars.length]
  ).join("");
  const ticketNumber = `T-${String(orderId).padStart(6, "0")}`;
  return { ticketKey, confirmCode, ticketNumber };
}
