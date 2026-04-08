import type { SavedTicket } from "@/context/TicketContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface TicketCardProps {
  ticket: SavedTicket;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMGA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " MGA";
}

function paymentLabel(method: string): string {
  const labels: Record<string, string> = {
    orange_money: "Orange Money",
    mvola: "MVola",
    mastercard: "Mastercard",
  };
  return labels[method] ?? method;
}

function paymentColor(method: string, accent: string, muted: string): string {
  if (method === "orange_money") return "#FF7900";
  if (method === "mvola") return "#E2001A";
  return "#EB001B";
}

export function TicketCard({ ticket }: TicketCardProps) {
  const colors = useColors();

  const isConfirmed = ticket.status === "confirmed";
  const pmColor = paymentColor(ticket.paymentMethod, colors.accent, colors.muted);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.topStrip, { backgroundColor: colors.accent }]}>
        <Text style={styles.topStripText}>INBOX TICKET</Text>
        <View style={[styles.statusChip, { backgroundColor: isConfirmed ? "#1a4525" : "#5c4200" }]}>
          <Text style={[styles.statusChipText, { color: isConfirmed ? "#4caf50" : "#ffc107" }]}>
            {isConfirmed ? "CONFIRMÉ" : "EN ATTENTE"}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>
          {ticket.eventTitle}
        </Text>
        <Text style={[styles.ticketType, { color: colors.accent }]}>
          {ticket.ticketTypeName}
          {ticket.quantity > 1 ? ` × ${ticket.quantity}` : ""}
        </Text>

        <View style={[styles.divider, { borderColor: colors.border }]} />

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>DATE</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {formatDate(ticket.eventDate)}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>LIEU</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={1}>
              {ticket.eventLocation}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>CLIENT</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {ticket.customerName}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>MONTANT</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {formatMGA(ticket.totalAmount)}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { borderColor: colors.border }]} />

        <View style={styles.codeSection}>
          <Text style={[styles.codeLabel, { color: colors.mutedForeground }]}>CODE BILLET</Text>
          <View style={[styles.codeBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.code, { color: colors.accent }]}>{ticket.ticketCode}</Text>
          </View>
        </View>

        <View style={[styles.paymentBadge, { backgroundColor: pmColor + "22" }]}>
          <View style={[styles.paymentDot, { backgroundColor: pmColor }]} />
          <Text style={[styles.paymentText, { color: pmColor }]}>
            {paymentLabel(ticket.paymentMethod)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  topStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topStripText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.5,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  body: {
    padding: 16,
    gap: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 24,
  },
  ticketType: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  divider: {
    borderTopWidth: 1,
    borderStyle: "dashed" as const,
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 16,
  },
  detail: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  codeSection: {
    gap: 6,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  codeBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  code: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "monospace",
    letterSpacing: 3,
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  paymentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
