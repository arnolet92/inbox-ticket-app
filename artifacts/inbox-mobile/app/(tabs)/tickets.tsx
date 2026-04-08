import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TicketCard } from "@/components/TicketCard";
import { useTickets } from "@/context/TicketContext";
import { useColors } from "@/hooks/useColors";

export default function TicketsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tickets, loading } = useTickets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: headerTop + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Mes Billets
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {tickets.length} billet{tickets.length !== 1 ? "s" : ""} enregistré
          {tickets.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Chargement...
          </Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="credit-card" size={40} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Aucun billet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Vos billets achetés apparaîtront ici
          </Text>
          <Pressable
            onPress={() => router.push("/")}
            style={[styles.browseBtn, { backgroundColor: colors.accent }]}
          >
            <Feather name="search" size={16} color="#ffffff" />
            <Text style={styles.browseBtnText}>Découvrir les événements</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TicketCard ticket={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: isWeb ? 34 + 84 : 100 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!tickets.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
  },
  headerSub: {
    fontSize: 14,
  },
  list: {
    paddingTop: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 32,
  },
  loadingText: {
    fontSize: 15,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 4,
  },
  browseBtnText: {
    color: "#ffffff",
    fontWeight: "700" as const,
    fontSize: 15,
  },
});
