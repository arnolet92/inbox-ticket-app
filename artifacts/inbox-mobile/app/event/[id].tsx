import { useGetEvent, useListTicketTypes } from "@workspace/api-client-react";
import type { TicketType } from "@workspace/api-client-react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatMGA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " MGA";
}

function getAvailable(t: TicketType): number {
  return t.quantity - t.soldCount;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const eventId = parseInt(id ?? "0", 10);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const { data: event, isLoading, error } = useGetEvent(eventId, {
    query: { queryKey: ["event", eventId], enabled: eventId > 0 },
  });

  const { data: ticketTypes, isLoading: typesLoading } = useListTicketTypes(
    { eventId },
    { query: { queryKey: ["ticket-types", eventId], enabled: eventId > 0 } },
  );

  const types = (event?.ticketTypes ?? ticketTypes) || [];
  const selectedType = types.find((t) => t.id === selectedTypeId) ?? types[0];

  function goToCheckout() {
    if (!event || !selectedType) return;
    router.push({
      pathname: "/checkout",
      params: {
        eventId: event.id.toString(),
        eventTitle: event.title,
        eventDate: event.startDate,
        eventLocation: event.location,
        eventCity: event.city,
        ticketTypeId: selectedType.id.toString(),
        ticketTypeName: selectedType.name,
        price: selectedType.price.toString(),
      },
    });
  }

  const backTop = isWeb ? 67 + 12 : insets.top + 12;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 32 }}>⚠️</Text>
        <Text style={[styles.errorText, { color: colors.foreground }]}>
          Événement introuvable
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn2, { backgroundColor: colors.accent }]}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700" as const }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const isSoldOut = event.soldTickets >= event.totalCapacity;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.heroContainer}>
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.heroPlaceholderText}>{event.title.charAt(0)}</Text>
            </View>
          )}
          <LinearGradient
            colors={["transparent", colors.background]}
            style={styles.heroGradient}
          />
          <View style={[styles.backBtn, { top: backTop }]}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backBtnInner, { backgroundColor: "rgba(0,0,0,0.6)" }]}
            >
              <Text style={styles.backBtnText}>←</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
            </View>
            {event.status === "ongoing" && (
              <View style={[styles.liveBadge, { backgroundColor: "#ae1d1d" }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN DIRECT</Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>

          <View style={styles.metaCard}>
            <View style={[styles.metaItem, { borderColor: colors.border }]}>
              <Text style={[styles.metaIcon]}>📅</Text>
              <View style={styles.metaText}>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>DATE</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>
                  {formatDate(event.startDate)}
                </Text>
                <Text style={[styles.metaValueSub, { color: colors.mutedForeground }]}>
                  {formatTime(event.startDate)} — {formatTime(event.endDate)}
                </Text>
              </View>
            </View>

            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <View style={styles.metaText}>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>LIEU</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>
                  {event.location}
                </Text>
                <Text style={[styles.metaValueSub, { color: colors.mutedForeground }]}>
                  {event.city}
                </Text>
              </View>
            </View>
          </View>

          {event.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {event.description}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Billets disponibles</Text>

            {typesLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : types.length === 0 ? (
              <Text style={[styles.noTypesText, { color: colors.mutedForeground }]}>
                Aucun type de billet disponible
              </Text>
            ) : (
              <View style={styles.typesList}>
                {types.map((t) => {
                  const avail = getAvailable(t);
                  const isSelected = (selectedTypeId ?? types[0]?.id) === t.id;
                  const isFull = avail <= 0;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => !isFull && setSelectedTypeId(t.id)}
                      style={[
                        styles.typeCard,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.accent : colors.border,
                        },
                        isFull && styles.typeCardDisabled,
                      ]}
                    >
                      <View style={styles.typeInfo}>
                        <Text style={[styles.typeName, { color: isSelected ? "#ffffff" : colors.foreground }]}>
                          {t.name}
                        </Text>
                        {t.description ? (
                          <Text style={[styles.typeDesc, { color: isSelected ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
                            {t.description}
                          </Text>
                        ) : null}
                        <Text style={[styles.typeAvail, { color: isFull ? colors.destructive : colors.mutedForeground }]}>
                          {isFull ? "Épuisé" : `${avail} place${avail > 1 ? "s" : ""} restante${avail > 1 ? "s" : ""}`}
                        </Text>
                      </View>
                      <View style={styles.typePrice}>
                        <Text style={[styles.typePriceValue, { color: isSelected ? "#ffffff" : colors.accent }]}>
                          {formatMGA(t.price)}
                        </Text>
                        {isSelected && !isFull && (
                          <View style={styles.selectedCheck}>
                            <Text style={styles.checkMark}>✓</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={[styles.capacityBar, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.capacityFill,
                {
                  backgroundColor: colors.accent,
                  width: `${Math.min(100, (event.soldTickets / event.totalCapacity) * 100)}%` as any,
                },
              ]}
            />
          </View>
          <Text style={[styles.capacityText, { color: colors.mutedForeground }]}>
            {event.soldTickets} / {event.totalCapacity} places vendues
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: isWeb ? 34 : insets.bottom + 12,
          },
        ]}
      >
        {selectedType && (
          <View style={styles.footerPrice}>
            <Text style={[styles.footerPriceLabel, { color: colors.mutedForeground }]}>Prix</Text>
            <Text style={[styles.footerPriceValue, { color: colors.accent }]}>
              {formatMGA(selectedType.price)}
            </Text>
          </View>
        )}
        <Pressable
          onPress={goToCheckout}
          disabled={isSoldOut || types.length === 0}
          style={[
            styles.buyBtn,
            { backgroundColor: isSoldOut || types.length === 0 ? colors.muted : colors.accent },
          ]}
          testID="buy-button"
        >
          <Text style={[styles.buyBtnText, { color: isSoldOut ? colors.mutedForeground : "#ffffff" }]}>
            {isSoldOut ? "Événement complet" : "Acheter des billets"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  heroContainer: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderText: {
    fontSize: 72,
    color: "#ffffff",
    opacity: 0.4,
    fontWeight: "700" as const,
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  backBtn: {
    position: "absolute",
    left: 16,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    color: "#ffffff",
    fontSize: 20,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  liveText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    lineHeight: 32,
  },
  metaCard: {
    gap: 0,
  },
  metaItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  metaIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  metaText: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  metaValueSub: {
    fontSize: 13,
  },
  metaDivider: {
    height: 1,
    marginLeft: 36,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  noTypesText: {
    fontSize: 14,
  },
  typesList: {
    gap: 10,
  },
  typeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeCardDisabled: {
    opacity: 0.5,
  },
  typeInfo: {
    flex: 1,
    gap: 3,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  typeDesc: {
    fontSize: 13,
  },
  typeAvail: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  typePrice: {
    alignItems: "flex-end",
    gap: 6,
  },
  typePriceValue: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2d9e4e",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  capacityBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  capacityFill: {
    height: "100%",
    borderRadius: 2,
  },
  capacityText: {
    fontSize: 12,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerPrice: {
    gap: 2,
  },
  footerPriceLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  buyBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  buyBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  backBtn2: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
});
