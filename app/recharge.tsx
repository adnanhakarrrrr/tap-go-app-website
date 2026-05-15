import { useStripe } from "@stripe/stripe-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

const presetAmounts = [5, 10, 20, 50];

export default function RechargeScreen() {
  const params = useLocalSearchParams();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const studentId =
    typeof params.studentId === "string" ? Number(params.studentId) : 0;

  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);

  const startRecharge = async () => {
    const amountNumber = Number(amount);

    if (!studentId) {
      Alert.alert("Error", "Missing student ID. Please log in again.");
      return;
    }

    if (!amountNumber || amountNumber <= 0) {
      Alert.alert("Invalid amount", "Enter a recharge amount greater than 0.");
      return;
    }

    if (amountNumber < 1) {
      Alert.alert("Invalid amount", "Minimum recharge is $1.");
      return;
    }

    if (amountNumber > 100) {
      Alert.alert("Invalid amount", "Maximum recharge is $100.");
      return;
    }

    try {
      setLoading(true);

      const createResponse = await fetch(
        `${API_BASE}/create_recharge_payment.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            student_id: studentId,
            amount_usd: amountNumber,
          }),
        },
      );

      const createRaw = await createResponse.text();

      let createData: any;

      try {
        createData = JSON.parse(createRaw);
      } catch {
        Alert.alert("Server Response", createRaw.slice(0, 800));
        throw new Error("Recharge payment response was not valid JSON.");
      }

      if (!createResponse.ok || !createData.success) {
        throw new Error(createData.message || "Could not start recharge.");
      }

      const initResult = await initPaymentSheet({
        merchantDisplayName: "Tap & Go",
        paymentIntentClientSecret: createData.client_secret,
        allowsDelayedPaymentMethods: false,
      });

      if (initResult.error) {
        throw new Error(initResult.error.message);
      }

      const presentResult = await presentPaymentSheet();

      if (presentResult.error) {
        throw new Error(presentResult.error.message);
      }

      const confirmResponse = await fetch(`${API_BASE}/confirm_recharge.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          student_id: studentId,
          payment_intent_id: createData.payment_intent_id,
        }),
      });

      const confirmRaw = await confirmResponse.text();

      let confirmData: any;

      try {
        confirmData = JSON.parse(confirmRaw);
      } catch {
        throw new Error("Confirm recharge response was not valid JSON.");
      }

      if (!confirmResponse.ok || !confirmData.success) {
        throw new Error(
          confirmData.message || "Recharge paid but credit update failed.",
        );
      }

      Alert.alert(
        "Recharge Successful",
        `${confirmData.credits_added} credits were added.\nNew balance: ${confirmData.new_balance}`,
      );

      router.back();
    } catch (error: any) {
      Alert.alert("Recharge Failed", error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recharge Credits</Text>
          <Text style={styles.subtitle}>
            Add credits to your Tap & Go account using a card.
          </Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Recharge Amount</Text>

        <View style={styles.amountInputRow}>
          <Text style={styles.currencyText}>$</Text>

          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="10"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.helpText}>1 USD = 1 Tap & Go credit</Text>

        <View style={styles.presetGrid}>
          {presetAmounts.map((value) => {
            const selected = Number(amount) === value;

            return (
              <Pressable
                key={value}
                style={[
                  styles.presetButton,
                  selected && styles.presetButtonActive,
                ]}
                onPress={() => setAmount(String(value))}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    selected && styles.presetButtonTextActive,
                  ]}
                >
                  ${value}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Credits to receive</Text>
          <Text style={styles.summaryValue}>{Number(amount || 0)} credits</Text>
        </View>

        <Pressable
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={startRecharge}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Continue to Card Payment</Text>
          )}
        </Pressable>

        <Text style={styles.secureText}>
          Card details are handled securely by Stripe. Tap & Go does not store
          your card number.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#AAB4C3",
    fontSize: 14,
    marginTop: 6,
    maxWidth: 260,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: "#182235",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 24,
    padding: 22,
  },
  label: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  currencyText: {
    color: "#1D4ED8",
    fontSize: 30,
    fontWeight: "900",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
    paddingVertical: 12,
  },
  helpText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 18,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  presetButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  presetButtonActive: {
    backgroundColor: "#1D4ED8",
  },
  presetButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  presetButtonTextActive: {
    color: "#FFFFFF",
  },
  summaryBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  summaryLabel: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
  },
  payButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secureText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 14,
  },
});
