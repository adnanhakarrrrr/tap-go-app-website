import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const API_BASE =
  "https://nonliturgic-lakenya-haggishly.ngrok-free.dev/tapandgo_api";

type BookingStudent = {
  booking_id: string;
  booking_status: string;
  payment_status: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  stop_id: string | null;
  stop_name: string;
  stop_latitude: string | null;
  stop_longitude: string | null;
};

export default function DriverBusStudents() {
  const params = useLocalSearchParams();

  const busId = String(params.busId || "");
  const busNumber = String(params.busNumber || "");
  const routeName = String(params.routeName || "");
  const date = String(params.date || "");

  const [students, setStudents] = useState<BookingStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/driver_bus_students.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          bus_id: busId,
          date,
        }),
      });

      const raw = await response.text();
      console.log("DRIVER BUS STUDENTS RAW:", raw);

      const data = JSON.parse(raw);

      if (data.success) {
        setStudents(data.students || []);
      } else {
        Alert.alert("Error", data.message || "Could not load students.");
      }
    } catch (error: any) {
      console.log("DRIVER BUS STUDENTS ERROR:", error);
      Alert.alert("Error", error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const renderStudent = ({ item }: { item: BookingStudent }) => {
    const isPaid = item.payment_status === "Paid";

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentTopRow}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.full_name}</Text>
            <Text style={styles.studentSmall}>
              Student ID: {item.student_id}
            </Text>
            <Text style={styles.studentSmall}>
              Phone: {item.phone || "N/A"}
            </Text>
            <Text style={styles.studentSmall}>Email: {item.email}</Text>
          </View>

          <View
            style={[
              styles.paymentBadge,
              isPaid ? styles.paidBadge : styles.notPaidBadge,
            ]}
          >
            <Text style={styles.paymentBadgeText}>
              {isPaid ? "Paid" : "Not Paid"}
            </Text>
          </View>
        </View>

        <View style={styles.stopBox}>
          <Text style={styles.stopLabel}>Pick-up stop</Text>
          <Text style={styles.stopName}>{item.stop_name}</Text>

          {item.stop_latitude && item.stop_longitude ? (
            <Text style={styles.stopCoords}>
              Lat: {item.stop_latitude} | Lng: {item.stop_longitude}
            </Text>
          ) : (
            <Text style={styles.stopCoords}>No stop location available</Text>
          )}
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Booking status</Text>
          <Text style={styles.statusText}>{item.booking_status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{busNumber}</Text>
          <Text style={styles.subtitle}>{routeName}</Text>
          <Text style={styles.dateText}>Bookings for {date}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Students to pick up</Text>
            <Text style={styles.countText}>{students.length} students</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#1D4ED8" />
              <Text style={styles.loadingText}>Loading students...</Text>
            </View>
          ) : students.length === 0 ? (
            <Text style={styles.emptyText}>
              No students booked this bus for this date.
            </Text>
          ) : (
            <FlatList
              data={students}
              keyExtractor={(item) => String(item.booking_id)}
              renderItem={renderStudent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
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
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#AAB4C3",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  dateText: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  countText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },
  loadingBox: {
    paddingVertical: 40,
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
    paddingVertical: 40,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 30,
  },
  studentCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  studentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  studentSmall: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5,
  },
  paymentBadge: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  paidBadge: {
    backgroundColor: "#16A34A",
  },
  notPaidBadge: {
    backgroundColor: "#DC2626",
  },
  paymentBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  stopBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
  },
  stopLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 5,
  },
  stopName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  stopCoords: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 5,
  },
  statusBox: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },
  statusText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
});
