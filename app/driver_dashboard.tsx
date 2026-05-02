import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

type MapPoint = {
  latitude: number;
  longitude: number;
};

type Stop = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  stopOrder?: number;
};

type DriverBus = {
  bus_id: number;
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  capacity: number;
  booked_seats: number;
  route_name: string;
  available_date: string;
  current_latitude: number | null;
  current_longitude: number | null;
  total_bookings: number;
  routePath: MapPoint[];
  stops: Stop[];
};

export default function DriverDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [driverId, setDriverId] = useState(String(params.driverId || ""));
  const [driverName, setDriverName] = useState(
    String(params.driverName || "Driver"),
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [buses, setBuses] = useState<DriverBus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDriver();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchDriverBuses();
    }
  }, [driverId, selectedDate]);

  const loadDriver = async () => {
    const storedDriverId = await AsyncStorage.getItem("driver_id");
    const storedDriverName = await AsyncStorage.getItem("driver_name");

    if (storedDriverId) {
      setDriverId(storedDriverId);
    }

    if (storedDriverName) {
      setDriverName(storedDriverName);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("driver_id");
      await AsyncStorage.removeItem("driver_name");

      router.replace("/");
    } catch (error: any) {
      Alert.alert("Logout error", error?.message || String(error));
    }
  };

  const normalizeBus = (bus: any): DriverBus => {
    const routePathRaw = bus.routePath || bus.route_path || [];
    const stopsRaw = bus.stops || bus.bus_stops || [];

    return {
      bus_id: Number(bus.bus_id),
      bus_number: String(bus.bus_number || ""),
      driver_name: String(bus.driver_name || ""),
      driver_phone: String(bus.driver_phone || ""),
      capacity: Number(bus.capacity || 0),
      booked_seats: Number(bus.booked_seats || 0),
      route_name: String(bus.route_name || ""),
      available_date: String(bus.available_date || ""),
      current_latitude:
        bus.current_latitude === null || bus.current_latitude === undefined
          ? null
          : Number(bus.current_latitude),
      current_longitude:
        bus.current_longitude === null || bus.current_longitude === undefined
          ? null
          : Number(bus.current_longitude),
      total_bookings: Number(bus.total_bookings || 0),
      routePath: Array.isArray(routePathRaw)
        ? routePathRaw
            .map((point: any) => ({
              latitude: Number(point.latitude),
              longitude: Number(point.longitude),
            }))
            .filter(
              (point: MapPoint) =>
                Number.isFinite(point.latitude) &&
                Number.isFinite(point.longitude),
            )
        : [],
      stops: Array.isArray(stopsRaw)
        ? stopsRaw
            .map((stop: any) => ({
              id: Number(stop.id),
              name: String(stop.name || "Stop"),
              latitude: Number(stop.latitude),
              longitude: Number(stop.longitude),
              stopOrder:
                stop.stopOrder !== undefined
                  ? Number(stop.stopOrder)
                  : stop.stop_order !== undefined
                    ? Number(stop.stop_order)
                    : undefined,
            }))
            .filter(
              (stop: Stop) =>
                Number.isFinite(stop.latitude) &&
                Number.isFinite(stop.longitude),
            )
        : [],
    };
  };

  const fetchDriverBuses = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/driver_buses.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          driver_id: driverId,
          date: selectedDate,
        }),
      });

      const raw = await response.text();
      console.log("DRIVER BUSES RAW:", raw);

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Driver buses response was not valid JSON.");
      }

      if (data.success) {
        const formattedBuses = Array.isArray(data.buses)
          ? data.buses.map(normalizeBus)
          : [];

        setBuses(formattedBuses);
      } else {
        Alert.alert("Error", data.message || "Could not load buses.");
      }
    } catch (error: any) {
      console.log("DRIVER BUSES ERROR:", error);
      Alert.alert("Error", error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (amount: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + amount);
    setSelectedDate(current.toISOString().slice(0, 10));
  };

  const openBus = (bus: DriverBus) => {
    router.push({
      pathname: "/driver_bus_students",
      params: {
        busId: String(bus.bus_id),
        busNumber: bus.bus_number,
        routeName: bus.route_name,
        date: selectedDate,
      },
    });
  };

  const mapRegion = useMemo(() => {
    const coordinates: MapPoint[] = [];

    buses.forEach((bus) => {
      if (
        bus.current_latitude !== null &&
        bus.current_longitude !== null &&
        Number.isFinite(bus.current_latitude) &&
        Number.isFinite(bus.current_longitude)
      ) {
        coordinates.push({
          latitude: bus.current_latitude,
          longitude: bus.current_longitude,
        });
      }

      bus.routePath?.forEach((point) => {
        if (
          Number.isFinite(point.latitude) &&
          Number.isFinite(point.longitude)
        ) {
          coordinates.push({
            latitude: point.latitude,
            longitude: point.longitude,
          });
        }
      });

      bus.stops?.forEach((stop) => {
        if (Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude)) {
          coordinates.push({
            latitude: stop.latitude,
            longitude: stop.longitude,
          });
        }
      });
    });

    if (coordinates.length === 0) {
      return {
        latitude: 33.8925,
        longitude: 35.4985,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const latitudes = coordinates.map((point) => point.latitude);
    const longitudes = coordinates.map((point) => point.longitude);

    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);

    const latitudeDelta = Math.max((maxLatitude - minLatitude) * 1.5, 0.03);
    const longitudeDelta = Math.max((maxLongitude - minLongitude) * 1.5, 0.03);

    return {
      latitude: (minLatitude + maxLatitude) / 2,
      longitude: (minLongitude + maxLongitude) / 2,
      latitudeDelta,
      longitudeDelta,
    };
  }, [buses]);

  const renderBus = ({ item }: { item: DriverBus }) => {
    return (
      <Pressable style={styles.busItem} onPress={() => openBus(item)}>
        <View style={styles.busInfo}>
          <Text style={styles.busTitle}>{item.bus_number}</Text>
          <Text style={styles.busRoute}>{item.route_name}</Text>

          <Text style={styles.busSmall}>
            Capacity: {item.capacity} | Booked seats: {item.booked_seats}
          </Text>

          <Text style={styles.busSmall}>
            Current bookings today: {item.total_bookings}
          </Text>

          <Text style={styles.busSmall}>
            Stops: {item.stops.length} | Route points: {item.routePath.length}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.total_bookings}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextBox}>
              <Text style={styles.title}>Welcome driver {driverName}</Text>
              <Text style={styles.subtitle}>
                Select a date, view your buses on the map, and open a bus to see
                booked students.
              </Text>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dateCard}>
          <Text style={styles.sectionTitle}>Select date</Text>

          <View style={styles.dateRow}>
            <Pressable style={styles.dateButton} onPress={() => changeDate(-1)}>
              <Text style={styles.dateButtonText}>Previous</Text>
            </Pressable>

            <Text style={styles.dateText}>{selectedDate}</Text>

            <Pressable style={styles.dateButton} onPress={() => changeDate(1)}>
              <Text style={styles.dateButtonText}>Next</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Map of your buses</Text>

            {loading ? (
              <ActivityIndicator color="#1D4ED8" />
            ) : (
              <Text style={styles.countText}>{buses.length} buses</Text>
            )}
          </View>

          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            region={mapRegion}
          >
            {buses.map((bus) => {
              const hasBusLocation =
                bus.current_latitude !== null &&
                bus.current_longitude !== null &&
                Number.isFinite(bus.current_latitude) &&
                Number.isFinite(bus.current_longitude);

              return (
                <React.Fragment key={String(bus.bus_id)}>
                  {bus.routePath.length > 0 && (
                    <Polyline
                      coordinates={bus.routePath}
                      strokeWidth={4}
                      strokeColor="#2563EB"
                    />
                  )}

                  {hasBusLocation && (
                    <Marker
                      coordinate={{
                        latitude: bus.current_latitude as number,
                        longitude: bus.current_longitude as number,
                      }}
                      title={bus.bus_number}
                      description={`${bus.route_name} | ${bus.total_bookings} bookings`}
                      onCalloutPress={() => openBus(bus)}
                    />
                  )}

                  {bus.stops.map((stop) => (
                    <Marker
                      key={`${bus.bus_id}-${stop.id}`}
                      coordinate={{
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                      }}
                      title={stop.name}
                      description={`Stop on ${bus.bus_number}`}
                      pinColor="green"
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </MapView>
        </View>

        <View style={styles.listCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your buses</Text>
            <Text style={styles.countText}>{selectedDate}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#1D4ED8" />
              <Text style={styles.loadingText}>Loading buses...</Text>
            </View>
          ) : buses.length === 0 ? (
            <Text style={styles.emptyText}>
              No buses assigned to you for this date.
            </Text>
          ) : (
            <FlatList
              data={buses}
              keyExtractor={(item) => String(item.bus_id)}
              renderItem={renderBus}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 24,
    marginBottom: 18,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  headerTextBox: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 34,
  },

  subtitle: {
    color: "#AAB4C3",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  logoutButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    marginTop: 2,
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },

  dateButton: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  dateText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },

  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  countText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },

  map: {
    height: 320,
    borderRadius: 18,
    marginTop: 14,
    overflow: "hidden",
  },

  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 32,
  },

  loadingBox: {
    paddingVertical: 26,
    alignItems: "center",
  },

  loadingText: {
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 10,
  },

  emptyText: {
    color: "#6B7280",
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 28,
  },

  busItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  busInfo: {
    flex: 1,
    paddingRight: 12,
  },

  busTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },

  busRoute: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
  },

  busSmall: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5,
  },

  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
