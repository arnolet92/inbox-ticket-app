import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTickets } from "@/context/TicketContext";

const PROFILE_KEY = "inbox_ticket_mobile_profile";

interface Profile {
  name: string;
  email: string;
  phone: string;
}

const DEFAULT_PROFILE: Profile = { name: "", email: "", phone: "" };

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tickets } = useTickets();
  const isWeb = Platform.OS === "web";
  const headerTop = isWeb ? 67 : insets.top;

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then((raw) => {
        if (raw) {
          const p = JSON.parse(raw) as Profile;
          setProfile(p);
          setDraft(p);
        }
      })
      .catch(() => {});
  }, []);

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }

  async function saveProfile() {
    const trimmed = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    };
    if (!trimmed.name) {
      Alert.alert("Erreur", "Veuillez saisir votre nom");
      return;
    }
    setProfile(trimmed);
    setEditing(false);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(trimmed));
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 + 84 : 100 }}
      showsVerticalScrollIndicator={false}
    >
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
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profil</Text>
          <Pressable
            onPress={editing ? saveProfile : startEdit}
            style={[
              styles.editBtn,
              { backgroundColor: editing ? colors.accent : colors.muted },
            ]}
          >
            <Feather
              name={editing ? "check" : "edit-2"}
              size={16}
              color={editing ? "#ffffff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.editBtnText,
                { color: editing ? "#ffffff" : colors.mutedForeground },
              ]}
            >
              {editing ? "Sauvegarder" : "Modifier"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {!editing && (
          <Text style={[styles.avatarName, { color: colors.foreground }]}>
            {profile.name || "Votre nom"}
          </Text>
        )}
        {!editing && profile.email ? (
          <Text style={[styles.avatarEmail, { color: colors.mutedForeground }]}>
            {profile.email}
          </Text>
        ) : null}
      </View>

      {editing ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
            INFORMATIONS PERSONNELLES
          </Text>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Nom complet</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground },
              ]}
              value={draft.name}
              onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.mutedForeground}
              testID="name-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground },
              ]}
              value={draft.email}
              onChangeText={(v) => setDraft((d) => ({ ...d, email: v }))}
              placeholder="votre@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Téléphone</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground },
              ]}
              value={draft.phone}
              onChangeText={(v) => setDraft((d) => ({ ...d, phone: v }))}
              placeholder="+261 34 00 000 00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              testID="phone-input"
            />
          </View>

          <Pressable
            onPress={() => setEditing(false)}
            style={[styles.cancelBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Annuler</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
              INFORMATIONS
            </Text>
            <InfoRow icon="user" label="Nom" value={profile.name || "Non défini"} colors={colors} />
            <InfoRow icon="mail" label="Email" value={profile.email || "Non défini"} colors={colors} />
            <InfoRow icon="phone" label="Téléphone" value={profile.phone || "Non défini"} colors={colors} />
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
              ACTIVITÉ
            </Text>
            <InfoRow
              icon="credit-card"
              label="Billets achetés"
              value={`${tickets.length} billet${tickets.length !== 1 ? "s" : ""}`}
              colors={colors}
            />
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
              À PROPOS
            </Text>
            <InfoRow icon="info" label="Application" value="Inbox Ticket Mobile" colors={colors} />
            <InfoRow icon="tag" label="Version" value="1.0.0" colors={colors} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[infoStyles.row, { borderBottomColor: colors.border }]}>
      <Feather name={icon as any} size={16} color={colors.mutedForeground} />
      <View style={infoStyles.content}>
        <Text style={[infoStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[infoStyles.value, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "500" as const,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 15,
    fontWeight: "500" as const,
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700" as const,
  },
  avatarName: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  avatarEmail: {
    fontSize: 14,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1,
    marginBottom: 4,
  },
  field: {
    marginTop: 12,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
