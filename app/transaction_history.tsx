import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_BASE = "https://swarm-july-shiftless.ngrok-free.dev/tapandgo_api";

type TransactionItem = {
  id: number;
  type: string;
  title: string;
  amount: string;
  description: string | null;
  created_at: string;
};

export default function TransactionHistoryScreen() {
  const params = useLocalSearchParams();
  const studentId =
    typeof params.studentId === "string" ? params.studentId : "";

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/get_transactions.php?student_id=${encodeURIComponent(studentId)}`,
      );

      const raw = await response.text();

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Server did not return valid JSON.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load transactions.");
      }

      setTransactions(
        Array.isArray(data.transactions) ? data.transactions : [],
      );
    } catch (error: any) {
      setTransactions([]);
      setError(error?.message || "Could not load transaction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchTransactions();
    } else {
      setLoading(false);
      setError("Missing student ID.");
    }
  }, [studentId]);

  const formatAmount = (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return `${amount} credits`;
    return `${numericAmount > 0 ? "+" : ""}${numericAmount} credits`;
  };

  const getAmountStyle = (amount: string) => {
    const numericAmount = parseFloat(amount);
    return numericAmount < 0 ? styles.amountNegative : styles.amountPositive;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Text style={styles.headerSubtitle}>View your credits activity</Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerCard}>
            <Text style={styles.emptyTitle}>Could not load transactions</Text>
            <Text style={styles.emptyText}>{error}</Text>

            <Pressable style={styles.retryButton} onPress={fetchTransactions}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.centerCard}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Your ride payments and credit recharges will appear here.
            </Text>
          </View>
        ) : (
          transactions.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  {!!item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                  )}
                </View>

                <Text style={[styles.amount, getAmountStyle(item.amount)]}>
                  {formatAmount(item.amount)}
                </Text>
              </View>

              <Text style={styles.meta}>{item.created_at}</Text>
            </View>
          ))
        )}
      </ScrollView>
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
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#AAB4C3",
    fontSize: 13,
    marginTop: 4,
  },
  backButton: {
    backgroundColor: "#182235",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  centerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#374151",
    fontSize: 14,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
  },
  amountPositive: {
    color: "#15803D",
  },
  amountNegative: {
    color: "#B91C1C",
  },
  meta: {
    marginTop: 12,
    fontSize: 13,
    color: "#94A3B8",
  },
});
