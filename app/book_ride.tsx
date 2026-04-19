import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  ridePrice: number;
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

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

const FIXED_RIDE_PRICE = 1;

export default function BookRideScreen() {
  const params = useLocalSearchParams();
const studentId =
  typeof params.studentId === "string" ? Number(params.studentId) : 0;
  const [selectedDay, setSelectedDay] = useState<DayKey>("Today");
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const dayOptions: DayKey[] = ["Today", "Tomorrow", "Saturday", "Sunday"];

  const selectedBus = useMemo(() => {
    return buses.find((bus) => bus.id === selectedBusId) ?? null;
  }, [buses, selectedBusId]);

  const mapBuses = selectedBus ? [selectedBus] : buses;

  const fetchBuses = async (day: DayKey, area: string = "") => {
    try {
      setLoadingBuses(true);
      setFetchError("");

      const url = `${API_BASE}/get_buses.php?day=${encodeURIComponent(day)}&area=${encodeURIComponent(area)}`;

      const response = await fetch(url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const text = await response.text();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return valid JSON.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load buses.");
      }

      const fetchedBuses = Array.isArray(data.buses) ? data.buses : [];

      setBuses(
        fetchedBuses.map((bus: any) => ({
          ...bus,
          ridePrice: FIXED_RIDE_PRICE,
        })),
      );
    } catch (error: any) {
      setBuses([]);
      setFetchError(error?.message || "Could not load buses.");
    } finally {
      setLoadingBuses(false);
    }
  };

  useEffect(() => {
    fetchBuses(selectedDay, searchText);
  }, [selectedDay]);

  const handleSearch = async () => {
    setSelectedBusId(null);
    await fetchBuses(selectedDay, searchText.trim());
  };

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
    body: JSON.stringify({
  student_id: studentId,
  bus_id: selectedBus.id,
  booking_day: selectedDay,
}),
    }

    if (!studentId) {
      Alert.alert("Missing student ID", "Please log in again.");
      return;
    }

    try {
      setLoadingBooking(true);

      const response = await fetch(`${API_BASE}/book_ride.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          student_id: Number(studentId),
          bus_id: selectedBus.id,
          booking_day: selectedDay,
        }),
      });

      const raw = await response.text();

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Booking response was not valid JSON.");
      }

      if (data.success) {
        Alert.alert(
          "Booking Confirmed",
          `Your seat on ${selectedBus.busNumber} has been booked successfully for ${selectedBus.ridePrice} credit.`,
        );
        setSelectedBusId(null);
        await fetchBuses(selectedDay, searchText.trim());
      } else {
        Alert.alert("Booking Failed", data.message || "Something went wrong.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not confirm booking.");
    } finally {
      setLoadingBooking(false);
    }
  };

  const initialMapRegion = {
    latitude:
      mapBuses[0]?.currentLocation?.latitude ??
      buses[0]?.currentLocation?.latitude ??
      33.8938,
    longitude:
      mapBuses[0]?.currentLocation?.longitude ??
      buses[0]?.currentLocation?.longitude ??
      35.5018,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Book a Ride</Text>
          <Text style={styles.headerSubtitle}>
            Search nearest stop, view routes, and pick a bus
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

        <View style={styles.searchCard}>
          <Text style={styles.sectionTitle}>Search by nearest area / stop</Text>
          <Text style={styles.sectionSubtitle}>
            Example: Hamra, Verdun, Downtown, Airport Road
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Type nearest stop or area"
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />

            <Pressable style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </Pressable>
          </View>
        </View>

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
          <MapView style={styles.map} initialRegion={initialMapRegion}>
            {mapBuses.map((bus) => (
              <React.Fragment key={bus.id}>
                {bus.routePath?.length > 0 && (
                  <Polyline
                    coordinates={bus.routePath}
                    strokeWidth={4}
                    strokeColor="#2563EB"
                  />
                )}

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

        {loadingBuses ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loadingText}>Loading buses...</Text>
          </View>
        ) : fetchError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Could not load buses</Text>
            <Text style={styles.emptyText}>{fetchError}</Text>
          </View>
        ) : buses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No buses found</Text>
            <Text style={styles.emptyText}>
              No buses matched your selected day or area search.
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
                  <Text style={styles.infoLabel}>Price</Text>
                  <Text style={styles.infoValue}>{bus.ridePrice} credit</Text>
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
              <Text style={styles.selectedSummaryText}>
                Price: {selectedBus.ridePrice} credit
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
                  : `Confirm Booking (${selectedBus.busNumber} • ${selectedBus.ridePrice} credit)`}
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
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  searchRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  mapHeaderRow: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#6B7280",
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
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#374151",
    fontSize: 14,
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
