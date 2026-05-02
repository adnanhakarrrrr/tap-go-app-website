import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

type AlertItem = {
  id: number;
  title: string;
  message: string;
  targetType: "all" | "bus";
  busNumber?: string | null;
  routeName?: string | null;
  bookingDate?: string | null;
  createdAt: string;
};

const formatReadableDate = (value?: string | null) => {
  if (!value) return "";

  const datePart = value.includes(" ") ? value.split(" ")[0] : value;
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function StudentAlertsScreen() {
  const params = useLocalSearchParams();

  const studentId =
    typeof params.studentId === "string" ? Number(params.studentId) : 0;

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");

  const fetchAlerts = async () => {
    if (!studentId) {
      setAlerts([]);
      setPageError("Missing student ID. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setPageError("");

      const response = await fetch(`${API_BASE}/get_student_alerts.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          student_id: studentId,
        }),
      });

      const raw = await response.text();

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Alerts response was not valid JSON.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load alerts.");
      }

      const formattedAlerts: AlertItem[] = Array.isArray(data.alerts)
        ? data.alerts.map((alert: any) => ({
            id: Number(alert.id),
            title: String(alert.title || ""),
            message: String(alert.message || ""),
            targetType: alert.target_type === "bus" ? "bus" : "all",
            busNumber: alert.bus_number || null,
            routeName: alert.route_name || null,
            bookingDate: alert.booking_date || null,
            createdAt: alert.created_at || "",
          }))
        : [];

      setAlerts(formattedAlerts);
    } catch (error: any) {
      setAlerts([]);
      setPageError(error?.message || "Could not load alerts.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchAlerts();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [studentId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSubtitle}>
            Bus updates, delays, and transport notices
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={["#1D4ED8"]}
          />
        }
      >
        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.emptyText}>Loading alerts...</Text>
          </View>
        ) : pageError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Could not load alerts</Text>
            <Text style={styles.emptyText}>{pageError}</Text>

            <Pressable style={styles.retryButton} onPress={fetchAlerts}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptyText}>
              You will see bus delays, route changes, and important updates
              here.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertTopRow}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>🔔</Text>
                </View>

                <View style={styles.alertHeaderText}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDate}>
                    {formatReadableDate(alert.createdAt)}
                  </Text>
                </View>
              </View>

              <Text style={styles.alertMessage}>{alert.message}</Text>

              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>
                  {alert.targetType === "all"
                    ? "Sent to all students"
                    : "Bus-specific alert"}
                </Text>

                {alert.targetType === "bus" && (
                  <>
                    <Text style={styles.metaValue}>
                      Bus: {alert.busNumber || "N/A"}
                    </Text>

                    <Text style={styles.metaValue}>
                      Route: {alert.routeName || "N/A"}
                    </Text>

                    <Text style={styles.metaValue}>
                      Booking Date: {formatReadableDate(alert.bookingDate)}
                    </Text>
                  </>
                )}
              </View>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#0B1220",
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#182235",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#AAB4C3",
    fontSize: 13,
    marginTop: 2,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  alertTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 22,
  },

  alertHeaderText: {
    flex: 1,
  },

  alertTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },

  alertDate: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  alertMessage: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 14,
  },

  metaBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
  },

  metaLabel: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  metaValue: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
});
