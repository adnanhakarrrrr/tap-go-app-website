import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const { width } = Dimensions.get("window");

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

type Stop = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type Bus = {
  id: number;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  bookedSeats: number;
  capacity: number;
  isActive: boolean;
  routeName: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  routePath: {
    latitude: number;
    longitude: number;
  }[];
  stops: Stop[];
};

export default function DashboardScreen() {
  const params = useLocalSearchParams();

  const studentId =
    typeof params.studentId === "string" ? params.studentId : "";

  const firstName = useMemo(() => {
    const fullName =
      typeof params.fullName === "string" ? params.fullName : "Student";

    return fullName.trim().split(" ")[0] || "Student";
  }, [params.fullName]);

  const initialBalance =
    typeof params.balance === "string" ? params.balance : "0.00";

  const [balance, setBalance] = useState(initialBalance);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeBuses, setActiveBuses] = useState<Bus[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [busError, setBusError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const fetchStudentBalance = async () => {
    if (!studentId) {
      setBalance("0.00");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/get_profile.php?student_id=${encodeURIComponent(
          studentId,
        )}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const raw = await response.text();

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Profile response was not valid JSON.");
      }

      if (data.success && data.student?.credit_balance !== undefined) {
        setBalance(String(data.student.credit_balance));
      }
    } catch {
      // Keep current balance if request fails.
    }
  };

  const fetchActiveBuses = async () => {
    try {
      setLoadingBuses(true);
      setBusError("");

      const response = await fetch(
        `${API_BASE}/get_buses.php?day=Today&area=`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const raw = await response.text();

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Server did not return valid JSON.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load active buses.");
      }

      const buses = Array.isArray(data.buses) ? data.buses : [];
      setActiveBuses(buses);
    } catch (error: any) {
      setActiveBuses([]);
      setBusError(error?.message || "Could not load active buses.");
    } finally {
      setLoadingBuses(false);
    }
  };

  const fetchAlertCount = async () => {
    if (!studentId) {
      setAlertCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/get_student_alert_count.php`, {
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
        throw new Error("Alert count response was not valid JSON.");
      }

      if (data.success) {
        setAlertCount(Number(data.alert_count || 0));
      }
    } catch {
      setAlertCount(0);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        fetchActiveBuses(),
        fetchAlertCount(),
        fetchStudentBalance(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveBuses();
    fetchAlertCount();
    fetchStudentBalance();

    const interval = setInterval(() => {
      fetchActiveBuses();
      fetchAlertCount();
      fetchStudentBalance();
    }, 10000);

    return () => clearInterval(interval);
  }, [studentId]);

  const initialMapRegion = {
    latitude: activeBuses[0]?.currentLocation?.latitude ?? 33.8938,
    longitude: activeBuses[0]?.currentLocation?.longitude ?? 35.5018,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleLogout = () => {
    setMenuOpen(false);
    router.replace("/");
  };

  const goToBookRide = () => {
    router.push({
      pathname: "/book_ride",
      params: { studentId },
    });
  };

  const goToMyBookings = () => {
    router.push({
      pathname: "/my-bookings",
      params: { studentId },
    });
  };

  const goToTransactionHistory = () => {
    router.push({
      pathname: "/transaction_history",
      params: { studentId },
    });
  };

  const goToProfile = () => {
    router.push({
      pathname: "/profile",
      params: { studentId },
    });
  };
  const goToAlerts = async () => {
    setAlertCount(0);

    if (studentId) {
      try {
        await fetch(`${API_BASE}/mark_student_alerts_seen.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            student_id: studentId,
          }),
        });
      } catch {
        // Do not block navigation if marking seen fails.
      }
    }

    router.push({
      pathname: "/student_alerts",
      params: { studentId },
    });
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.menuButton}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.menuButtonText}>☰</Text>
          </Pressable>

          <Pressable style={styles.alertButton} onPress={goToAlerts}>
            <Text style={styles.alertIcon}>🔔</Text>

            {alertCount > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>
                  {alertCount > 99 ? "99+" : alertCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View>
          <Text style={styles.headerTitle}>Tap&Go</Text>
          <Text style={styles.headerSubtitle}>Student Dashboard</Text>
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
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.nameText}>{firstName}</Text>

          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Credit Balance</Text>
            <Text style={styles.balanceValue}>{balance} credits</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Buses Live Map</Text>
          <Text style={styles.sectionSubtitle}>
            Track currently active buses, routes, and stops
          </Text>
        </View>

        <View style={styles.mapCard}>
          {loadingBuses && activeBuses.length === 0 ? (
            <View style={styles.mapLoadingBox}>
              <ActivityIndicator size="large" color="#1D4ED8" />
              <Text style={styles.mapLoadingText}>Loading live buses...</Text>
            </View>
          ) : busError ? (
            <View style={styles.mapLoadingBox}>
              <Text style={styles.mapErrorText}>{busError}</Text>

              <Pressable style={styles.retryButton} onPress={fetchActiveBuses}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : activeBuses.length === 0 ? (
            <View style={styles.mapLoadingBox}>
              <Text style={styles.mapLoadingText}>
                No active buses available right now.
              </Text>
            </View>
          ) : (
            <MapView style={styles.map} initialRegion={initialMapRegion}>
              {activeBuses.map((bus) => (
                <React.Fragment key={bus.id}>
                  {bus.routePath?.length > 0 && (
                    <Polyline
                      coordinates={bus.routePath}
                      strokeWidth={4}
                      strokeColor="#2563EB"
                    />
                  )}

                  {bus.currentLocation && (
                    <Marker
                      coordinate={bus.currentLocation}
                      title={bus.busNumber}
                      description={`${bus.routeName} | Driver: ${bus.driverName}`}
                    />
                  )}

                  {bus.stops?.map((stop) => (
                    <Marker
                      key={`${bus.id}-${stop.id}`}
                      coordinate={{
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                      }}
                      title={stop.name}
                      description={`Stop on ${bus.busNumber}`}
                      pinColor="green"
                    />
                  ))}
                </React.Fragment>
              ))}
            </MapView>
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Pressable style={styles.cardActionButton} onPress={goToBookRide}>
              <Text style={styles.cardActionButtonText}>Book a Ride</Text>
            </Pressable>

            <Text style={styles.infoText}>
              Reserve your seat for the next trip.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Balance</Text>
            <Text style={styles.infoText}>
              Monitor credits and ride payments.
            </Text>
          </View>
        </View>
      </ScrollView>

      {menuOpen && (
        <View style={styles.overlay}>
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => setMenuOpen(false)}
          />

          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>Tap&Go Menu</Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setTimeout(goToBookRide, 150);
              }}
            >
              <Text style={styles.menuItemText}>Book a Ride</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setTimeout(goToMyBookings, 150);
              }}
            >
              <Text style={styles.menuItemText}>My Bookings</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setTimeout(goToTransactionHistory, 150);
              }}
            >
              <Text style={styles.menuItemText}>Transaction History</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setTimeout(goToProfile, 150);
              }}
            >
              <Text style={styles.menuItemText}>Profile</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setTimeout(goToAlerts, 150);
              }}
            >
              <Text style={styles.menuItemText}>Alerts</Text>
            </Pressable>

            <Pressable style={styles.menuItemLogout} onPress={handleLogout}>
              <Text style={styles.menuItemLogoutText}>Logout</Text>
            </Pressable>

            <View style={styles.menuBottom}>
              <Text style={styles.contactLabel}>Contact Support</Text>
              <Text style={styles.contactNumber}>+961 70 123 456</Text>
            </View>
          </View>
        </View>
      )}
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

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    gap: 10,
  },

  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#182235",
    alignItems: "center",
    justifyContent: "center",
  },

  menuButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  alertButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#182235",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  alertIcon: {
    fontSize: 22,
  },

  alertBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#0B1220",
  },

  alertBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
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

  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },

  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 6,
  },

  nameText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 18,
  },

  balanceBox: {
    backgroundColor: "#EEF4FF",
    borderRadius: 18,
    padding: 16,
  },

  balanceLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 6,
  },

  balanceValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },

  sectionSubtitle: {
    color: "#AAB4C3",
    fontSize: 13,
  },

  mapCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },

  map: {
    width: "100%",
    height: 320,
  },

  mapLoadingBox: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },

  mapLoadingText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },

  mapErrorText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    marginTop: 14,
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    width: (width - 52) / 2,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 8,
  },

  cardActionButton: {
    paddingVertical: 4,
  },

  cardActionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },

  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sideMenu: {
    width: 290,
    backgroundColor: "#FFFFFF",
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: "space-between",
  },

  menuTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 28,
  },

  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  menuItemText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },

  menuItemLogout: {
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  menuItemLogoutText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#B91C1C",
  },

  menuBottom: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  contactLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },

  contactNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1D4ED8",
  },
});
