import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

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

type DayKey = "Today" | "Tomorrow" | "Saturday" | "Sunday";

export default function BookRideScreen() {
  const [selectedDay, setSelectedDay] = useState<DayKey>("Today");
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const dayOptions: DayKey[] = ["Today", "Tomorrow", "Saturday", "Sunday"];

  const busDataByDay: Record<DayKey, Bus[]> = {
    Today: [
      {
        id: 1,
        busNumber: "BUS-101",
        driverName: "Ali Hassan",
        driverPhone: "03 123 456",
        bookedSeats: 22,
        capacity: 33,
        isActive: true,
        routeName: "Campus → Hamra → Downtown",
        currentLocation: { latitude: 33.8938, longitude: 35.5018 },
        routePath: [
          { latitude: 33.8925, longitude: 35.4985 },
          { latitude: 33.8938, longitude: 35.5018 },
          { latitude: 33.8954, longitude: 35.5074 },
          { latitude: 33.8972, longitude: 35.5124 },
        ],
        stops: [
          { id: 1, name: "Campus Gate", latitude: 33.8925, longitude: 35.4985 },
          { id: 2, name: "Bliss Stop", latitude: 33.8938, longitude: 35.5018 },
          { id: 3, name: "Hamra Main", latitude: 33.8954, longitude: 35.5074 },
          { id: 4, name: "Downtown", latitude: 33.8972, longitude: 35.5124 },
        ],
      },
      {
        id: 2,
        busNumber: "BUS-204",
        driverName: "Omar Khaled",
        driverPhone: "71 222 333",
        bookedSeats: 33,
        capacity: 33,
        isActive: true,
        routeName: "Campus → Cola → Airport Road",
        currentLocation: { latitude: 33.8866, longitude: 35.4954 },
        routePath: [
          { latitude: 33.8925, longitude: 35.4985 },
          { latitude: 33.8907, longitude: 35.4948 },
          { latitude: 33.8889, longitude: 35.4909 },
          { latitude: 33.8866, longitude: 35.4954 },
        ],
        stops: [
          { id: 5, name: "Campus Gate", latitude: 33.8925, longitude: 35.4985 },
          { id: 6, name: "Cola Bridge", latitude: 33.8907, longitude: 35.4948 },
          { id: 7, name: "Sabra Stop", latitude: 33.8889, longitude: 35.4909 },
          {
            id: 8,
            name: "Airport Road",
            latitude: 33.8866,
            longitude: 35.4954,
          },
        ],
      },
      {
        id: 3,
        busNumber: "BUS-315",
        driverName: "Hadi Nasser",
        driverPhone: "70 444 555",
        bookedSeats: 16,
        capacity: 30,
        isActive: true,
        routeName: "Campus → Verdun → Raouche",
        currentLocation: { latitude: 33.8899, longitude: 35.4838 },
        routePath: [
          { latitude: 33.8925, longitude: 35.4985 },
          { latitude: 33.891, longitude: 35.4925 },
          { latitude: 33.8901, longitude: 35.4875 },
          { latitude: 33.8899, longitude: 35.4838 },
        ],
        stops: [
          { id: 9, name: "Campus Gate", latitude: 33.8925, longitude: 35.4985 },
          { id: 10, name: "Verdun", latitude: 33.891, longitude: 35.4925 },
          {
            id: 11,
            name: "Ain El Tineh",
            latitude: 33.8901,
            longitude: 35.4875,
          },
          { id: 12, name: "Raouche", latitude: 33.8899, longitude: 35.4838 },
        ],
      },
    ],
    Tomorrow: [
      {
        id: 4,
        busNumber: "BUS-401",
        driverName: "Karim Saad",
        driverPhone: "76 100 200",
        bookedSeats: 12,
        capacity: 28,
        isActive: true,
        routeName: "Campus → Jnah → Choueifat",
        currentLocation: { latitude: 33.8708, longitude: 35.4833 },
        routePath: [
          { latitude: 33.8925, longitude: 35.4985 },
          { latitude: 33.886, longitude: 35.491 },
          { latitude: 33.8789, longitude: 35.486 },
          { latitude: 33.8708, longitude: 35.4833 },
        ],
        stops: [
          {
            id: 13,
            name: "Campus Gate",
            latitude: 33.8925,
            longitude: 35.4985,
          },
          { id: 14, name: "Jnah", latitude: 33.886, longitude: 35.491 },
          { id: 15, name: "Ouzai", latitude: 33.8789, longitude: 35.486 },
          { id: 16, name: "Choueifat", latitude: 33.8708, longitude: 35.4833 },
        ],
      },
    ],
    Saturday: [],
    Sunday: [],
  };

  const buses = busDataByDay[selectedDay];

  const selectedBus = useMemo(() => {
    return buses.find((bus) => bus.id === selectedBusId) ?? null;
  }, [buses, selectedBusId]);

  const mapBuses = selectedBus ? [selectedBus] : buses;

  const handleSelectBus = (bus: Bus) => {
    if (bus.bookedSeats >= bus.capacity) {
      Alert.alert("Bus Full", "This bus is already full.");
      return;
    }
    setSelectedBusId(bus.id);
  };

  const clearSelectedBus = () => {
    setSelectedBusId(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedBus) {
      Alert.alert("No bus selected", "Please select a bus first.");
      return;
    }

    try {
      setLoadingBooking(true);

      const response = await fetch(
        "https://nonliturgic-lakenya-haggishly.ngrok-free.dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: 1,
            bus_id: selectedBus.id,
            booking_date: selectedDay,
          }),
        },
      );

      const raw = await response.text();
      const data = JSON.parse(raw);

      if (data.success) {
        Alert.alert(
          "Booking Confirmed",
          `Your seat on ${selectedBus.busNumber} has been booked successfully.`,
        );
        setSelectedBusId(null);
      } else {
        Alert.alert("Booking Failed", data.message || "Something went wrong.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not confirm booking.");
    } finally {
      setLoadingBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Book a Ride</Text>
          <Text style={styles.headerSubtitle}>
            Choose a date, view routes, and pick a bus
          </Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabs}
        >
          {dayOptions.map((day) => {
            const active = day === selectedDay;

            return (
              <Pressable
                key={day}
                style={[styles.dayTab, active && styles.dayTabActive]}
                onPress={() => {
                  setSelectedDay(day);
                  setSelectedBusId(null);
                }}
              >
                <Text
                  style={[styles.dayTabText, active && styles.dayTabTextActive]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.mapHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Map</Text>
            <Text style={styles.sectionSubtitle}>
              {selectedBus
                ? `Showing ${selectedBus.busNumber} route only`
                : "Showing all buses, routes, and stops"}
            </Text>
          </View>

          {selectedBus && (
            <Pressable style={styles.clearButton} onPress={clearSelectedBus}>
              <Text style={styles.clearButtonText}>Show All</Text>
            </Pressable>
          )}
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
            {mapBuses.map((bus) => (
              <React.Fragment key={bus.id}>
                <Polyline
                  coordinates={bus.routePath}
                  strokeWidth={4}
                  strokeColor="#2563EB"
                />

                <Marker
                  coordinate={bus.currentLocation}
                  title={bus.busNumber}
                  description={`${bus.routeName} | Driver: ${bus.driverName}`}
                />

                {bus.stops.map((stop) => (
                  <Marker
                    key={stop.id}
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
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Available Buses</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a bus to focus only on its route
          </Text>
        </View>

        {buses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No buses available</Text>
            <Text style={styles.emptyText}>
              There are no scheduled buses for {selectedDay}.
            </Text>
          </View>
        ) : (
          buses.map((bus) => {
            const isFull = bus.bookedSeats >= bus.capacity;
            const isSelected = selectedBusId === bus.id;

            return (
              <Pressable
                key={bus.id}
                style={[
                  styles.busCard,
                  isSelected && styles.busCardSelected,
                  isFull && styles.busCardDisabled,
                ]}
                disabled={isFull}
                onPress={() => handleSelectBus(bus)}
              >
                <View style={styles.busTopRow}>
                  <View>
                    <Text style={styles.busNumber}>{bus.busNumber}</Text>
                    <Text style={styles.routeName}>{bus.routeName}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isFull ? styles.fullBadge : styles.openBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isFull ? styles.fullText : styles.openText,
                      ]}
                    >
                      {isFull ? "Full" : "Available"}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Driver</Text>
                  <Text style={styles.infoValue}>{bus.driverName}</Text>
                  <Text style={styles.infoSubValue}>{bus.driverPhone}</Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Booked rides</Text>
                  <Text style={styles.infoValue}>
                    {bus.bookedSeats}/{bus.capacity}
                  </Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Stops</Text>
                  <Text style={styles.infoSubValue}>
                    {bus.stops.map((stop) => stop.name).join(" • ")}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}

        {selectedBus && (
          <View style={styles.confirmContainer}>
            <View style={styles.selectedSummaryCard}>
              <Text style={styles.selectedSummaryTitle}>Selected Bus</Text>
              <Text style={styles.selectedSummaryText}>
                {selectedBus.busNumber} • {selectedBus.driverName}
              </Text>
              <Text style={styles.selectedSummaryText}>
                {selectedBus.bookedSeats}/{selectedBus.capacity} seats booked
              </Text>
            </View>

            <Pressable
              style={[
                styles.confirmButton,
                loadingBooking && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmBooking}
              disabled={loadingBooking}
            >
              <Text style={styles.confirmButtonText}>
                {loadingBooking
                  ? "Confirming..."
                  : `Confirm Booking (${selectedBus.busNumber})`}
              </Text>
            </Pressable>
          </View>
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
  dayTabs: {
    paddingBottom: 14,
  },
  dayTab: {
    backgroundColor: "#182235",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 10,
  },
  dayTabActive: {
    backgroundColor: "#FFFFFF",
  },
  dayTabText: {
    color: "#D1D5DB",
    fontWeight: "700",
  },
  dayTabTextActive: {
    color: "#111827",
  },
  mapHeaderRow: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#AAB4C3",
    fontSize: 13,
    marginTop: 4,
  },
  clearButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  mapCard: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },
  map: {
    width: "100%",
    height: 320,
  },
  listHeader: {
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  busCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  busCardSelected: {
    borderWidth: 2,
    borderColor: "#1D4ED8",
  },
  busCardDisabled: {
    opacity: 0.7,
  },
  busTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  busNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  routeName: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  openBadge: {
    backgroundColor: "#DCFCE7",
  },
  fullBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontWeight: "700",
    fontSize: 12,
  },
  openText: {
    color: "#166534",
  },
  fullText: {
    color: "#991B1B",
  },
  infoBlock: {
    marginBottom: 10,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  infoSubValue: {
    color: "#374151",
    fontSize: 14,
    marginTop: 2,
    lineHeight: 20,
  },
  confirmContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  selectedSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  selectedSummaryTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  selectedSummaryText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 22,
  },
  confirmButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
