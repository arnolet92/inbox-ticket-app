import type { Event } from "@workspace/api-client-react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMinPrice(event: Event): number | null {
  if (!event.ticketTypes || event.ticketTypes.length === 0) return null;
  return Math.min(...event.ticketTypes.map((t) => t.price));
}

function formatMGA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " MGA";
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    concert: "#c4501a",
    festival: "#1a7ac4",
    sport: "#1a4525",
    conférence: "#6b1ac4",
    conference: "#6b1ac4",
    theatre: "#c41a6b",
    théâtre: "#c41a6b",
    art: "#c4a01a",
    default: "#2d9e4e",
  };
  return map[category.toLowerCase()] ?? map.default;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    upcoming: "À venir",
    ongoing: "En cours",
    past: "Passé",
    cancelled: "Annulé",
  };
  return labels[status] ?? status;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const colors = useColors();
  const minPrice = getMinPrice(event);
  const catColor = getCategoryColor(event.category);
  const isWeb = Platform.OS === "web";

  return (
    <Pressable
      onPress={onPress}
      testID="event-card"
      style={({ pressed }) => [
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.card },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageContainer}>
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.placeholderText}>{event.title.charAt(0)}</Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.gradient}
        />
        <View style={styles.topRow}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
            <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
          </View>
          {event.status !== "upcoming" && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    event.status === "ongoing"
                      ? colors.accent
                      : event.status === "cancelled"
                        ? colors.destructive
                        : colors.muted,
                },
              ]}
            >
              <Text style={styles.statusText}>{getStatusLabel(event.status)}</Text>
            </View>
          )}
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
        </View>
      </View>

      <View style={[styles.info, { backgroundColor: colors.card }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            📅 {formatDate(event.startDate)}
          </Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]} numberOfLines={1}>
            📍 {event.city}
          </Text>
        </View>
        <View style={styles.priceRow}>
          {minPrice !== null ? (
            <Text style={[styles.price, { color: colors.accent }]}>
              À partir de {formatMGA(minPrice)}
            </Text>
          ) : (
            <Text style={[styles.price, { color: colors.mutedForeground }]}>
              Prix non disponible
            </Text>
          )}
          <View style={[styles.capacityBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.capacityText, { color: colors.mutedForeground }]}>
              {event.soldTickets}/{event.totalCapacity}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
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
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  imageContainer: {
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#ffffff",
    opacity: 0.6,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  topRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700" as const,
    lineHeight: 22,
  },
  info: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  capacityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  capacityText: {
    fontSize: 11,
  },
});
