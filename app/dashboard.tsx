import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const params = useLocalSearchParams();

  const firstName = useMemo(() => {
    const fullName =
      typeof params.fullName === "string" ? params.fullName : "Student";
    return fullName.trim().split(" ")[0] || "Student";
  }, [params.fullName]);

  const balance = typeof params.balance === "string" ? params.balance : "0.00";
  const studentId =
    typeof params.studentId === "string" ? params.studentId : "";

  const [menuOpen, setMenuOpen] = useState(false);

  const activeBuses = [
    {
      id: 1,
      title: "Bus 101",
      description: "Route A - Campus to Downtown",
      latitude: 33.8938,
      longitude: 35.5018,
    },
    {
      id: 2,
      title: "Bus 204",
      description: "Route B - Campus to North Station",
      latitude: 33.8995,
      longitude: 35.5092,
    },
    {
      id: 3,
      title: "Bus 315",
      description: "Route C - Campus to Hamra",
      latitude: 33.8869,
      longitude: 35.4954,
    },
  ];

  const handleLogout = () => {
    setMenuOpen(false);
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Text style={styles.menuButtonText}>☰</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>Tap&Go</Text>
          <Text style={styles.headerSubtitle}>Student Dashboard</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
            Track currently active buses around your route
          </Text>
        </View>

        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 33.8938,
              longitude: 35.5018,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {activeBuses.map((bus) => (
              <Marker
                key={bus.id}
                coordinate={{
                  latitude: bus.latitude,
                  longitude: bus.longitude,
                }}
                title={bus.title}
                description={bus.description}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                router.push({
                  pathname: "/book_ride",
                  params: { studentId },
                });
              }}
            >
              <Text style={styles.menuItemText}>Book a Ride</Text>
            </Pressable>
            <Text style={styles.infoText}>
              Reserve your seat for the next trip.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Credits</Text>
            <Text style={styles.infoText}>
              Monitor your balance and ride payments.
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
                setTimeout(() => {
                  router.push({
                    pathname: "/book_ride",
                    params: { studentId },
                  });
                }, 150);
              }}
            >
              <Text style={styles.menuItemText}>Book a Ride</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setTimeout(() => {
                  router.push({
                    pathname: "/transaction_history",
                    params: { studentId },
                  });
                }, 150);
              }}
            >
              <Text style={styles.menuItemText}>Transaction History</Text>
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
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#182235",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuButtonText: {
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
