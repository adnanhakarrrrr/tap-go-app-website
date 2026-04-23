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
  View,
} from "react-native";

type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";

type Booking = {
  id: number;
  busNumber: string;
  route: string;
  driverName: string;
  driverPhone: string;
  date: string;
  pickupStop: string;
  status: BookingStatus;
};

type FilterType = "All" | "Upcoming" | "Past" | "Cancelled";
const params = useLocalSearchParams();
const studentId =
  typeof params.studentId === "string" ? Number(params.studentId) : 0;
const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

export default function MyBookingsScreen() {
  const params = useLocalSearchParams();
  const studentId =
    typeof params.studentId === "string" ? Number(params.studentId) : 0;

  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/get_bookings.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            student_id: studentId,
          }),
        });

        const raw = await res.text();

        let data: any;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error("Bookings response was not valid JSON.");
        }

        if (data.success) {
          const formatted = data.bookings.map((b: any) => ({
            id: Number(b.booking_id),
            busNumber: b.bus_number,
            route: b.route_name,
            driverName: b.driver_name,
            driverPhone: b.driver_phone,
            date: b.booking_day,
            pickupStop: "N/A",
            status: b.status as BookingStatus,
          }));

          setBookings(formatted);
        } else {
          Alert.alert("Error", data.error || "Could not load bookings.");
        }
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Could not fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [studentId]);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "All") return bookings;
    if (activeFilter === "Upcoming") {
      return bookings.filter(
        (booking) =>
          booking.status === "Confirmed" || booking.status === "Pending",
      );
    }
    if (activeFilter === "Past") {
      return bookings.filter((booking) => booking.status === "Completed");
    }
    return bookings.filter((booking) => booking.status === "Cancelled");
  }, [activeFilter, bookings]);

  const handleCancelBooking = (bookingId: number, busNumber: string) => {
    Alert.alert(
      "Cancel this booking?",
      `Are you sure you want to cancel your reservation for ${busNumber}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            if (!studentId || !bookingId) {
              Alert.alert("Error", "Missing booking or student information.");
              return;
            }

            try {
              const res = await fetch(`${API_BASE}/cancel_booking.php`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                  student_id: studentId,
                  booking_id: bookingId,
                }),
              });

              const raw = await res.text();

              let data: any;
              try {
                data = JSON.parse(raw);
              } catch {
                throw new Error("Cancel response was not valid JSON.");
              }

              if (data.success) {
                setBookings((prevBookings) =>
                  prevBookings.map((booking) =>
                    booking.id === bookingId
                      ? { ...booking, status: "Cancelled" }
                      : booking,
                  ),
                );

                Alert.alert("Success", "Booking cancelled successfully.");
              } else {
                Alert.alert("Error", data.error || "Could not cancel booking.");
              }
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Something went wrong.");
            }
          },
        },
      ],
    );
  };

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case "Confirmed":
        return styles.statusConfirmed;
      case "Pending":
        return styles.statusPending;
      case "Completed":
        return styles.statusCompleted;
      case "Cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusCompleted;
    }
  };

  const getStatusTextStyle = (status: BookingStatus) => {
    switch (status) {
      case "Confirmed":
        return styles.statusTextConfirmed;
      case "Pending":
        return styles.statusTextPending;
      case "Completed":
        return styles.statusTextCompleted;
      case "Cancelled":
        return styles.statusTextCancelled;
      default:
        return styles.statusTextCompleted;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>
            View and manage your booked rides
          </Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(["All", "Upcoming", "Past", "Cancelled"] as FilterType[]).map(
          (filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ),
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>
              Loading bookings...
            </Text>
          </View>
        ) : !studentId ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Student not found</Text>
            <Text style={styles.emptyText}>
              Please go back and log in again.
            </Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptyText}>
              There are no bookings in this category yet.
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => {
            const canCancel =
              booking.status === "Confirmed" || booking.status === "Pending";

            return (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.busNumber}>{booking.busNumber}</Text>

                  <View
                    style={[styles.statusBadge, getStatusStyle(booking.status)]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        getStatusTextStyle(booking.status),
                      ]}
                    >
                      {booking.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.routeText}>{booking.route}</Text>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Driver</Text>
                  <Text style={styles.infoValue}>{booking.driverName}</Text>
                  <Text style={styles.infoSubValue}>{booking.driverPhone}</Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{booking.date}</Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Pickup Stop</Text>
                  <Text style={styles.infoValue}>{booking.pickupStop}</Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.detailsButton}
                    onPress={() =>
                      Alert.alert(
                        booking.busNumber,
                        `Route: ${booking.route}\nDriver: ${booking.driverName}\nPhone: ${booking.driverPhone}\nDate: ${booking.date}\nPickup: ${booking.pickupStop}\nStatus: ${booking.status}`,
                      )
                    }
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </Pressable>

                  {canCancel && (
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() =>
                        handleCancelBooking(booking.id, booking.busNumber)
                      }
                    >
                      <Text style={styles.cancelButtonText}>
                        Cancel Booking
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#0B1220",
  },
  filterButton: {
    backgroundColor: "#182235",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  filterButtonTextActive: {
    color: "#111827",
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
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  busNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  routeText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 18,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusConfirmed: {
    backgroundColor: "#DCFCE7",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusCompleted: {
    backgroundColor: "#DBEAFE",
  },
  statusCancelled: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
  },
  statusTextConfirmed: {
    color: "#166534",
  },
  statusTextPending: {
    color: "#92400E",
  },
  statusTextCompleted: {
    color: "#1D4ED8",
  },
  statusTextCancelled: {
    color: "#B91C1C",
  },
  infoBlock: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  infoSubValue: {
    fontSize: 16,
    color: "#374151",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#1D4ED8",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "800",
  },
});
