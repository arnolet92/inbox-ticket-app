import { useCreateOrder, useCreatePayment } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

import { useTickets } from "@/context/TicketContext";
import { useColors } from "@/hooks/useColors";

type PaymentMethod = "orange_money" | "mvola" | "mastercard";

const PAYMENT_METHODS: { key: PaymentMethod; label: string; color: string; icon: string }[] = [
  { key: "orange_money", label: "Orange Money", color: "#FF7900", icon: "smartphone" },
  { key: "mvola", label: "MVola", color: "#E2001A", icon: "smartphone" },
  { key: "mastercard", label: "Mastercard", color: "#EB001B", icon: "credit-card" },
];

function formatMGA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " MGA";
}

function generateCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `IT-${ts}-${rnd}`;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function CheckoutScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTicket } = useTickets();
  const isWeb = Platform.OS === "web";

  const params = useLocalSearchParams<{
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    eventCity: string;
    ticketTypeId: string;
    ticketTypeName: string;
    price: string;
  }>();

  const unitPrice = parseFloat(params.price ?? "0");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("orange_money");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { mutateAsync: createOrder } = useCreateOrder();
  const { mutateAsync: createPayment } = useCreatePayment();

  const total = unitPrice * quantity;

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre nom");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Erreur", "Veuillez saisir un email valide");
      return;
    }
    if ((paymentMethod === "orange_money" || paymentMethod === "mvola") && !phone.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre numéro de téléphone");
      return;
    }
    if (paymentMethod === "mastercard" && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
      Alert.alert("Erreur", "Veuillez saisir les informations de votre carte");
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder({
        data: {
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || null,
          ticketTypeId: parseInt(params.ticketTypeId ?? "0", 10),
          quantity,
          paymentMethod,
        },
      });

      await createPayment({
        data: {
          orderId: order.id,
          method: paymentMethod,
          phoneNumber: phone.trim() || null,
          cardNumber: cardNumber.trim() || null,
          cardExpiry: cardExpiry.trim() || null,
          cardCvv: cardCvv.trim() || null,
        },
      });

      const ticket = {
        id: generateId(),
        orderId: order.id,
        eventId: parseInt(params.eventId ?? "0", 10),
        eventTitle: params.eventTitle ?? "",
        eventDate: params.eventDate ?? "",
        eventLocation: params.eventLocation
          ? `${params.eventLocation}, ${params.eventCity ?? ""}`
          : params.eventCity ?? "",
        ticketTypeName: params.ticketTypeName ?? "",
        quantity,
        totalAmount: total,
        paymentMethod,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim() || undefined,
        ticketCode: generateCode(),
        createdAt: new Date().toISOString(),
        status: "confirmed" as const,
      };

      await addTicket(ticket);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du paiement";
      Alert.alert("Échec du paiement", msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.accent + "22" }]}>
          <Feather name="check-circle" size={64} color={colors.accent} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>
          Paiement confirmé !
        </Text>
        <Text style={[styles.successText, { color: colors.mutedForeground }]}>
          Votre billet a été enregistré dans "Mes Billets"
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/tickets")}
          style={[styles.successBtn, { backgroundColor: colors.accent }]}
        >
          <Feather name="credit-card" size={18} color="#ffffff" />
          <Text style={styles.successBtnText}>Voir mes billets</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/")}
          style={[styles.successBtnSecondary, { borderColor: colors.border }]}
        >
          <Text style={[styles.successBtnSecondaryText, { color: colors.mutedForeground }]}>
            Retour aux événements
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]} numberOfLines={2}>
            {params.eventTitle}
          </Text>
          <Text style={[styles.summaryType, { color: colors.accent }]}>
            {params.ticketTypeName}
          </Text>
          <Text style={[styles.summaryDate, { color: colors.mutedForeground }]}>
            📅 {params.eventDate ? new Date(params.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}
          </Text>
          <Text style={[styles.summaryDate, { color: colors.mutedForeground }]}>
            📍 {params.eventLocation}, {params.eventCity}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quantité</Text>
          <View style={[styles.quantityRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name="minus" size={18} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.qtyValue, { color: colors.foreground }]}>{quantity}</Text>
            <Pressable
              onPress={() => setQuantity((q) => Math.min(10, q + 1))}
              style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name="plus" size={18} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Informations personnelles</Text>

          <Field label="Nom complet *" colors={colors}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={name}
              onChangeText={setName}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.mutedForeground}
              testID="name-input"
            />
          </Field>

          <Field label="Email *" colors={colors}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
          </Field>

          <Field label="Téléphone" colors={colors}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+261 34 00 000 00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              testID="phone-input"
            />
          </Field>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mode de paiement</Text>
          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod === pm.key;
              return (
                <Pressable
                  key={pm.key}
                  onPress={() => setPaymentMethod(pm.key)}
                  style={[
                    styles.pmCard,
                    {
                      backgroundColor: isSelected ? pm.color + "22" : colors.card,
                      borderColor: isSelected ? pm.color : colors.border,
                    },
                  ]}
                  testID={`pm-${pm.key}`}
                >
                  <Feather name={pm.icon as any} size={22} color={isSelected ? pm.color : colors.mutedForeground} />
                  <Text style={[styles.pmLabel, { color: isSelected ? pm.color : colors.foreground }]}>
                    {pm.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.pmCheck, { backgroundColor: pm.color }]}>
                      <Feather name="check" size={10} color="#ffffff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {(paymentMethod === "orange_money" || paymentMethod === "mvola") && (
            <Field label={`Numéro ${paymentMethod === "orange_money" ? "Orange" : "MVola"} *`} colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+261 34 00 000 00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                testID="payment-phone-input"
              />
            </Field>
          )}

          {paymentMethod === "mastercard" && (
            <>
              <Field label="Numéro de carte *" colors={colors}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={19}
                  testID="card-number-input"
                />
              </Field>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Field label="Expiration *" colors={colors}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      placeholder="MM/AA"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      maxLength={5}
                      testID="card-expiry-input"
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="CVV *" colors={colors}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      placeholder="123"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                      testID="card-cvv-input"
                    />
                  </Field>
                </View>
              </View>
            </>
          )}
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
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
            Total ({quantity} billet{quantity > 1 ? "s" : ""})
          </Text>
          <Text style={[styles.totalValue, { color: colors.accent }]}>{formatMGA(total)}</Text>
        </View>
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.accent }]}
          testID="submit-btn"
        >
          {loading ? (
            <Text style={[styles.submitBtnText, { color: colors.mutedForeground }]}>
              Traitement en cours...
            </Text>
          ) : (
            <>
              <Feather name="lock" size={16} color="#ffffff" />
              <Text style={styles.submitBtnText}>Confirmer le paiement</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function Field({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 6, marginTop: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: "500" as const, color: colors.mutedForeground }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 24,
  },
  summaryType: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  summaryDate: {
    fontSize: 13,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    minWidth: 40,
    textAlign: "center",
  },
  input: {
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  paymentMethods: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  pmCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  pmLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  pmCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  successText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  successBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  successBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  successBtnSecondary: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
  },
  successBtnSecondaryText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
});
